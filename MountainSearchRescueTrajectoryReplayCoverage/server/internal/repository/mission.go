package repository

import (
	"database/sql"
	"mountain-rescue-server/internal/model"
)

type MissionRepository struct {
	db *sql.DB
}

func NewMissionRepository(db *sql.DB) *MissionRepository {
	return &MissionRepository{db: db}
}

func (r *MissionRepository) Create(m *model.Mission) error {
	query := "INSERT INTO mission (name, status, search_area) VALUES (?, ?, ?)"
	result, err := r.db.Exec(query, m.Name, m.Status, m.SearchArea)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	m.ID = int(id)
	return r.GetByID(m.ID, m)
}

func (r *MissionRepository) GetByID(id int, m *model.Mission) error {
	query := "SELECT id, name, status, search_area, created_at, updated_at FROM mission WHERE id = ?"
	return r.db.QueryRow(query, id).Scan(&m.ID, &m.Name, &m.Status, &m.SearchArea, &m.CreatedAt, &m.UpdatedAt)
}

func (r *MissionRepository) List() ([]model.Mission, error) {
	query := "SELECT id, name, status, search_area, created_at, updated_at FROM mission ORDER BY created_at DESC"
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var missions []model.Mission
	for rows.Next() {
		var m model.Mission
		if err := rows.Scan(&m.ID, &m.Name, &m.Status, &m.SearchArea, &m.CreatedAt, &m.UpdatedAt); err != nil {
			return nil, err
		}
		missions = append(missions, m)
	}
	return missions, nil
}

func (r *MissionRepository) Update(m *model.Mission) error {
	query := "UPDATE mission SET name = ?, status = ?, search_area = ? WHERE id = ?"
	_, err := r.db.Exec(query, m.Name, m.Status, m.SearchArea, m.ID)
	if err != nil {
		return err
	}
	return r.GetByID(m.ID, m)
}

func (r *MissionRepository) Delete(id int) error {
	query := "DELETE FROM mission WHERE id = ?"
	_, err := r.db.Exec(query, id)
	return err
}
