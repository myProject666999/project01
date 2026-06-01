package service

import (
	"errors"
	"server/config"
	"server/model"
	"server/repository"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService struct {
	userRepo *repository.UserRepository
	cfg      *config.Config
}

func NewAuthService(userRepo *repository.UserRepository, cfg *config.Config) *AuthService {
	return &AuthService{userRepo: userRepo, cfg: cfg}
}

func (s *AuthService) Register(phone, password, name string) (*model.User, error) {
	_, err := s.userRepo.FindByPhone(phone)
	if err == nil {
		return nil, errors.New("该手机号已注册")
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	user := &model.User{
		Phone:    phone,
		Password: string(hashedPassword),
		Name:     name,
		Role:     0,
	}
	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *AuthService) Login(phone, password string) (string, *model.User, error) {
	user, err := s.userRepo.FindByPhone(phone)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", nil, errors.New("手机号或密码错误")
		}
		return "", nil, err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", nil, errors.New("手机号或密码错误")
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, err := token.SignedString([]byte(s.cfg.JWT.Secret))
	if err != nil {
		return "", nil, err
	}
	return tokenString, user, nil
}

func (s *AuthService) GetProfile(userID uint) (*model.User, error) {
	return s.userRepo.FindByID(userID)
}
