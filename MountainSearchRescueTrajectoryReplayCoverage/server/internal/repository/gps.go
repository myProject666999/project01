package repository

import (
	"database/sql"
	"mountain-rescue-server/internal/model"
	"time"
)

type GPSRepository struct {
	db *sql.DB
}

func NewGPSRepository(db *sql.DB) *GPSRepository {
	return &GPSRepository{db: db}
}

func (r *GPSRepository) BatchInsert(points []model.GPSPoint) error {
	if len(points) == 0 {
		return nil
	}

	query := "INSERT INTO gps_point (member_id, mission_id, lat, lng, altitude, speed, timestamp, is_cached) VALUES "
	values := make([]interface{}, 0, len(points)*8)
	placeholders := make([]string, 0, len(points))

	for i, p := range points {
		placeholders = append(placeholders, "(?, ?, ?, ?, ?, ?, ?, ?)")
		values = append(values, p.MemberID, p.MissionID, p.Lat, p.Lng, p.Altitude, p.Speed, p.Timestamp, p.IsCached)
		_ = i
	}

	query += placeholders[0]
	for i := 1; i < len(placeholders); i++ {
		query += ", " + placeholders[i]
	}

	_, err := r.db.Exec(query, values...)
	return err
}

func (r *GPSRepository) GetByMission(missionID int) ([]model.GPSPoint, error) {
	query := "SELECT id, member_id, mission_id, lat, lng, altitude, speed, timestamp, is_cached, created_at FROM gps_point WHERE mission_id = ? ORDER BY timestamp"
	rows, err := r.db.Query(query, missionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var points []model.GPSPoint
	for rows.Next() {
		var p model.GPSPoint
		if err := rows.Scan(&p.ID, &p.MemberID, &p.MissionID, &p.Lat, &p.Lng, &p.Altitude, &p.Speed, &p.Timestamp, &p.IsCached, &p.CreatedAt); err != nil {
			return nil, err
		}
		points = append(points, p)
	}
	return points, nil
}

func (r *GPSRepository) GetByMissionAndMember(missionID int, memberID int) ([]model.GPSPoint, error) {
	query := "SELECT id, member_id, mission_id, lat, lng, altitude, speed, timestamp, is_cached, created_at FROM gps_point WHERE mission_id = ? AND member_id = ? ORDER BY timestamp"
	rows, err := r.db.Query(query, missionID, memberID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var points []model.GPSPoint
	for rows.Next() {
		var p model.GPSPoint
		if err := rows.Scan(&p.ID, &p.MemberID, &p.MissionID, &p.Lat, &p.Lng, &p.Altitude, &p.Speed, &p.Timestamp, &p.IsCached, &p.CreatedAt); err != nil {
			return nil, err
		}
		points = append(points, p)
	}
	return points, nil
}

func (r *GPSRepository) GetLatestByMission(missionID int) ([]model.GPSPoint, error) {
	query := `
		SELECT g1.id, g1.member_id, g1.mission_id, g1.lat, g1.lng, g1.altitude, g1.speed, g1.timestamp, g1.is_cached, g1.created_at
		FROM gps_point g1
		INNER JOIN (
			SELECT member_id, MAX(timestamp) as max_ts
			FROM gps_point
			WHERE mission_id = ?
			GROUP BY member_id
		) g2 ON g1.member_id = g2.member_id AND g1.timestamp = g2.max_ts
		WHERE g1.mission_id = ?
	`
	rows, err := r.db.Query(query, missionID, missionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var points []model.GPSPoint
	for rows.Next() {
		var p model.GPSPoint
		if err := rows.Scan(&p.ID, &p.MemberID, &p.MissionID, &p.Lat, &p.Lng, &p.Altitude, &p.Speed, &p.Timestamp, &p.IsCached, &p.CreatedAt); err != nil {
			return nil, err
		}
		points = append(points, p)
	}
	return points, nil
}

func (r *GPSRepository) GetByTimeRange(missionID int, startTime, endTime time.Time) ([]model.GPSPoint, error) {
	query := "SELECT id, member_id, mission_id, lat, lng, altitude, speed, timestamp, is_cached, created_at FROM gps_point WHERE mission_id = ? AND timestamp >= ? AND timestamp <= ? ORDER BY timestamp"
	rows, err := r.db.Query(query, missionID, startTime, endTime)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var points []model.GPSPoint
	for rows.Next() {
		var p model.GPSPoint
		if err := rows.Scan(&p.ID, &p.MemberID, &p.MissionID, &p.Lat, &p.Lng, &p.Altitude, &p.Speed, &p.Timestamp, &p.IsCached, &p.CreatedAt); err != nil {
			return nil, err
		}
		points = append(points, p)
	}
	return points, nil
}
