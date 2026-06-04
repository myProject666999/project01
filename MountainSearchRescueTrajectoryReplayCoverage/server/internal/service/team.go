package service

import (
	"mountain-rescue-server/internal/model"
	"mountain-rescue-server/internal/repository"
)

type TeamService struct {
	repo *repository.TeamRepository
}

func NewTeamService(repo *repository.TeamRepository) *TeamService {
	return &TeamService{repo: repo}
}

func (s *TeamService) CreateTeam(t *model.RescueTeam) error {
	return s.repo.CreateTeam(t)
}

func (s *TeamService) GetTeamByID(id int) (*model.RescueTeam, error) {
	var t model.RescueTeam
	if err := s.repo.GetTeamByID(id, &t); err != nil {
		return nil, err
	}
	return &t, nil
}

func (s *TeamService) ListTeams() ([]model.RescueTeam, error) {
	return s.repo.ListTeams()
}

func (s *TeamService) UpdateTeam(t *model.RescueTeam) error {
	return s.repo.UpdateTeam(t)
}

func (s *TeamService) DeleteTeam(id int) error {
	return s.repo.DeleteTeam(id)
}

func (s *TeamService) CreateMember(m *model.Member) error {
	return s.repo.CreateMember(m)
}

func (s *TeamService) GetMemberByID(id int) (*model.Member, error) {
	var m model.Member
	if err := s.repo.GetMemberByID(id, &m); err != nil {
		return nil, err
	}
	return &m, nil
}

func (s *TeamService) ListMembers() ([]model.Member, error) {
	return s.repo.ListMembers()
}

func (s *TeamService) ListMembersByTeam(teamID int) ([]model.Member, error) {
	return s.repo.ListMembersByTeam(teamID)
}

func (s *TeamService) UpdateMember(m *model.Member) error {
	return s.repo.UpdateMember(m)
}

func (s *TeamService) DeleteMember(id int) error {
	return s.repo.DeleteMember(id)
}
