package repository

import (
	"server/model"

	"gorm.io/gorm"
)

type ClubRepository struct {
	db *gorm.DB
}

func NewClubRepository(db *gorm.DB) *ClubRepository {
	return &ClubRepository{db: db}
}

func (r *ClubRepository) List() ([]model.Club, error) {
	var clubs []model.Club
	err := r.db.Find(&clubs).Error
	return clubs, err
}

func (r *ClubRepository) FindByID(id uint) (*model.Club, error) {
	var club model.Club
	err := r.db.First(&club, id).Error
	if err != nil {
		return nil, err
	}
	return &club, nil
}

func (r *ClubRepository) IncrementMember(id uint) error {
	return r.db.Model(&model.Club{}).Where("id = ?", id).
		UpdateColumn("member_count", gorm.Expr("member_count + 1")).Error
}

func (r *ClubRepository) FindClubMember(userID, clubID uint) (*model.ClubMember, error) {
	var member model.ClubMember
	err := r.db.Where("user_id = ? AND club_id = ?", userID, clubID).First(&member).Error
	if err != nil {
		return nil, err
	}
	return &member, nil
}

func (r *ClubRepository) CreateClubMember(member *model.ClubMember) error {
	return r.db.Create(member).Error
}

func (r *ClubRepository) ListClubsByUserID(userID uint) ([]model.Club, error) {
	var clubs []model.Club
	err := r.db.Joins("JOIN club_members ON club_members.club_id = clubs.id").
		Where("club_members.user_id = ?", userID).
		Find(&clubs).Error
	return clubs, err
}
