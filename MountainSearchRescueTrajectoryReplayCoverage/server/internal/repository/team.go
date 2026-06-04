package repository

import (
	"database/sql"
	"mountain-rescue-server/internal/model"
)

type TeamRepository struct {
	db *sql.DB
}

func NewTeamRepository(db *sql.DB) *TeamRepository {
	return &TeamRepository{db: db}
}

func (r *TeamRepository) CreateTeam(t *model.RescueTeam) error {
	query := "INSERT INTO rescue_team (name, leader_id, color) VALUES (?, ?, ?)"
	result, err := r.db.Exec(query, t.Name, t.LeaderID, t.Color)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	t.ID = int(id)
	return r.GetTeamByID(t.ID, t)
}

func (r *TeamRepository) GetTeamByID(id int, t *model.RescueTeam) error {
	query := "SELECT id, name, leader_id, color, created_at FROM rescue_team WHERE id = ?"
	return r.db.QueryRow(query, id).Scan(&t.ID, &t.Name, &t.LeaderID, &t.Color, &t.CreatedAt)
}

func (r *TeamRepository) ListTeams() ([]model.RescueTeam, error) {
	query := "SELECT id, name, leader_id, color, created_at FROM rescue_team ORDER BY id"
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var teams []model.RescueTeam
	for rows.Next() {
		var t model.RescueTeam
		if err := rows.Scan(&t.ID, &t.Name, &t.LeaderID, &t.Color, &t.CreatedAt); err != nil {
			return nil, err
		}
		teams = append(teams, t)
	}
	return teams, nil
}

func (r *TeamRepository) UpdateTeam(t *model.RescueTeam) error {
	query := "UPDATE rescue_team SET name = ?, leader_id = ?, color = ? WHERE id = ?"
	_, err := r.db.Exec(query, t.Name, t.LeaderID, t.Color, t.ID)
	if err != nil {
		return err
	}
	return r.GetTeamByID(t.ID, t)
}

func (r *TeamRepository) DeleteTeam(id int) error {
	query := "DELETE FROM rescue_team WHERE id = ?"
	_, err := r.db.Exec(query, id)
	return err
}

func (r *TeamRepository) CreateMember(m *model.Member) error {
	query := "INSERT INTO member (name, team_id, phone) VALUES (?, ?, ?)"
	result, err := r.db.Exec(query, m.Name, m.TeamID, m.Phone)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	m.ID = int(id)
	return r.GetMemberByID(m.ID, m)
}

func (r *TeamRepository) GetMemberByID(id int, m *model.Member) error {
	query := "SELECT id, name, team_id, phone, created_at FROM member WHERE id = ?"
	return r.db.QueryRow(query, id).Scan(&m.ID, &m.Name, &m.TeamID, &m.Phone, &m.CreatedAt)
}

func (r *TeamRepository) ListMembers() ([]model.Member, error) {
	query := "SELECT id, name, team_id, phone, created_at FROM member ORDER BY id"
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []model.Member
	for rows.Next() {
		var m model.Member
		if err := rows.Scan(&m.ID, &m.Name, &m.TeamID, &m.Phone, &m.CreatedAt); err != nil {
			return nil, err
		}
		members = append(members, m)
	}
	return members, nil
}

func (r *TeamRepository) ListMembersByTeam(teamID int) ([]model.Member, error) {
	query := "SELECT id, name, team_id, phone, created_at FROM member WHERE team_id = ? ORDER BY id"
	rows, err := r.db.Query(query, teamID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []model.Member
	for rows.Next() {
		var m model.Member
		if err := rows.Scan(&m.ID, &m.Name, &m.TeamID, &m.Phone, &m.CreatedAt); err != nil {
			return nil, err
		}
		members = append(members, m)
	}
	return members, nil
}

func (r *TeamRepository) UpdateMember(m *model.Member) error {
	query := "UPDATE member SET name = ?, team_id = ?, phone = ? WHERE id = ?"
	_, err := r.db.Exec(query, m.Name, m.TeamID, m.Phone, m.ID)
	if err != nil {
		return err
	}
	return r.GetMemberByID(m.ID, m)
}

func (r *TeamRepository) DeleteMember(id int) error {
	query := "DELETE FROM member WHERE id = ?"
	_, err := r.db.Exec(query, id)
	return err
}
