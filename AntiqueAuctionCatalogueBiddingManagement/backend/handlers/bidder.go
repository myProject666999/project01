package handlers

import (
	"antique-auction/models"
	"antique-auction/utils"
	"database/sql"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type BidderRequest struct {
	BidderNo    string `json:"bidder_no"`
	Name        string `json:"name" binding:"required"`
	Gender      string `json:"gender"`
	IDCard      string `json:"id_card" binding:"required"`
	Phone       string `json:"phone" binding:"required"`
	Email       string `json:"email"`
	Address     string `json:"address"`
	Company     string `json:"company"`
	BankAccount string `json:"bank_account"`
	BankName    string `json:"bank_name"`
	Remark      string `json:"remark"`
}

func CreateBidder(c *gin.Context) {
	var req BidderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	if req.BidderNo == "" {
		req.BidderNo = generateBidderNo()
	}

	result, err := models.DB.Exec(`INSERT INTO bidders (bidder_no, name, gender, id_card, phone, email, 
		address, company, bank_account, bank_name, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		req.BidderNo, req.Name, req.Gender, req.IDCard, req.Phone, req.Email,
		req.Address, req.Company, req.BankAccount, req.BankName, req.Remark)

	if err != nil {
		utils.InternalError(c, "创建竞买人失败: "+err.Error())
		return
	}

	id, _ := result.LastInsertId()
	utils.Success(c, gin.H{"id": id, "bidder_no": req.BidderNo})
}

func generateBidderNo() string {
	prefix := "B" + time.Now().Format("20060102")
	var maxNo string
	models.DB.QueryRow("SELECT bidder_no FROM bidders WHERE bidder_no LIKE ? ORDER BY bidder_no DESC LIMIT 1", prefix+"%").Scan(&maxNo)
	if maxNo == "" {
		return prefix + "001"
	}
	num, _ := strconv.Atoi(maxNo[len(maxNo)-3:])
	return prefix + strconv.Itoa(num+1)
}

func GetBidderList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	where := "WHERE 1=1"
	args := []interface{}{}

	if keyword != "" {
		where += " AND (name LIKE ? OR phone LIKE ? OR id_card LIKE ? OR bidder_no LIKE ?)"
		args = append(args, "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	countQuery := "SELECT COUNT(*) FROM bidders " + where
	var total int
	err := models.DB.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		utils.InternalError(c, "查询总数失败")
		return
	}

	query := `SELECT id, bidder_no, name, gender, id_card, phone, email, address, company, 
		bank_account, bank_name, remark, created_at, updated_at FROM bidders ` + where + ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := models.DB.Query(query, args...)
	if err != nil {
		utils.InternalError(c, "查询失败")
		return
	}
	defer rows.Close()

	var bidders []models.Bidder
	for rows.Next() {
		var bidder models.Bidder
		err := rows.Scan(&bidder.ID, &bidder.BidderNo, &bidder.Name, &bidder.Gender, &bidder.IDCard,
			&bidder.Phone, &bidder.Email, &bidder.Address, &bidder.Company, &bidder.BankAccount,
			&bidder.BankName, &bidder.Remark, &bidder.CreatedAt, &bidder.UpdatedAt)
		if err != nil {
			continue
		}
		bidders = append(bidders, bidder)
	}

	utils.Success(c, gin.H{
		"list":      bidders,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetBidder(c *gin.Context) {
	id := c.Param("id")
	var bidder models.Bidder
	err := models.DB.QueryRow(`SELECT id, bidder_no, name, gender, id_card, phone, email, address, company, 
		bank_account, bank_name, remark, created_at, updated_at FROM bidders WHERE id = ?`, id).
		Scan(&bidder.ID, &bidder.BidderNo, &bidder.Name, &bidder.Gender, &bidder.IDCard,
			&bidder.Phone, &bidder.Email, &bidder.Address, &bidder.Company, &bidder.BankAccount,
			&bidder.BankName, &bidder.Remark, &bidder.CreatedAt, &bidder.UpdatedAt)

	if err == sql.ErrNoRows {
		utils.NotFound(c, "竞买人不存在")
		return
	}
	if err != nil {
		utils.InternalError(c, "查询失败")
		return
	}

	utils.Success(c, bidder)
}

func UpdateBidder(c *gin.Context) {
	id := c.Param("id")
	var req BidderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	_, err := models.DB.Exec(`UPDATE bidders SET name=?, gender=?, id_card=?, phone=?, email=?, address=?, 
		company=?, bank_account=?, bank_name=?, remark=?, updated_at=? WHERE id=?`,
		req.Name, req.Gender, req.IDCard, req.Phone, req.Email, req.Address,
		req.Company, req.BankAccount, req.BankName, req.Remark, time.Now(), id)

	if err != nil {
		utils.InternalError(c, "更新失败")
		return
	}

	utils.Success(c, nil)
}

func DeleteBidder(c *gin.Context) {
	id := c.Param("id")
	_, err := models.DB.Exec("DELETE FROM bidders WHERE id=?", id)
	if err != nil {
		utils.InternalError(c, "删除失败")
		return
	}
	utils.Success(c, nil)
}
