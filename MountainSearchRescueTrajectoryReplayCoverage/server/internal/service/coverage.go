package service

import (
	"encoding/json"
	"fmt"
	"math"
	"mountain-rescue-server/internal/model"
	"mountain-rescue-server/internal/repository"

	"github.com/paulmach/orb"
	"github.com/paulmach/orb/geojson"
	"github.com/paulmach/orb/planar"
)

type CoverageService struct {
	subAreaRepo  *repository.SubAreaRepository
	gpsRepo      *repository.GPSRepository
	coverageRepo *repository.CoverageRepository
}

func NewCoverageService(
	subAreaRepo *repository.SubAreaRepository,
	gpsRepo *repository.GPSRepository,
	coverageRepo *repository.CoverageRepository,
) *CoverageService {
	return &CoverageService{
		subAreaRepo:  subAreaRepo,
		gpsRepo:      gpsRepo,
		coverageRepo: coverageRepo,
	}
}

const (
	bufferDegrees = 0.00045
	gridStep      = 0.0002
)

func (s *CoverageService) CalculateCoverage(missionID int) (*model.CoverageResult, error) {
	if cached, err := s.coverageRepo.GetCoverageResult(missionID); err == nil {
		return cached, nil
	}

	subAreas, err := s.subAreaRepo.ListByMission(missionID)
	if err != nil {
		return nil, err
	}

	gpsPoints, err := s.gpsRepo.GetByMission(missionID)
	if err != nil {
		return nil, err
	}

	var totalArea, coveredArea float64
	subAreaCoverages := make([]model.SubAreaCoverage, 0, len(subAreas))

	for _, sa := range subAreas {
		polygon, err := parsePolygon(sa.Boundary)
		if err != nil {
			continue
		}

		saArea := planar.Area(polygon)
		coveredPoints, totalPoints := s.calculateSubAreaCoverage(polygon, gpsPoints)

		var coverageRatio float64
		if totalPoints > 0 {
			coverageRatio = float64(coveredPoints) / float64(totalPoints)
		}

		saCoveredArea := saArea * coverageRatio
		totalArea += saArea
		coveredArea += saCoveredArea

		subAreaCoverages = append(subAreaCoverages, model.SubAreaCoverage{
			SubAreaID:     sa.ID,
			Name:          sa.Name,
			TotalArea:     saArea,
			CoveredArea:   saCoveredArea,
			CoverageRatio: coverageRatio,
			Color:         sa.Color,
		})

		_ = s.subAreaRepo.SaveCoverageStats(missionID, sa.ID, coverageRatio)
	}

	var overallRatio float64
	if totalArea > 0 {
		overallRatio = coveredArea / totalArea
	}

	result := &model.CoverageResult{
		MissionID:     missionID,
		TotalArea:     totalArea,
		CoveredArea:   coveredArea,
		CoverageRatio: overallRatio,
		SubAreas:      subAreaCoverages,
	}

	_ = s.coverageRepo.SaveCoverageResult(missionID, result)

	return result, nil
}

func (s *CoverageService) GenerateHeatmap(missionID int) (*model.HeatmapResponse, error) {
	if cached, err := s.coverageRepo.GetHeatmap(missionID); err == nil {
		return cached, nil
	}

	subAreas, err := s.subAreaRepo.ListByMission(missionID)
	if err != nil {
		return nil, err
	}

	gpsPoints, err := s.gpsRepo.GetByMission(missionID)
	if err != nil {
		return nil, err
	}

	heatmapPoints := make([]model.HeatmapPoint, 0)
	maxCount := 0

	for _, sa := range subAreas {
		polygon, err := parsePolygon(sa.Boundary)
		if err != nil {
			continue
		}

		gridPoints := generateGrid(polygon, gridStep)
		for _, gp := range gridPoints {
			count := countNearbyGPS(gp, gpsPoints, bufferDegrees)
			if count > 0 {
				heatmapPoints = append(heatmapPoints, model.HeatmapPoint{
					Lat:       gp.Lat(),
					Lng:       gp.Lon(),
					Intensity: float64(count),
				})
				if count > maxCount {
					maxCount = count
				}
			}
		}
	}

	if maxCount > 0 {
		for i := range heatmapPoints {
			heatmapPoints[i].Intensity = heatmapPoints[i].Intensity / float64(maxCount)
		}
	}

	response := &model.HeatmapResponse{
		MissionID: missionID,
		Points:    heatmapPoints,
	}

	_ = s.coverageRepo.SaveHeatmap(missionID, response)

	return response, nil
}

func parsePolygon(raw json.RawMessage) (orb.Polygon, error) {
	geom, err := geojson.UnmarshalGeometry(raw)
	if err != nil {
		return nil, err
	}
	polygon, ok := geom.Geometry().(orb.Polygon)
	if !ok {
		return nil, fmt.Errorf("not a polygon")
	}
	return polygon, nil
}

func generateGrid(polygon orb.Polygon, step float64) []orb.Point {
	if len(polygon) == 0 {
		return nil
	}

	ring := polygon[0]
	minLat, maxLat := ring[0].Lat(), ring[0].Lat()
	minLng, maxLng := ring[0].Lon(), ring[0].Lon()

	for _, p := range ring {
		if p.Lat() < minLat {
			minLat = p.Lat()
		}
		if p.Lat() > maxLat {
			maxLat = p.Lat()
		}
		if p.Lon() < minLng {
			minLng = p.Lon()
		}
		if p.Lon() > maxLng {
			maxLng = p.Lon()
		}
	}

	var points []orb.Point
	for lat := minLat; lat <= maxLat; lat += step {
		for lng := minLng; lng <= maxLng; lng += step {
			pt := orb.Point{lng, lat}
			if planar.PolygonContains(polygon, pt) {
				points = append(points, pt)
			}
		}
	}

	return points
}

func countNearbyGPS(point orb.Point, gpsPoints []model.GPSPoint, buffer float64) int {
	count := 0
	for _, gp := range gpsPoints {
		gpPt := orb.Point{gp.Lng, gp.Lat}
		dist := planar.Distance(point, gpPt)
		if dist <= buffer {
			count++
		}
	}
	return count
}

func (s *CoverageService) calculateSubAreaCoverage(polygon orb.Polygon, gpsPoints []model.GPSPoint) (int, int) {
	gridPoints := generateGrid(polygon, gridStep)
	totalPoints := len(gridPoints)
	coveredPoints := 0

	for _, gp := range gridPoints {
		if isPointCovered(gp, gpsPoints, bufferDegrees) {
			coveredPoints++
		}
	}

	return coveredPoints, totalPoints
}

func isPointCovered(point orb.Point, gpsPoints []model.GPSPoint, buffer float64) bool {
	for _, gp := range gpsPoints {
		gpPt := orb.Point{gp.Lng, gp.Lat}
		dist := math.Sqrt(math.Pow(point.Lon()-gpPt.Lon(), 2) + math.Pow(point.Lat()-gpPt.Lat(), 2))
		if dist <= buffer {
			return true
		}
	}
	return false
}
