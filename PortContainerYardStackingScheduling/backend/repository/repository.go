package repository

import (
	"database/sql"
	"fmt"
	"time"

	"yard-scheduling/config"
	"yard-scheduling/model"

	_ "github.com/go-sql-driver/mysql"
)

type Repo struct {
	db *sql.DB
}

func NewRepo(cfg config.MySQLConfig) (*Repo, error) {
	db, err := sql.Open("mysql", cfg.DSN())
	if err != nil {
		return nil, fmt.Errorf("open mysql: %w", err)
	}
	db.SetMaxOpenConns(20)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(5 * time.Minute)
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("ping mysql: %w", err)
	}
	return &Repo{db: db}, nil
}

func (r *Repo) Close() error {
	return r.db.Close()
}

func (r *Repo) ListZones() ([]model.YardZone, error) {
	rows, err := r.db.Query("SELECT id, zone_code, zone_name, zone_type, COALESCE(imo_class,''), min_spacing, created_at, updated_at FROM yard_zone")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var zones []model.YardZone
	for rows.Next() {
		var z model.YardZone
		if err := rows.Scan(&z.ID, &z.ZoneCode, &z.ZoneName, &z.ZoneType, &z.IMOClass, &z.MinSpacing, &z.CreatedAt, &z.UpdatedAt); err != nil {
			return nil, err
		}
		zones = append(zones, z)
	}
	return zones, nil
}

func (r *Repo) GetZoneByID(id int64) (*model.YardZone, error) {
	var z model.YardZone
	err := r.db.QueryRow("SELECT id, zone_code, zone_name, zone_type, COALESCE(imo_class,''), min_spacing, created_at, updated_at FROM yard_zone WHERE id=?", id).
		Scan(&z.ID, &z.ZoneCode, &z.ZoneName, &z.ZoneType, &z.IMOClass, &z.MinSpacing, &z.CreatedAt, &z.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &z, err
}

func (r *Repo) EnsureSlots(zoneID int64, bays, rows, tiers int) error {
	for b := 1; b <= bays; b++ {
		for rw := 1; rw <= rows; rw++ {
			for t := 1; t <= tiers; t++ {
				_, err := r.db.Exec(
					"INSERT IGNORE INTO yard_slot (zone_id, bay, row, tier, status) VALUES (?,?,?,?,'empty')",
					zoneID, b, rw, t)
				if err != nil {
					return err
				}
			}
		}
	}
	return nil
}

func (r *Repo) GetSlotsByZoneBay(zoneID, bay int64) ([]model.YardSlot, error) {
	rows, err := r.db.Query(
		"SELECT id, zone_id, bay, row, tier, status FROM yard_slot WHERE zone_id=? AND bay=? ORDER BY row, tier",
		zoneID, bay)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var slots []model.YardSlot
	for rows.Next() {
		var s model.YardSlot
		if err := rows.Scan(&s.ID, &s.ZoneID, &s.Bay, &s.Row, &s.Tier, &s.Status); err != nil {
			return nil, err
		}
		slots = append(slots, s)
	}
	return slots, nil
}

func (r *Repo) GetAllSlotsWithContainers() ([]model.YardSlot, error) {
	rows, err := r.db.Query(`
		SELECT s.id, s.zone_id, s.bay, s.row, s.tier, s.status,
		       COALESCE(c.container_no, '')
		FROM yard_slot s
		LEFT JOIN container c ON c.slot_id = s.id AND c.status='yard'
		ORDER BY s.zone_id, s.bay, s.row, s.tier`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var slots []model.YardSlot
	for rows.Next() {
		var s model.YardSlot
		if err := rows.Scan(&s.ID, &s.ZoneID, &s.Bay, &s.Row, &s.Tier, &s.Status, &s.ContainerNo); err != nil {
			return nil, err
		}
		slots = append(slots, s)
	}
	return slots, nil
}

func (r *Repo) GetSlotByID(id int64) (*model.YardSlot, error) {
	var s model.YardSlot
	err := r.db.QueryRow("SELECT id, zone_id, bay, row, tier, status FROM yard_slot WHERE id=?", id).
		Scan(&s.ID, &s.ZoneID, &s.Bay, &s.Row, &s.Tier, &s.Status)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &s, err
}

func (r *Repo) FindEmptySlot(zoneID int64, bay, row, tier int) (*model.YardSlot, error) {
	var s model.YardSlot
	err := r.db.QueryRow(
		"SELECT id, zone_id, bay, row, tier, status FROM yard_slot WHERE zone_id=? AND bay=? AND row=? AND tier=? AND status='empty'",
		zoneID, bay, row, tier).
		Scan(&s.ID, &s.ZoneID, &s.Bay, &s.Row, &s.Tier, &s.Status)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &s, err
}

func (r *Repo) UpdateSlotStatus(id int64, status string) error {
	_, err := r.db.Exec("UPDATE yard_slot SET status=? WHERE id=?", status, id)
	return err
}

func (r *Repo) GetSlotTopTier(zoneID int64, bay, row int) (int, error) {
	var maxTier sql.NullInt64
	err := r.db.QueryRow(
		"SELECT MAX(tier) FROM yard_slot WHERE zone_id=? AND bay=? AND row=? AND status='occupied'",
		zoneID, bay, row).Scan(&maxTier)
	if err != nil {
		return 0, err
	}
	if !maxTier.Valid {
		return 0, nil
	}
	return int(maxTier.Int64), nil
}

func (r *Repo) GetSlotMaxTier(zoneID int64, bay, row int) (int, error) {
	var maxTier sql.NullInt64
	err := r.db.QueryRow(
		"SELECT MAX(tier) FROM yard_slot WHERE zone_id=? AND bay=? AND row=?",
		zoneID, bay, row).Scan(&maxTier)
	if err != nil {
		return 0, err
	}
	if !maxTier.Valid {
		return 0, nil
	}
	return int(maxTier.Int64), nil
}

func (r *Repo) GetContainersAboveSlot(slotID int64) ([]model.Container, error) {
	var s model.YardSlot
	err := r.db.QueryRow("SELECT id, zone_id, bay, row, tier FROM yard_slot WHERE id=?", slotID).
		Scan(&s.ID, &s.ZoneID, &s.Bay, &s.Row, &s.Tier)
	if err != nil {
		return nil, err
	}
	rows, err := r.db.Query(`
		SELECT c.id, c.container_no, c.owner_code, c.size_type, c.weight_kg, c.is_dangerous,
		       COALESCE(c.imo_class,''), c.arrival_time, c.departure_time, c.slot_id, c.status, c.reshuffle_count, c.created_at, c.updated_at
		FROM container c
		JOIN yard_slot s ON c.slot_id = s.id
		WHERE s.zone_id=? AND s.bay=? AND s.row=? AND s.tier > ? AND c.status='yard'
		ORDER BY s.tier`,
		s.ZoneID, s.Bay, s.Row, s.Tier)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var containers []model.Container
	for rows.Next() {
		var c model.Container
		var dep sql.NullTime
		var sid sql.NullInt64
		if err := rows.Scan(&c.ID, &c.ContainerNo, &c.OwnerCode, &c.SizeType, &c.WeightKg, &c.IsDangerous,
			&c.IMOClass, &c.ArrivalTime, &dep, &sid, &c.Status, &c.ReshuffleCount, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		if dep.Valid {
			c.DepartureTime = &dep.Time
		}
		if sid.Valid {
			c.SlotID = &sid.Int64
		}
		containers = append(containers, c)
	}
	return containers, nil
}

func (r *Repo) CreateContainer(c *model.Container) error {
	result, err := r.db.Exec(`
		INSERT INTO container (container_no, owner_code, size_type, weight_kg, is_dangerous, imo_class, arrival_time, departure_time, slot_id, status)
		VALUES (?,?,?,?,?,?,?,?,?,?)`,
		c.ContainerNo, c.OwnerCode, c.SizeType, c.WeightKg, c.IsDangerous, c.IMOClass,
		c.ArrivalTime, c.DepartureTime, c.SlotID, c.Status)
	if err != nil {
		return err
	}
	id, _ := result.LastInsertId()
	c.ID = id
	return nil
}

func (r *Repo) GetContainerByNo(containerNo string) (*model.Container, error) {
	var c model.Container
	var dep sql.NullTime
	var sid sql.NullInt64
	err := r.db.QueryRow(`
		SELECT id, container_no, owner_code, size_type, weight_kg, is_dangerous,
		       COALESCE(imo_class,''), arrival_time, departure_time, slot_id, status, reshuffle_count, created_at, updated_at
		FROM container WHERE container_no=?`, containerNo).
		Scan(&c.ID, &c.ContainerNo, &c.OwnerCode, &c.SizeType, &c.WeightKg, &c.IsDangerous,
			&c.IMOClass, &c.ArrivalTime, &dep, &sid, &c.Status, &c.ReshuffleCount, &c.CreatedAt, &c.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if dep.Valid {
		c.DepartureTime = &dep.Time
	}
	if sid.Valid {
		c.SlotID = &sid.Int64
	}
	return &c, nil
}

func (r *Repo) GetContainerByID(id int64) (*model.Container, error) {
	var c model.Container
	var dep sql.NullTime
	var sid sql.NullInt64
	err := r.db.QueryRow(`
		SELECT id, container_no, owner_code, size_type, weight_kg, is_dangerous,
		       COALESCE(imo_class,''), arrival_time, departure_time, slot_id, status, reshuffle_count, created_at, updated_at
		FROM container WHERE id=?`, id).
		Scan(&c.ID, &c.ContainerNo, &c.OwnerCode, &c.SizeType, &c.WeightKg, &c.IsDangerous,
			&c.IMOClass, &c.ArrivalTime, &dep, &sid, &c.Status, &c.ReshuffleCount, &c.CreatedAt, &c.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if dep.Valid {
		c.DepartureTime = &dep.Time
	}
	if sid.Valid {
		c.SlotID = &sid.Int64
	}
	return &c, nil
}

func (r *Repo) UpdateContainerSlot(containerID, slotID int64) error {
	_, err := r.db.Exec("UPDATE container SET slot_id=? WHERE id=?", slotID, containerID)
	return err
}

func (r *Repo) UpdateContainerStatus(containerID int64, status string) error {
	_, err := r.db.Exec("UPDATE container SET status=? WHERE id=?", status, containerID)
	return err
}

func (r *Repo) IncrementReshuffle(containerID int64) error {
	_, err := r.db.Exec("UPDATE container SET reshuffle_count = reshuffle_count + 1 WHERE id=?", containerID)
	return err
}

func (r *Repo) ListContainers(status string) ([]model.Container, error) {
	q := `
		SELECT id, container_no, owner_code, size_type, weight_kg, is_dangerous,
		       COALESCE(imo_class,''), arrival_time, departure_time, slot_id, status, reshuffle_count, created_at, updated_at
		FROM container`
	args := []interface{}{}
	if status != "" {
		q += " WHERE status=?"
		args = append(args, status)
	}
	q += " ORDER BY arrival_time DESC"
	rows, err := r.db.Query(q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var containers []model.Container
	for rows.Next() {
		var c model.Container
		var dep sql.NullTime
		var sid sql.NullInt64
		if err := rows.Scan(&c.ID, &c.ContainerNo, &c.OwnerCode, &c.SizeType, &c.WeightKg, &c.IsDangerous,
			&c.IMOClass, &c.ArrivalTime, &dep, &sid, &c.Status, &c.ReshuffleCount, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		if dep.Valid {
			c.DepartureTime = &dep.Time
		}
		if sid.Valid {
			c.SlotID = &sid.Int64
		}
		containers = append(containers, c)
	}
	return containers, nil
}

func (r *Repo) CreateAppointment(a *model.Appointment) error {
	result, err := r.db.Exec(`
		INSERT INTO appointment (container_id, truck_plate, driver_name, appoint_time, appoint_end, status)
		VALUES (?,?,?,?,?,?)`,
		a.ContainerID, a.TruckPlate, a.DriverName, a.AppointTime, a.AppointEnd, a.Status)
	if err != nil {
		return err
	}
	id, _ := result.LastInsertId()
	a.ID = id
	return nil
}

func (r *Repo) ListAppointments(status string) ([]model.Appointment, error) {
	q := `
		SELECT a.id, a.container_id, a.truck_plate, a.driver_name, a.appoint_time, a.appoint_end,
		       a.status, COALESCE(c.container_no,''), a.created_at, a.updated_at
		FROM appointment a
		LEFT JOIN container c ON a.container_id = c.id`
	args := []interface{}{}
	if status != "" {
		q += " WHERE a.status=?"
		args = append(args, status)
	}
	q += " ORDER BY a.appoint_time"
	rows, err := r.db.Query(q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var appointments []model.Appointment
	for rows.Next() {
		var a model.Appointment
		if err := rows.Scan(&a.ID, &a.ContainerID, &a.TruckPlate, &a.DriverName, &a.AppointTime, &a.AppointEnd,
			&a.Status, &a.ContainerNo, &a.CreatedAt, &a.UpdatedAt); err != nil {
			return nil, err
		}
		appointments = append(appointments, a)
	}
	return appointments, nil
}

func (r *Repo) UpdateAppointmentStatus(id int64, status string) error {
	_, err := r.db.Exec("UPDATE appointment SET status=? WHERE id=?", status, id)
	return err
}

func (r *Repo) GetAppointmentByID(id int64) (*model.Appointment, error) {
	var a model.Appointment
	err := r.db.QueryRow(`
		SELECT a.id, a.container_id, a.truck_plate, a.driver_name, a.appoint_time, a.appoint_end,
		       a.status, COALESCE(c.container_no,''), a.created_at, a.updated_at
		FROM appointment a
		LEFT JOIN container c ON a.container_id = c.id
		WHERE a.id=?`, id).
		Scan(&a.ID, &a.ContainerID, &a.TruckPlate, &a.DriverName, &a.AppointTime, &a.AppointEnd,
			&a.Status, &a.ContainerNo, &a.CreatedAt, &a.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &a, err
}

func (r *Repo) AcquireSlotLock(slotID int64, locker, lockType string, expireAt time.Time) (bool, error) {
	result, err := r.db.Exec(`
		INSERT INTO slot_lock (slot_id, locker, lock_type, expire_at) VALUES (?,?,?,?)
		ON DUPLICATE KEY UPDATE locker=VALUES(locker), lock_type=VALUES(lock_type), expire_at=VALUES(expire_at)`,
		slotID, locker, lockType, expireAt)
	if err != nil {
		return false, err
	}
	affected, _ := result.RowsAffected()
	return affected > 0, nil
}

func (r *Repo) ReleaseSlotLock(slotID int64) error {
	_, err := r.db.Exec("DELETE FROM slot_lock WHERE slot_id=?", slotID)
	return err
}

func (r *Repo) GetSlotLock(slotID int64) (*model.SlotLock, error) {
	var l model.SlotLock
	err := r.db.QueryRow("SELECT id, slot_id, locker, lock_type, locked_at, expire_at FROM slot_lock WHERE slot_id=?", slotID).
		Scan(&l.ID, &l.SlotID, &l.Locker, &l.LockType, &l.LockedAt, &l.ExpireAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &l, err
}

func (r *Repo) GetSlotsWithContainersByZoneBay(zoneID, bay int64) ([]model.YardSlot, error) {
	rows, err := r.db.Query(`
		SELECT s.id, s.zone_id, s.bay, s.row, s.tier, s.status,
		       COALESCE(c.container_no, ''),
		       COALESCE(c.id, 0), COALESCE(c.owner_code, ''), COALESCE(c.size_type, ''),
		       COALESCE(c.weight_kg, 0), COALESCE(c.is_dangerous, 0), COALESCE(c.imo_class, ''),
		       COALESCE(c.departure_time, '0001-01-01 00:00:00'), COALESCE(c.status, '')
		FROM yard_slot s
		LEFT JOIN container c ON c.slot_id = s.id AND c.status='yard'
		WHERE s.zone_id=? AND s.bay=?
		ORDER BY s.row, s.tier`, zoneID, bay)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var slots []model.YardSlot
	for rows.Next() {
		var s model.YardSlot
		var c model.Container
		var cID int64
		var dep sql.NullTime
		if err := rows.Scan(&s.ID, &s.ZoneID, &s.Bay, &s.Row, &s.Tier, &s.Status,
			&s.ContainerNo, &cID, &c.OwnerCode, &c.SizeType, &c.WeightKg, &c.IsDangerous, &c.IMOClass,
			&dep, &c.Status); err != nil {
			return nil, err
		}
		if cID > 0 {
			c.ID = cID
			c.ContainerNo = s.ContainerNo
			if dep.Valid {
				c.DepartureTime = &dep.Time
			}
			s.Container = &c
		}
		slots = append(slots, s)
	}
	return slots, nil
}
