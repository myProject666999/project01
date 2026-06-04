package repository

import (
	"database/sql"
	"mountain-rescue-server/internal/model"
)

type DiscoveryRepository struct {
	db *sql.DB
}

func NewDiscoveryRepository(db *sql.DB) *DiscoveryRepository {
	return &DiscoveryRepository{db: db}
}

func (r *DiscoveryRepository) Create(d *model.Discovery) error {
	query := "INSERT INTO discovery (mission_id, member_id, type, description, lat, lng, image_url, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
	result, err := r.db.Exec(query, d.MissionID, d.MemberID, d.Type, d.Description, d.Lat, d.Lng, d.ImageURL, d.Timestamp)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	d.ID = int(id)
	return r.GetByID(d.ID, d)
}

func (r *DiscoveryRepository) GetByID(id int, d *model.Discovery) error {
	query := "SELECT id, mission_id, member_id, type, description, lat, lng, image_url, timestamp, created_at FROM discovery WHERE id = ?"
	return r.db.QueryRow(query, id).Scan(&d.ID, &d.MissionID, &d.MemberID, &d.Type, &d.Description, &d.Lat, &d.Lng, &d.ImageURL, &d.Timestamp, &d.CreatedAt)
}

func (r *DiscoveryRepository) ListByMission(missionID int) ([]model.Discovery, error) {
	query := "SELECT id, mission_id, member_id, type, description, lat, lng, image_url, timestamp, created_at FROM discovery WHERE mission_id = ? ORDER BY timestamp DESC"
	rows, err := r.db.Query(query, missionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var discoveries []model.Discovery
	for rows.Next() {
		var d model.Discovery
		if err := rows.Scan(&d.ID, &d.MissionID, &d.MemberID, &d.Type, &d.Description, &d.Lat, &d.Lng, &d.ImageURL, &d.Timestamp, &d.CreatedAt); err != nil {
			return nil, err
		}
		discoveries = append(discoveries, d)
	}
	return discoveries, nil
}

func (r *DiscoveryRepository) ListByMissionAndType(missionID int, discoveryType string) ([]model.Discovery, error) {
	query := "SELECT id, mission_id, member_id, type, description, lat, lng, image_url, timestamp, created_at FROM discovery WHERE mission_id = ? AND type = ? ORDER BY timestamp DESC"
	rows, err := r.db.Query(query, missionID, discoveryType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var discoveries []model.Discovery
	for rows.Next() {
		var d model.Discovery
		if err := rows.Scan(&d.ID, &d.MissionID, &d.MemberID, &d.Type, &d.Description, &d.Lat, &d.Lng, &d.ImageURL, &d.Timestamp, &d.CreatedAt); err != nil {
			return nil, err
		}
		discoveries = append(discoveries, d)
	}
	return discoveries, nil
}

func (r *DiscoveryRepository) Update(d *model.Discovery) error {
	query := "UPDATE discovery SET mission_id = ?, member_id = ?, type = ?, description = ?, lat = ?, lng = ?, image_url = ?, timestamp = ? WHERE id = ?"
	_, err := r.db.Exec(query, d.MissionID, d.MemberID, d.Type, d.Description, d.Lat, d.Lng, d.ImageURL, d.Timestamp, d.ID)
	if err != nil {
		return err
	}
	return r.GetByID(d.ID, d)
}

func (r *DiscoveryRepository) Delete(id int) error {
	query := "DELETE FROM discovery WHERE id = ?"
	_, err := r.db.Exec(query, id)
	return err
}
