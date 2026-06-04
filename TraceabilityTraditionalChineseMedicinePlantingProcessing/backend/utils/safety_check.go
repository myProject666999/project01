package utils

import (
	"database/sql"
	"fmt"
	"time"
)

// SafetyCheckResult 安全间隔期检查结果
type SafetyCheckResult struct {
	Passed      bool   `json:"passed"`
	Remark      string `json:"remark"`
	PlotID      int64  `json:"plot_id"`
	HarvestDate string `json:"harvest_date"`
}

// CheckSafetyInterval 调用存储过程检查安全间隔期
// db: 数据库连接
// plotID: 地块ID
// harvestDate: 采收日期
// 返回检查结果和错误
func CheckSafetyInterval(db *sql.DB, plotID int64, harvestDate time.Time) (*SafetyCheckResult, error) {
	if db == nil {
		return nil, fmt.Errorf("数据库连接不能为空")
	}

	if plotID <= 0 {
		return nil, fmt.Errorf("地块ID无效")
	}

	if harvestDate.IsZero() {
		return nil, fmt.Errorf("采收日期不能为空")
	}

	query := `CALL sp_check_safety_interval(?, ?, ?, ?)`

	var passed int8
	var remark string

	harvestDateStr := harvestDate.Format("2006-01-02")

	stmt, err := db.Prepare(query)
	if err != nil {
		return nil, fmt.Errorf("准备存储过程失败: %w", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(plotID, harvestDateStr, sql.Named("p_passed", sql.Out{Dest: &passed}), sql.Named("p_remark", sql.Out{Dest: &remark}))
	if err != nil {
		return nil, fmt.Errorf("执行存储过程失败: %w", err)
	}

	result := &SafetyCheckResult{
		Passed:      passed == 1,
		Remark:      remark,
		PlotID:      plotID,
		HarvestDate: harvestDateStr,
	}

	return result, nil
}

// CheckSafetyIntervalByString 调用存储过程检查安全间隔期（使用日期字符串）
// db: 数据库连接
// plotID: 地块ID
// harvestDateStr: 采收日期字符串（格式：YYYY-MM-DD）
// 返回检查结果和错误
func CheckSafetyIntervalByString(db *sql.DB, plotID int64, harvestDateStr string) (*SafetyCheckResult, error) {
	harvestDate, err := time.Parse("2006-01-02", harvestDateStr)
	if err != nil {
		return nil, fmt.Errorf("日期格式错误，应为YYYY-MM-DD: %w", err)
	}

	return CheckSafetyInterval(db, plotID, harvestDate)
}

// CheckSafetyIntervalAndUpdate 检查安全间隔期并更新采收批次表
// db: 数据库连接
// plotID: 地块ID
// harvestDate: 采收日期
// batchID: 采收批次ID
// 返回检查结果和错误
func CheckSafetyIntervalAndUpdate(db *sql.DB, plotID int64, harvestDate time.Time, batchID int64) (*SafetyCheckResult, error) {
	result, err := CheckSafetyInterval(db, plotID, harvestDate)
	if err != nil {
		return nil, err
	}

	if batchID > 0 {
		passed := 0
		if result.Passed {
			passed = 1
		}

		updateQuery := `UPDATE harvest_batches 
			SET safe_check_passed = ?, safe_check_remark = ? 
			WHERE id = ?`

		_, err := db.Exec(updateQuery, passed, result.Remark, batchID)
		if err != nil {
			return result, fmt.Errorf("更新采收批次安全检查结果失败: %w", err)
		}
	}

	return result, nil
}

// CheckSafetyIntervalForOutbound 出库时检查安全间隔期
// db: 数据库连接
// batchID: 采收批次ID
// 返回检查结果和错误
func CheckSafetyIntervalForOutbound(db *sql.DB, batchID int64) (*SafetyCheckResult, error) {
	if db == nil {
		return nil, fmt.Errorf("数据库连接不能为空")
	}

	if batchID <= 0 {
		return nil, fmt.Errorf("批次ID无效")
	}

	var plotID int64
	var harvestDateStr string

	query := `SELECT plot_id, DATE_FORMAT(harvest_date, '%Y-%m-%d') 
		FROM harvest_batches WHERE id = ?`

	err := db.QueryRow(query, batchID).Scan(&plotID, &harvestDateStr)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("采收批次不存在")
		}
		return nil, fmt.Errorf("查询批次信息失败: %w", err)
	}

	return CheckSafetyIntervalByString(db, plotID, harvestDateStr)
}

// ValidateHarvestDate 验证采收日期是否合理
// harvestDate: 采收日期
// plantingDate: 种植日期
// expectedHarvestDate: 预计采收日期
// growthCycleDays: 生长周期（天）
// 返回是否有效和错误信息
func ValidateHarvestDate(harvestDate, plantingDate, expectedHarvestDate time.Time, growthCycleDays int) (bool, string) {
	if harvestDate.Before(plantingDate) {
		return false, "采收日期不能早于种植日期"
	}

	if growthCycleDays > 0 {
		minHarvestDate := plantingDate.AddDate(0, 0, growthCycleDays*8/10)
		if harvestDate.Before(minHarvestDate) {
			return false, fmt.Sprintf("采收日期过早，建议在种植后%d天以上采收", growthCycleDays*8/10)
		}
	}

	if !expectedHarvestDate.IsZero() {
		maxDeviationDays := 60
		minAllowed := expectedHarvestDate.AddDate(0, 0, -maxDeviationDays)
		maxAllowed := expectedHarvestDate.AddDate(0, 0, maxDeviationDays)

		if harvestDate.Before(minAllowed) {
			return false, fmt.Sprintf("采收日期过早，距离预计采收日期超过%d天", maxDeviationDays)
		}

		if harvestDate.After(maxAllowed) {
			return false, fmt.Sprintf("采收日期过晚，距离预计采收日期超过%d天", maxDeviationDays)
		}
	}

	return true, ""
}

// GetSafetyIntervalSummary 获取安全间隔期检查摘要
// result: 检查结果
// 返回摘要字符串
func GetSafetyIntervalSummary(result *SafetyCheckResult) string {
	if result == nil {
		return "未进行安全间隔期检查"
	}

	if result.Passed {
		return fmt.Sprintf("安全间隔期检查通过 - %s", result.Remark)
	}

	return fmt.Sprintf("安全间隔期检查不通过 - %s", result.Remark)
}

// IsSafeForHarvest 判断是否可以采收
// db: 数据库连接
// plotID: 地块ID
// harvestDate: 采收日期
// 返回是否可以采收和原因
func IsSafeForHarvest(db *sql.DB, plotID int64, harvestDate time.Time) (bool, string, error) {
	result, err := CheckSafetyInterval(db, plotID, harvestDate)
	if err != nil {
		return false, "", err
	}

	return result.Passed, result.Remark, nil
}
