package repository

import (
	"database/sql"
	"encoding/json"
	"mountain-rescue-server/internal/model"
)

type SubAreaRepository struct {
	db *sql.DB
}

func NewSubAreaRepository(db *sql.DB) *SubAreaRepository {
	return &SubAreaRepository{db: db}
}

func (r *SubAreaRepository) Create(sa *model.SubArea) error {
	query := "INSERT INTO sub_area (mission_id, name, boundary, team_id, status, color) VALUES (?, ?, ?, ?, ?, ?)"
	result, err := r.db.Exec(query, sa.MissionID, sa.Name, sa.Boundary, sa.TeamID, sa.Status, sa.Color)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	sa.ID = int(id)
	return r.GetByID(sa.ID, sa)
}

func (r *SubAreaRepository) GetByID(id int, sa *model.SubArea) error {
	query := "SELECT id, mission_id, name, boundary, team_id, status, color, created_at, updated_at FROM sub_area WHERE id = ?"
	return r.db.QueryRow(query, id).Scan(&sa.ID, &sa.MissionID, &sa.Name, &sa.Boundary, &sa.TeamID, &sa.Status, &sa.Color, &sa.CreatedAt, &sa.UpdatedAt)
}

func (r *SubAreaRepository) ListByMission(missionID int) ([]model.SubArea, error) {
	query := "SELECT id, mission_id, name, boundary, team_id, status, color, created_at, updated_at FROM sub_area WHERE mission_id = ? ORDER BY id"
	rows, err := r.db.Query(query, missionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subAreas []model.SubArea
	for rows.Next() {
		var sa model.SubArea
		if err := rows.Scan(&sa.ID, &sa.MissionID, &sa.Name, &sa.Boundary, &sa.TeamID, &sa.Status, &sa.Color, &sa.CreatedAt, &sa.UpdatedAt); err != nil {
			return nil, err
		}
		subAreas = append(subAreas, sa)
	}
	return subAreas, nil
}

func (r *SubAreaRepository) GetBoundariesByMission(missionID int) (map[int]json.RawMessage, error) {
	query := "SELECT id, boundary FROM sub_area WHERE mission_id = ?"
	rows, err := r.db.Query(query, missionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	boundaries := make(map[int]json.RawMessage)
	for rows.Next() {
		var id int
		var boundary json.RawMessage
		if err := rows.Scan(&id, &boundary); err != nil {
			return nil, err
		}
		boundaries[id] = boundary
	}
	return boundaries, nil
}

func (r *SubAreaRepository) Update(sa *model.SubArea) error {
	query := "UPDATE sub_area SET name = ?, boundary = ?, team_id = ?, status = ?, color = ? WHERE id = ?"
	_, err := r.db.Exec(query, sa.Name, sa.Boundary, sa.TeamID, sa.Status, sa.Color, sa.ID)
	if err != nil {
		return err
	}
	return r.GetByID(sa.ID, sa)
}

func (r *SubAreaRepository) Delete(id int) error {
	query := "DELETE FROM sub_area WHERE id = ?"
	_, err := r.db.Exec(query, id)
	return err
}

func (r *SubAreaRepository) SaveCoverageStats(missionID int, subAreaID int, coverageRatio float64) error {
	query := "UPDATE sub_area SET updated_at = NOW() WHERE id = ?"
	_, err := r.db.Exec(query, subAreaID)
	return err
}
