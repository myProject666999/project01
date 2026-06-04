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

type LotRequest struct {
	AuctionID     int     `json:"auction_id" binding:"required"`
	LotNumber     int     `json:"lot_number" binding:"required"`
	Name          string  `json:"name" binding:"required"`
	Era           string  `json:"era"`
	Category      string  `json:"category"`
	EstimateMin   float64 `json:"estimate_min"`
	EstimateMax   float64 `json:"estimate_max"`
	ReservePrice  float64 `json:"reserve_price"`
	Provenance    string  `json:"provenance"`
	Description   string  `json:"description"`
	Dimensions    string  `json:"dimensions"`
	Material      string  `json:"material"`
	ConditionNote string  `json:"condition_note"`
	SortOrder     int     `json:"sort_order"`
	Status        string  `json:"status"`
}

type LotImageRequest struct {
	ImageURL     string `json:"image_url" binding:"required"`
	ThumbnailURL string `json:"thumbnail_url"`
	ImageName    string `json:"image_name"`
	SortOrder    int    `json:"sort_order"`
	IsPrimary    int    `json:"is_primary"`
}

func CreateLot(c *gin.Context) {
	var req LotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	result, err := models.DB.Exec(`INSERT INTO lots (auction_id, lot_number, name, era, category, estimate_min, 
		estimate_max, reserve_price, provenance, description, dimensions, material, condition_note, sort_order, status) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		req.AuctionID, req.LotNumber, req.Name, req.Era, req.Category, req.EstimateMin,
		req.EstimateMax, req.ReservePrice, req.Provenance, req.Description, req.Dimensions,
		req.Material, req.ConditionNote, req.SortOrder, req.Status)

	if err != nil {
		utils.InternalError(c, "创建拍品失败: "+err.Error())
		return
	}

	id, _ := result.LastInsertId()
	utils.Success(c, gin.H{"id": id})
}

func GetLotList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	auctionID := c.Query("auction_id")
	status := c.Query("status")
	keyword := c.Query("keyword")

	userRole := middleware.GetUserRole(c)
	canSeeReserve := (userRole == "admin")

	offset := (page - 1) * pageSize

	where := "WHERE 1=1"
	args := []interface{}{}

	if auctionID != "" {
		where += " AND l.auction_id = ?"
		args = append(args, auctionID)
	}
	if status != "" {
		where += " AND l.status = ?"
		args = append(args, status)
	}
	if keyword != "" {
		where += " AND (l.name LIKE ? OR l.lot_number LIKE ?)"
		args = append(args, "%"+keyword+"%", "%"+keyword+"%")
	}

	countQuery := "SELECT COUNT(*) FROM lots l " + where
	var total int
	err := models.DB.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		utils.InternalError(c, "查询总数失败")
		return
	}

	reserveField := "NULL"
	if canSeeReserve {
		reserveField = "l.reserve_price"
	}

	query := `SELECT l.id, l.auction_id, l.lot_number, l.name, l.era, l.category, l.estimate_min, 
		l.estimate_max, ` + reserveField + `, l.provenance, l.description, l.dimensions, l.material, 
		l.condition_note, l.sort_order, l.status, l.created_at, l.updated_at 
		FROM lots l ` + where + ` ORDER BY l.sort_order ASC, l.lot_number ASC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := models.DB.Query(query, args...)
	if err != nil {
		utils.InternalError(c, "查询失败")
		return
	}
	defer rows.Close()

	var lots []models.Lot
	for rows.Next() {
		var lot models.Lot
		var reservePrice sql.NullFloat64
		err := rows.Scan(&lot.ID, &lot.AuctionID, &lot.LotNumber, &lot.Name, &lot.Era, &lot.Category,
			&lot.EstimateMin, &lot.EstimateMax, &reservePrice, &lot.Provenance, &lot.Description,
			&lot.Dimensions, &lot.Material, &lot.ConditionNote, &lot.SortOrder, &lot.Status,
			&lot.CreatedAt, &lot.UpdatedAt)
		if err != nil {
			continue
		}
		if canSeeReserve && reservePrice.Valid {
			lot.ReservePrice = reservePrice.Float64
		}
		lots = append(lots, lot)
	}

	utils.Success(c, gin.H{
		"list":      lots,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetLot(c *gin.Context) {
	id := c.Param("id")
	userRole := middleware.GetUserRole(c)
	canSeeReserve := (userRole == "admin")

	reserveField := "NULL"
	if canSeeReserve {
		reserveField = "reserve_price"
	}

	var lot models.Lot
	var reservePrice sql.NullFloat64
	err := models.DB.QueryRow(`SELECT id, auction_id, lot_number, name, era, category, estimate_min, 
		estimate_max, `+reserveField+`, provenance, description, dimensions, material, condition_note, 
		sort_order, status, created_at, updated_at FROM lots WHERE id = ?`, id).
		Scan(&lot.ID, &lot.AuctionID, &lot.LotNumber, &lot.Name, &lot.Era, &lot.Category,
			&lot.EstimateMin, &lot.EstimateMax, &reservePrice, &lot.Provenance, &lot.Description,
			&lot.Dimensions, &lot.Material, &lot.ConditionNote, &lot.SortOrder, &lot.Status,
			&lot.CreatedAt, &lot.UpdatedAt)

	if err == sql.ErrNoRows {
		utils.NotFound(c, "拍品不存在")
		return
	}
	if err != nil {
		utils.InternalError(c, "查询失败")
		return
	}

	if canSeeReserve && reservePrice.Valid {
		lot.ReservePrice = reservePrice.Float64
	}

	imgRows, err := models.DB.Query("SELECT id, lot_id, image_url, thumbnail_url, image_name, sort_order, is_primary FROM lot_images WHERE lot_id = ? ORDER BY sort_order ASC", id)
	if err == nil {
		defer imgRows.Close()
		var images []models.LotImage
		for imgRows.Next() {
			var img models.LotImage
			imgRows.Scan(&img.ID, &img.LotID, &img.ImageURL, &img.ThumbnailURL, &img.ImageName, &img.SortOrder, &img.IsPrimary)
			images = append(images, img)
		}
		lot.Images = images
	}

	utils.Success(c, lot)
}

func UpdateLot(c *gin.Context) {
	id := c.Param("id")
	var req LotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	_, err := models.DB.Exec(`UPDATE lots SET auction_id=?, lot_number=?, name=?, era=?, category=?, 
		estimate_min=?, estimate_max=?, reserve_price=?, provenance=?, description=?, dimensions=?, 
		material=?, condition_note=?, sort_order=?, status=?, updated_at=? WHERE id=?`,
		req.AuctionID, req.LotNumber, req.Name, req.Era, req.Category, req.EstimateMin,
		req.EstimateMax, req.ReservePrice, req.Provenance, req.Description, req.Dimensions,
		req.Material, req.ConditionNote, req.SortOrder, req.Status, time.Now(), id)

	if err != nil {
		utils.InternalError(c, "更新失败")
		return
	}

	utils.Success(c, nil)
}

func UpdateLotSortOrder(c *gin.Context) {
	var req []struct {
		ID        int `json:"id" binding:"required"`
		SortOrder int `json:"sort_order" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	tx, err := models.DB.Begin()
	if err != nil {
		utils.InternalError(c, "事务开始失败")
		return
	}

	for _, item := range req {
		_, err := tx.Exec("UPDATE lots SET sort_order=?, updated_at=? WHERE id=?", item.SortOrder, time.Now(), item.ID)
		if err != nil {
			tx.Rollback()
			utils.InternalError(c, "更新排序失败")
			return
		}
	}

	tx.Commit()
	utils.Success(c, nil)
}

func DeleteLot(c *gin.Context) {
	id := c.Param("id")
	_, err := models.DB.Exec("DELETE FROM lots WHERE id=?", id)
	if err != nil {
		utils.InternalError(c, "删除失败")
		return
	}
	utils.Success(c, nil)
}

func AddLotImage(c *gin.Context) {
	lotID := c.Param("id")
	var req LotImageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	result, err := models.DB.Exec(`INSERT INTO lot_images (lot_id, image_url, thumbnail_url, image_name, sort_order, is_primary) 
		VALUES (?, ?, ?, ?, ?, ?)`, lotID, req.ImageURL, req.ThumbnailURL, req.ImageName, req.SortOrder, req.IsPrimary)

	if err != nil {
		utils.InternalError(c, "添加图片失败")
		return
	}

	id, _ := result.LastInsertId()
	utils.Success(c, gin.H{"id": id})
}

func DeleteLotImage(c *gin.Context) {
	imageID := c.Param("image_id")
	_, err := models.DB.Exec("DELETE FROM lot_images WHERE id=?", imageID)
	if err != nil {
		utils.InternalError(c, "删除图片失败")
		return
	}
	utils.Success(c, nil)
}
