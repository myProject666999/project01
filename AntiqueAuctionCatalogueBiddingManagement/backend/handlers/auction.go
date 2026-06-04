package handlers

import (
	"antique-auction/middleware"
	"antique-auction/models"
	"antique-auction/utils"
	"database/sql"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type AuctionRequest struct {
	Name             string `json:"name" binding:"required"`
	AuctionNo        string `json:"auction_no" binding:"required"`
	PreviewStartDate string `json:"preview_start_date"`
	PreviewEndDate   string `json:"preview_end_date"`
	PreviewLocation  string `json:"preview_location"`
	AuctionDate      string `json:"auction_date" binding:"required"`
	AuctionLocation  string `json:"auction_location"`
	Status           string `json:"status"`
	Description      string `json:"description"`
}

func CreateAuction(c *gin.Context) {
	var req AuctionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	userID := middleware.GetUserID(c)

	result, err := models.DB.Exec(`INSERT INTO auctions (name, auction_no, preview_start_date, preview_end_date, 
		preview_location, auction_date, auction_location, status, description, created_by) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		req.Name, req.AuctionNo, req.PreviewStartDate, req.PreviewEndDate,
		req.PreviewLocation, req.AuctionDate, req.AuctionLocation, req.Status, req.Description, userID)

	if err != nil {
		utils.InternalError(c, "创建拍卖会失败: "+err.Error())
		return
	}

	id, _ := result.LastInsertId()
	utils.Success(c, gin.H{"id": id})
}

func GetAuctionList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	where := "WHERE 1=1"
	args := []interface{}{}

	if status != "" {
		where += " AND status = ?"
		args = append(args, status)
	}
	if keyword != "" {
		where += " AND (name LIKE ? OR auction_no LIKE ?)"
		args = append(args, "%"+keyword+"%", "%"+keyword+"%")
	}

	countQuery := "SELECT COUNT(*) FROM auctions " + where
	var total int
	err := models.DB.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		utils.InternalError(c, "查询总数失败")
		return
	}

	query := `SELECT id, name, auction_no, preview_start_date, preview_end_date, preview_location, 
		auction_date, auction_location, status, description, created_by, created_at, updated_at 
		FROM auctions ` + where + ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := models.DB.Query(query, args...)
	if err != nil {
		utils.InternalError(c, "查询失败")
		return
	}
	defer rows.Close()

	var auctions []models.Auction
	for rows.Next() {
		var auction models.Auction
		err := rows.Scan(&auction.ID, &auction.Name, &auction.AuctionNo, &auction.PreviewStartDate,
			&auction.PreviewEndDate, &auction.PreviewLocation, &auction.AuctionDate, &auction.AuctionLocation,
			&auction.Status, &auction.Description, &auction.CreatedBy, &auction.CreatedAt, &auction.UpdatedAt)
		if err != nil {
			continue
		}
		auctions = append(auctions, auction)
	}

	utils.Success(c, gin.H{
		"list":     auctions,
		"total":    total,
		"page":     page,
		"page_size": pageSize,
	})
}

func GetAuction(c *gin.Context) {
	id := c.Param("id")
	var auction models.Auction
	err := models.DB.QueryRow(`SELECT id, name, auction_no, preview_start_date, preview_end_date, preview_location, 
		auction_date, auction_location, status, description, created_by, created_at, updated_at 
		FROM auctions WHERE id = ?`, id).Scan(&auction.ID, &auction.Name, &auction.AuctionNo, &auction.PreviewStartDate,
		&auction.PreviewEndDate, &auction.PreviewLocation, &auction.AuctionDate, &auction.AuctionLocation,
		&auction.Status, &auction.Description, &auction.CreatedBy, &auction.CreatedAt, &auction.UpdatedAt)

	if err == sql.ErrNoRows {
		utils.NotFound(c, "拍卖会不存在")
		return
	}
	if err != nil {
		utils.InternalError(c, "查询失败")
		return
	}

	utils.Success(c, auction)
}

func UpdateAuction(c *gin.Context) {
	id := c.Param("id")
	var req AuctionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	_, err := models.DB.Exec(`UPDATE auctions SET name=?, auction_no=?, preview_start_date=?, preview_end_date=?, 
		preview_location=?, auction_date=?, auction_location=?, status=?, description=?, updated_at=? 
		WHERE id=?`,
		req.Name, req.AuctionNo, req.PreviewStartDate, req.PreviewEndDate,
		req.PreviewLocation, req.AuctionDate, req.AuctionLocation, req.Status, req.Description, time.Now(), id)

	if err != nil {
		utils.InternalError(c, "更新失败: "+err.Error())
		return
	}

	utils.Success(c, nil)
}

func DeleteAuction(c *gin.Context) {
	id := c.Param("id")
	_, err := models.DB.Exec("DELETE FROM auctions WHERE id=?", id)
	if err != nil {
		utils.InternalError(c, "删除失败")
		return
	}
	utils.Success(c, nil)
}
