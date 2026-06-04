package service

import (
	"context"
	"encoding/json"
	"fmt"
	"mountain-rescue-server/internal/model"
	"mountain-rescue-server/internal/repository"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/websocket"
)

type GPSService struct {
	repo          *repository.GPSRepository
	redisClient   *redis.Client
	wsConnections map[int][]*websocket.Conn
}

func NewGPSService(repo *repository.GPSRepository, redisClient *redis.Client) *GPSService {
	return &GPSService{
		repo:          repo,
		redisClient:   redisClient,
		wsConnections: make(map[int][]*websocket.Conn),
	}
}

func (s *GPSService) RegisterWebSocket(missionID int, conn *websocket.Conn) {
	s.wsConnections[missionID] = append(s.wsConnections[missionID], conn)
}

func (s *GPSService) UnregisterWebSocket(missionID int, conn *websocket.Conn) {
	conns := s.wsConnections[missionID]
	for i, c := range conns {
		if c == conn {
			s.wsConnections[missionID] = append(conns[:i], conns[i+1:]...)
			break
		}
	}
}

func (s *GPSService) Broadcast(missionID int, msg model.PositionMessage) {
	conns := s.wsConnections[missionID]
	data, _ := json.Marshal(msg)
	for _, conn := range conns {
		_ = conn.WriteMessage(websocket.TextMessage, data)
	}
}

func (s *GPSService) BatchInsert(points []model.GPSPoint) error {
	if err := s.repo.BatchInsert(points); err != nil {
		return err
	}

	ctx := context.Background()
	for _, p := range points {
		key := fmt.Sprintf("mission:%d:positions", p.MissionID)
		field := fmt.Sprintf("member:%d", p.MemberID)
		value := fmt.Sprintf("%f,%f,%d", p.Lat, p.Lng, p.Timestamp.Unix())
		s.redisClient.HSet(ctx, key, field, value)

		msg := model.PositionMessage{
			Type:      "position",
			MemberID:  p.MemberID,
			Lat:       p.Lat,
			Lng:       p.Lng,
			Timestamp: p.Timestamp,
		}
		s.Broadcast(p.MissionID, msg)
	}

	return nil
}

func (s *GPSService) GetByMission(missionID int) ([]model.GPSPoint, error) {
	return s.repo.GetByMission(missionID)
}

func (s *GPSService) GetByMissionAndMember(missionID int, memberID int) ([]model.GPSPoint, error) {
	return s.repo.GetByMissionAndMember(missionID, memberID)
}

func (s *GPSService) GetLatestByMission(missionID int) ([]model.GPSPoint, error) {
	return s.repo.GetLatestByMission(missionID)
}

func (s *GPSService) GetByTimeRange(missionID int, startTime, endTime time.Time) ([]model.GPSPoint, error) {
	return s.repo.GetByTimeRange(missionID, startTime, endTime)
}

func (s *GPSService) GetCachedPositions(missionID int) (map[int]model.PositionMessage, error) {
	ctx := context.Background()
	key := fmt.Sprintf("mission:%d:positions", missionID)
	fields, err := s.redisClient.HGetAll(ctx, key).Result()
	if err != nil {
		return nil, err
	}

	positions := make(map[int]model.PositionMessage)
	for field, value := range fields {
		var memberID int
		if _, err := fmt.Sscanf(field, "member:%d", &memberID); err != nil {
			continue
		}

		var lat, lng float64
		var ts int64
		if _, err := fmt.Sscanf(value, "%f,%f,%d", &lat, &lng, &ts); err != nil {
			continue
		}

		positions[memberID] = model.PositionMessage{
			Type:      "position",
			MemberID:  memberID,
			Lat:       lat,
			Lng:       lng,
			Timestamp: time.Unix(ts, 0),
		}
	}

	return positions, nil
}
