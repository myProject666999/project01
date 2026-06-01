package service

import (
	"context"
	"fmt"
	"log"
	"sort"
	"time"

	"yard-scheduling/config"
	"yard-scheduling/model"
	"yard-scheduling/repository"

	"github.com/redis/go-redis/v9"
)

type YardService struct {
	repo  *repository.Repo
	rdb   *redis.Client
	cfg   config.YardConfig
}

func NewYardService(repo *repository.Repo, rdb *redis.Client, cfg config.YardConfig) *YardService {
	return &YardService{repo: repo, rdb: rdb, cfg: cfg}
}

func (s *YardService) InitSlots() error {
	zones, err := s.repo.ListZones()
	if err != nil {
		return err
	}
	for _, z := range zones {
		if err := s.repo.EnsureSlots(z.ID, s.cfg.Bays, s.cfg.Rows, s.cfg.Tiers); err != nil {
			return fmt.Errorf("ensure slots for zone %s: %w", z.ZoneCode, err)
		}
	}
	log.Println("yard slots initialized")
	return nil
}

func (s *YardService) ListZones() ([]model.YardZone, error) {
	return s.repo.ListZones()
}

func (s *YardService) GetPanorama() ([]model.YardSlot, error) {
	return s.repo.GetAllSlotsWithContainers()
}

func (s *YardService) GetBayDetail(zoneID, bay int64) (*model.BayOverview, error) {
	zones, _ := s.repo.ListZones()
	var zoneName, zoneType string
	for _, z := range zones {
		if z.ID == zoneID {
			zoneName = z.ZoneName
			zoneType = z.ZoneType
		}
	}
	slots, err := s.repo.GetSlotsWithContainersByZoneBay(zoneID, bay)
	if err != nil {
		return nil, err
	}
	grid := make([][]*model.YardSlot, s.cfg.Rows+1)
	for i := range grid {
		grid[i] = make([]*model.YardSlot, s.cfg.Tiers+1)
	}
	occupied := 0
	for i := range slots {
		grid[slots[i].Row][slots[i].Tier] = &slots[i]
		if slots[i].Status == "occupied" {
			occupied++
		}
	}
	total := s.cfg.Rows * s.cfg.Tiers
	var util float64
	if total > 0 {
		util = float64(occupied) / float64(total) * 100
	}
	return &model.BayOverview{
		ZoneID:   zoneID,
		ZoneCode: zoneName,
		ZoneType: zoneType,
		Bay:      int(bay),
		Rows:     s.cfg.Rows,
		Tiers:    s.cfg.Tiers,
		Slots:    grid,
		Stats: model.BayStats{
			Total:       total,
			Occupied:    occupied,
			Empty:       total - occupied,
			Utilization: util,
		},
	}, nil
}

func (s *YardService) RecommendSlot(c *model.Container) (*model.StackRecommendation, error) {
	zones, err := s.repo.ListZones()
	if err != nil {
		return nil, err
	}
	var targetZones []model.YardZone
	if c.IsDangerous {
		for _, z := range zones {
			if z.ZoneType == "dangerous" {
				targetZones = append(targetZones, z)
			}
		}
	} else {
		for _, z := range zones {
			if z.ZoneType == "normal" {
				targetZones = append(targetZones, z)
			}
		}
	}
	if len(targetZones) == 0 {
		return nil, fmt.Errorf("no suitable zone for container %s", c.ContainerNo)
	}
	type candidate struct {
		zoneID int64
		bay    int
		row    int
		tier   int
		score  float64
	}
	var candidates []candidate
	for _, z := range targetZones {
		for b := 1; b <= s.cfg.Bays; b++ {
			for rw := 1; rw <= s.cfg.Rows; rw++ {
				topTier, err := s.repo.GetSlotTopTier(z.ID, b, rw)
				if err != nil {
					continue
				}
				targetTier := topTier + 1
				if targetTier > s.cfg.Tiers {
					continue
				}
				slot, err := s.repo.FindEmptySlot(z.ID, b, rw, targetTier)
				if err != nil || slot == nil {
					continue
				}
				var score float64
				if c.DepartureTime != nil {
					slots, _ := s.repo.GetSlotsByZoneBay(z.ID, int64(b))
					containersAbove := 0
					earlierDeparture := false
					for _, sl := range slots {
						if sl.Row == rw && sl.Tier <= topTier && sl.Status == "occupied" {
							ct, _ := s.repo.GetContainerByNo(sl.ContainerNo)
							if ct != nil && ct.DepartureTime != nil && c.DepartureTime != nil {
								if ct.DepartureTime.After(*c.DepartureTime) {
									earlierDeparture = true
								}
							}
						}
					}
					if earlierDeparture {
						score -= 10
					}
					score -= float64(containersAbove) * 2
				}
				score -= float64(topTier) * 0.5
				candidates = append(candidates, candidate{
					zoneID: z.ID,
					bay:    b,
					row:    rw,
					tier:   targetTier,
					score:  score,
				})
			}
		}
	}
	if len(candidates) == 0 {
		return nil, fmt.Errorf("no available slot for container %s", c.ContainerNo)
	}
	sort.Slice(candidates, func(i, j int) bool {
		return candidates[i].score > candidates[j].score
	})
	best := candidates[0]
	reason := fmt.Sprintf("heuristic: depart-first stacking, bay=%d row=%d tier=%d score=%.1f", best.bay, best.row, best.tier, best.score)
	return &model.StackRecommendation{
		ZoneID: best.zoneID,
		Bay:    best.bay,
		Row:    best.row,
		Tier:   best.tier,
		Reason: reason,
	}, nil
}

func (s *YardService) ContainerIn(req *model.ContainerInRequest) (*model.Container, error) {
	arrival, err := time.Parse("2006-01-02T15:04", req.ArrivalTime)
	if err != nil {
		return nil, fmt.Errorf("invalid arrival_time: %w", err)
	}
	c := &model.Container{
		ContainerNo: req.ContainerNo,
		OwnerCode:   req.OwnerCode,
		SizeType:    req.SizeType,
		WeightKg:    req.WeightKg,
		IsDangerous: req.IsDangerous,
		IMOClass:    req.IMOClass,
		ArrivalTime: arrival,
		Status:      "yard",
	}
	if req.DepartureTime != "" {
		dep, err := time.Parse("2006-01-02T15:04", req.DepartureTime)
		if err != nil {
			return nil, fmt.Errorf("invalid departure_time: %w", err)
		}
		c.DepartureTime = &dep
	}
	rec, err := s.RecommendSlot(c)
	if err != nil {
		return nil, err
	}
	slot, err := s.repo.FindEmptySlot(rec.ZoneID, rec.Bay, rec.Row, rec.Tier)
	if err != nil || slot == nil {
		return nil, fmt.Errorf("recommended slot not available")
	}
	lockKey := fmt.Sprintf("slot_lock:%d", slot.ID)
	ctx := context.Background()
	locked, err := s.rdb.SetNX(ctx, lockKey, "stacking", 30*time.Second).Result()
	if err != nil {
		return nil, fmt.Errorf("redis lock error: %w", err)
	}
	if !locked {
		return nil, fmt.Errorf("slot %d is currently locked by another operation", slot.ID)
	}
	defer s.rdb.Del(ctx, lockKey)
	if err := s.repo.UpdateSlotStatus(slot.ID, "occupied"); err != nil {
		return nil, err
	}
	if err := s.repo.CreateContainer(c); err != nil {
		s.repo.UpdateSlotStatus(slot.ID, "empty")
		return nil, err
	}
	if err := s.repo.UpdateContainerSlot(c.ID, slot.ID); err != nil {
		return nil, err
	}
	c.SlotID = &slot.ID
	return c, nil
}

func (s *YardService) ContainerOut(containerNo string) (*model.Container, int, error) {
	c, err := s.repo.GetContainerByNo(containerNo)
	if err != nil {
		return nil, 0, err
	}
	if c == nil {
		return nil, 0, fmt.Errorf("container %s not found", containerNo)
	}
	if c.Status != "yard" {
		return nil, 0, fmt.Errorf("container %s is not in yard (status=%s)", containerNo, c.Status)
	}
	if c.SlotID == nil {
		return nil, 0, fmt.Errorf("container %s has no slot assigned", containerNo)
	}
	above, err := s.repo.GetContainersAboveSlot(*c.SlotID)
	if err != nil {
		return nil, 0, err
	}
	reshuffleCount := len(above)
	for _, ac := range above {
		if err := s.repo.IncrementReshuffle(ac.ID); err != nil {
			log.Printf("increment reshuffle for container %s: %v", ac.ContainerNo, err)
		}
	}
	lockKey := fmt.Sprintf("slot_lock:%d", *c.SlotID)
	ctx := context.Background()
	locked, err := s.rdb.SetNX(ctx, lockKey, "unstacking", 30*time.Second).Result()
	if err != nil {
		return nil, 0, fmt.Errorf("redis lock error: %w", err)
	}
	if !locked {
		return nil, 0, fmt.Errorf("slot is currently locked by another operation")
	}
	defer s.rdb.Del(ctx, lockKey)
	if err := s.repo.UpdateSlotStatus(*c.SlotID, "empty"); err != nil {
		return nil, 0, err
	}
	if err := s.repo.UpdateContainerStatus(c.ID, "out"); err != nil {
		return nil, 0, err
	}
	c.Status = "out"
	c.ReshuffleCount = reshuffleCount
	return c, reshuffleCount, nil
}

func (s *YardService) ListContainers(status string) ([]model.Container, error) {
	return s.repo.ListContainers(status)
}

func (s *YardService) GetContainer(containerNo string) (*model.Container, error) {
	return s.repo.GetContainerByNo(containerNo)
}

func (s *YardService) CreateAppointment(req *model.AppointmentRequest) (*model.Appointment, error) {
	c, err := s.repo.GetContainerByNo(req.ContainerNo)
	if err != nil {
		return nil, err
	}
	if c == nil {
		return nil, fmt.Errorf("container %s not found", req.ContainerNo)
	}
	at, err := time.Parse("2006-01-02T15:04", req.AppointTime)
	if err != nil {
		return nil, fmt.Errorf("invalid appoint_time: %w", err)
	}
	ae, err := time.Parse("2006-01-02T15:04", req.AppointEnd)
	if err != nil {
		return nil, fmt.Errorf("invalid appoint_end: %w", err)
	}
	a := &model.Appointment{
		ContainerID: c.ID,
		TruckPlate:  req.TruckPlate,
		DriverName:  req.DriverName,
		AppointTime: at,
		AppointEnd:  ae,
		Status:      "pending",
	}
	if err := s.repo.CreateAppointment(a); err != nil {
		return nil, err
	}
	a.ContainerNo = c.ContainerNo
	return a, nil
}

func (s *YardService) ListAppointments(status string) ([]model.Appointment, error) {
	return s.repo.ListAppointments(status)
}

func (s *YardService) UpdateAppointmentStatus(id int64, status string) error {
	return s.repo.UpdateAppointmentStatus(id, status)
}
