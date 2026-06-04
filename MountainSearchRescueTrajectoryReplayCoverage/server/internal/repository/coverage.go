package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"mountain-rescue-server/internal/model"
	"time"

	"github.com/go-redis/redis/v8"
)

type CoverageRepository struct {
	redisClient *redis.Client
}

func NewCoverageRepository(redisClient *redis.Client) *CoverageRepository {
	return &CoverageRepository{redisClient: redisClient}
}

func (r *CoverageRepository) SaveCoverageResult(missionID int, result *model.CoverageResult) error {
	key := fmt.Sprintf("coverage:%d", missionID)
	data, err := json.Marshal(result)
	if err != nil {
		return err
	}
	ctx := context.Background()
	return r.redisClient.Set(ctx, key, data, 5*time.Second).Err()
}

func (r *CoverageRepository) GetCoverageResult(missionID int) (*model.CoverageResult, error) {
	key := fmt.Sprintf("coverage:%d", missionID)
	ctx := context.Background()
	data, err := r.redisClient.Get(ctx, key).Result()
	if err != nil {
		return nil, err
	}

	var result model.CoverageResult
	if err := json.Unmarshal([]byte(data), &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *CoverageRepository) SaveHeatmap(missionID int, heatmap *model.HeatmapResponse) error {
	key := fmt.Sprintf("heatmap:%d", missionID)
	data, err := json.Marshal(heatmap)
	if err != nil {
		return err
	}
	ctx := context.Background()
	return r.redisClient.Set(ctx, key, data, 5*time.Second).Err()
}

func (r *CoverageRepository) GetHeatmap(missionID int) (*model.HeatmapResponse, error) {
	key := fmt.Sprintf("heatmap:%d", missionID)
	ctx := context.Background()
	data, err := r.redisClient.Get(ctx, key).Result()
	if err != nil {
		return nil, err
	}

	var heatmap model.HeatmapResponse
	if err := json.Unmarshal([]byte(data), &heatmap); err != nil {
		return nil, err
	}
	return &heatmap, nil
}
