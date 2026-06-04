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

type QualificationRequest struct {
	AuctionID           int     `json:"auction_id" binding:"required"`
	BidderID            int     `json:"bidder_id" binding:"required"`
	PaddleNumber        string  `json:"paddle_number"`
	DepositAmount       float64 `json:"deposit_amount"`
	DepositPaid         int     `json:"deposit_paid"`
	IDVerified          int     `json:"id_verified"`
	BankStatementVerified int   `json:"bank_statement_verified"`
	HighValueBidder     int     `json:"high_value_bidder"`
}

type QualificationReviewRequest struct {
	QualificationStatus string `json:"qualification_status" binding:"required"`
	RejectReason        string `json:"reject_reason"`
}

func CreateQualification(c *gin.Context) {
	var req QualificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	if req.PaddleNumber == "" {
		req.PaddleNumber = generatePaddleNumber(req.AuctionID)
	}

	result, err := models.DB.Exec(`INSERT INTO bidder_qualifications (auction_id, bidder_id, paddle_number, 
		deposit_amount, deposit_paid, id_verified, bank_statement_verified, high_value_bidder, qualification_status) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
		req.AuctionID, req.BidderID, req.PaddleNumber, req.DepositAmount,
		req.DepositPaid, req.IDVerified, req.BankStatementVerified, req.HighValueBidder)

	if err != nil {
		utils.InternalError(c, "创建资格审核失败: "+err.Error())
		return
	}

	id, _ := result.LastInsertId()
	utils.Success(c, gin.H{"id": id, "paddle_number": req.PaddleNumber})
}

func generatePaddleNumber(auctionID int) string {
	var maxNo string
	models.DB.QueryRow("SELECT paddle_number FROM bidder_qualifications WHERE auction_id = ? ORDER BY paddle_number DESC LIMIT 1", auctionID).Scan(&maxNo)
	if maxNo == "" {
		return "001"
	}
	num, _ := strconv.Atoi(maxNo)
	return strconv.Itoa(num + 1)
}

func GetQualificationList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	auctionID := c.Query("auction_id")
	status := c.Query("qualification_status")
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	where := "WHERE 1=1"
	args := []interface{}{}

	if auctionID != "" {
		where += " AND q.auction_id = ?"
		args = append(args, auctionID)
	}
	if status != "" {
		where += " AND q.qualification_status = ?"
		args = append(args, status)
	}
	if keyword != "" {
		where += " AND (b.name LIKE ? OR q.paddle_number LIKE ? OR b.phone LIKE ?)"
		args = append(args, "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	countQuery := `SELECT COUNT(*) FROM bidder_qualifications q 
		LEFT JOIN bidders b ON q.bidder_id = b.id ` + where
	var total int
	err := models.DB.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		utils.InternalError(c, "查询总数失败")
		return
	}

	query := `SELECT q.id, q.auction_id, q.bidder_id, q.paddle_number, q.deposit_amount, q.deposit_paid, 
		q.deposit_paid_at, q.id_verified, q.bank_statement_verified, q.high_value_bidder, 
		q.qualification_status, q.approved_by, q.approved_at, q.reject_reason, q.created_at, q.updated_at,
		b.id, b.name, b.phone, b.id_card
		FROM bidder_qualifications q 
		LEFT JOIN bidders b ON q.bidder_id = b.id ` + where + ` ORDER BY q.created_at DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := models.DB.Query(query, args...)
	if err != nil {
		utils.InternalError(c, "查询失败")
		return
	}
	defer rows.Close()

	var qualifications []models.BidderQualification
	for rows.Next() {
		var q models.BidderQualification
		var b models.Bidder
		err := rows.Scan(&q.ID, &q.AuctionID, &q.BidderID, &q.PaddleNumber, &q.DepositAmount, &q.DepositPaid,
			&q.DepositPaidAt, &q.IDVerified, &q.BankStatementVerified, &q.HighValueBidder,
			&q.QualificationStatus, &q.ApprovedBy, &q.ApprovedAt, &q.RejectReason, &q.CreatedAt, &q.UpdatedAt,
			&b.ID, &b.Name, &b.Phone, &b.IDCard)
		if err != nil {
			continue
		}
		q.Bidder = &b
		qualifications = append(qualifications, q)
	}

	utils.Success(c, gin.H{
		"list":      qualifications,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func ReviewQualification(c *gin.Context) {
	id := c.Param("id")
	userID := middleware.GetUserID(c)

	var req QualificationReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var approvedAt sql.NullString
	if req.QualificationStatus == "approved" {
		approvedAt.String = time.Now().Format("2006-01-02 15:04:05")
		approvedAt.Valid = true
	}

	_, err := models.DB.Exec(`UPDATE bidder_qualifications SET qualification_status=?, approved_by=?, approved_at=?, reject_reason=?, updated_at=? 
		WHERE id=?`, req.QualificationStatus, userID, approvedAt, req.RejectReason, time.Now(), id)

	if err != nil {
		utils.InternalError(c, "审核失败")
		return
	}

	utils.Success(c, nil)
}

func UpdateQualification(c *gin.Context) {
	id := c.Param("id")
	var req QualificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var depositPaidAt sql.NullString
	if req.DepositPaid == 1 {
		depositPaidAt.String = time.Now().Format("2006-01-02 15:04:05")
		depositPaidAt.Valid = true
	}

	_, err := models.DB.Exec(`UPDATE bidder_qualifications SET paddle_number=?, deposit_amount=?, deposit_paid=?, 
		deposit_paid_at=?, id_verified=?, bank_statement_verified=?, high_value_bidder=?, updated_at=? 
		WHERE id=?`, req.PaddleNumber, req.DepositAmount, req.DepositPaid, depositPaidAt,
		req.IDVerified, req.BankStatementVerified, req.HighValueBidder, time.Now(), id)

	if err != nil {
		utils.InternalError(c, "更新失败")
		return
	}

	utils.Success(c, nil)
}

func DeleteQualification(c *gin.Context) {
	id := c.Param("id")
	_, err := models.DB.Exec("DELETE FROM bidder_qualifications WHERE id=?", id)
	if err != nil {
		utils.InternalError(c, "删除失败")
		return
	}
	utils.Success(c, nil)
}
