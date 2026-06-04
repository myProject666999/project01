package handlers

import (
	"antique-auction/models"
	"antique-auction/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type AppointmentRequest struct {
	AuctionID       int    `json:"auction_id" binding:"required"`
	BidderID        int    `json:"bidder_id" binding:"required"`
	AppointmentDate string `json:"appointment_date" binding:"required"`
	AppointmentTime string `json:"appointment_time"`
	VisitorCount    int    `json:"visitor_count"`
	Remark          string `json:"remark"`
}

func CreateAppointment(c *gin.Context) {
	var req AppointmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	if req.VisitorCount <= 0 {
		req.VisitorCount = 1
	}

	result, err := models.DB.Exec(`INSERT INTO preview_appointments (auction_id, bidder_id, appointment_date, appointment_time, visitor_count, remark) 
		VALUES (?, ?, ?, ?, ?, ?)`,
		req.AuctionID, req.BidderID, req.AppointmentDate, req.AppointmentTime, req.VisitorCount, req.Remark)

	if err != nil {
		utils.InternalError(c, "创建预约失败: "+err.Error())
		return
	}

	id, _ := result.LastInsertId()
	utils.Success(c, gin.H{"id": id})
}

func GetAppointmentList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	auctionID := c.Query("auction_id")
	date := c.Query("date")
	checkIn := c.Query("check_in")
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	where := "WHERE 1=1"
	args := []interface{}{}

	if auctionID != "" {
		where += " AND a.auction_id = ?"
		args = append(args, auctionID)
	}
	if date != "" {
		where += " AND a.appointment_date = ?"
		args = append(args, date)
	}
	if checkIn != "" {
		where += " AND a.check_in = ?"
		args = append(args, checkIn)
	}
	if keyword != "" {
		where += " AND (b.name LIKE ? OR b.phone LIKE ?)"
		args = append(args, "%"+keyword+"%", "%"+keyword+"%")
	}

	countQuery := `SELECT COUNT(*) FROM preview_appointments a 
		LEFT JOIN bidders b ON a.bidder_id = b.id ` + where
	var total int
	err := models.DB.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		utils.InternalError(c, "查询总数失败")
		return
	}

	query := `SELECT a.id, a.auction_id, a.bidder_id, a.appointment_date, a.appointment_time, a.visitor_count, 
		a.check_in, a.check_in_time, a.remark, a.created_at, a.updated_at,
		b.id, b.name, b.phone
		FROM preview_appointments a 
		LEFT JOIN bidders b ON a.bidder_id = b.id ` + where + ` ORDER BY a.appointment_date DESC, a.created_at DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := models.DB.Query(query, args...)
	if err != nil {
		utils.InternalError(c, "查询失败")
		return
	}
	defer rows.Close()

	var appointments []models.PreviewAppointment
	for rows.Next() {
		var a models.PreviewAppointment
		var b models.Bidder
		err := rows.Scan(&a.ID, &a.AuctionID, &a.BidderID, &a.AppointmentDate, &a.AppointmentTime, &a.VisitorCount,
			&a.CheckIn, &a.CheckInTime, &a.Remark, &a.CreatedAt, &a.UpdatedAt,
			&b.ID, &b.Name, &b.Phone)
		if err != nil {
			continue
		}
		a.Bidder = &b
		appointments = append(appointments, a)
	}

	utils.Success(c, gin.H{
		"list":      appointments,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func CheckInAppointment(c *gin.Context) {
	id := c.Param("id")
	now := time.Now().Format("2006-01-02 15:04:05")

	_, err := models.DB.Exec("UPDATE preview_appointments SET check_in=1, check_in_time=?, updated_at=? WHERE id=?", now, time.Now(), id)
	if err != nil {
		utils.InternalError(c, "签到失败")
		return
	}

	utils.Success(c, nil)
}

func DeleteAppointment(c *gin.Context) {
	id := c.Param("id")
	_, err := models.DB.Exec("DELETE FROM preview_appointments WHERE id=?", id)
	if err != nil {
		utils.InternalError(c, "删除失败")
		return
	}
	utils.Success(c, nil)
}
