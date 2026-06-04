package handlers

import (
	"antique-auction/middleware"
	"antique-auction/models"
	"antique-auction/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type AuctionResultRequest struct {
	LotID                int     `json:"lot_id" binding:"required"`
	AuctionID            int     `json:"auction_id" binding:"required"`
	HammerPrice          float64 `json:"hammer_price"`
	BuyerPaddleNumber    string  `json:"buyer_paddle_number"`
	BuyerQualificationID int     `json:"buyer_qualification_id"`
	IsUnsold             int     `json:"is_unsold"`
	Remark               string  `json:"remark"`
}

func CreateAuctionResult(c *gin.Context) {
	var req AuctionResultRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	userID := middleware.GetUserID(c)

	tx, err := models.DB.Begin()
	if err != nil {
		utils.InternalError(c, "事务开始失败")
		return
	}

	result, err := tx.Exec(`INSERT INTO auction_results (lot_id, auction_id, hammer_price, buyer_paddle_number, 
		buyer_qualification_id, is_unsold, entered_by, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		req.LotID, req.AuctionID, req.HammerPrice, req.BuyerPaddleNumber,
		req.BuyerQualificationID, req.IsUnsold, userID, req.Remark)

	if err != nil {
		tx.Rollback()
		utils.InternalError(c, "创建拍卖结果失败: "+err.Error())
		return
	}

	lotStatus := "sold"
	if req.IsUnsold == 1 {
		lotStatus = "unsold"
	}
	_, err = tx.Exec("UPDATE lots SET status=?, updated_at=? WHERE id=?", lotStatus, time.Now(), req.LotID)
	if err != nil {
		tx.Rollback()
		utils.InternalError(c, "更新拍品状态失败")
		return
	}

	tx.Commit()

	id, _ := result.LastInsertId()
	utils.Success(c, gin.H{"id": id})
}

func GetAuctionResultList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	auctionID := c.Query("auction_id")
	isUnsold := c.Query("is_unsold")

	offset := (page - 1) * pageSize

	where := "WHERE 1=1"
	args := []interface{}{}

	if auctionID != "" {
		where += " AND r.auction_id = ?"
		args = append(args, auctionID)
	}
	if isUnsold != "" {
		where += " AND r.is_unsold = ?"
		args = append(args, isUnsold)
	}

	countQuery := "SELECT COUNT(*) FROM auction_results r " + where
	var total int
	err := models.DB.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		utils.InternalError(c, "查询总数失败")
		return
	}

	query := `SELECT r.id, r.lot_id, r.auction_id, r.hammer_price, r.buyer_paddle_number, 
		r.buyer_qualification_id, r.is_unsold, r.entered_by, r.entered_at, r.updated_at, r.remark,
		l.lot_number, l.name, l.estimate_min, l.estimate_max
		FROM auction_results r 
		LEFT JOIN lots l ON r.lot_id = l.id ` + where + ` ORDER BY l.lot_number ASC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := models.DB.Query(query, args...)
	if err != nil {
		utils.InternalError(c, "查询失败")
		return
	}
	defer rows.Close()

	type ResultWithLot struct {
		models.AuctionResult
		LotNumber   int     `json:"lot_number"`
		LotName     string  `json:"lot_name"`
		EstimateMin float64 `json:"estimate_min"`
		EstimateMax float64 `json:"estimate_max"`
	}

	var results []ResultWithLot
	for rows.Next() {
		var r ResultWithLot
		err := rows.Scan(&r.ID, &r.LotID, &r.AuctionID, &r.HammerPrice, &r.BuyerPaddleNumber,
			&r.BuyerQualificationID, &r.IsUnsold, &r.EnteredBy, &r.EnteredAt, &r.UpdatedAt, &r.Remark,
			&r.LotNumber, &r.LotName, &r.EstimateMin, &r.EstimateMax)
		if err != nil {
			continue
		}
		results = append(results, r)
	}

	utils.Success(c, gin.H{
		"list":      results,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func UpdateAuctionResult(c *gin.Context) {
	id := c.Param("id")
	var req AuctionResultRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	tx, err := models.DB.Begin()
	if err != nil {
		utils.InternalError(c, "事务开始失败")
		return
	}

	_, err = tx.Exec(`UPDATE auction_results SET hammer_price=?, buyer_paddle_number=?, 
		buyer_qualification_id=?, is_unsold=?, remark=?, updated_at=? WHERE id=?`,
		req.HammerPrice, req.BuyerPaddleNumber, req.BuyerQualificationID,
		req.IsUnsold, req.Remark, time.Now(), id)

	if err != nil {
		tx.Rollback()
		utils.InternalError(c, "更新拍卖结果失败")
		return
	}

	lotStatus := "sold"
	if req.IsUnsold == 1 {
		lotStatus = "unsold"
	}
	_, err = tx.Exec("UPDATE lots SET status=?, updated_at=? WHERE id=?", lotStatus, time.Now(), req.LotID)
	if err != nil {
		tx.Rollback()
		utils.InternalError(c, "更新拍品状态失败")
		return
	}

	tx.Commit()
	utils.Success(c, nil)
}

func DeleteAuctionResult(c *gin.Context) {
	id := c.Param("id")

	var lotID int
	err := models.DB.QueryRow("SELECT lot_id FROM auction_results WHERE id=?", id).Scan(&lotID)
	if err != nil {
		utils.NotFound(c, "记录不存在")
		return
	}

	tx, err := models.DB.Begin()
	if err != nil {
		utils.InternalError(c, "事务开始失败")
		return
	}

	_, err = tx.Exec("DELETE FROM auction_results WHERE id=?", id)
	if err != nil {
		tx.Rollback()
		utils.InternalError(c, "删除失败")
		return
	}

	_, err = tx.Exec("UPDATE lots SET status='approved', updated_at=? WHERE id=?", time.Now(), lotID)
	if err != nil {
		tx.Rollback()
		utils.InternalError(c, "更新拍品状态失败")
		return
	}

	tx.Commit()
	utils.Success(c, nil)
}
