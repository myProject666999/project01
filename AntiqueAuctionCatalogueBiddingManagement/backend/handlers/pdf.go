package handlers

import (
	"antique-auction/models"
	"antique-auction/pkg/pdf"
	"antique-auction/utils"
	"bytes"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ExportCatalogue(c *gin.Context) {
	auctionID := c.Query("auction_id")
	if auctionID == "" {
		utils.BadRequest(c, "缺少拍卖会ID")
		return
	}

	var auction models.Auction
	err := models.DB.QueryRow(`SELECT id, name, auction_no, preview_start_date, preview_end_date, preview_location, 
		auction_date, auction_location, description FROM auctions WHERE id = ?`, auctionID).
		Scan(&auction.ID, &auction.Name, &auction.AuctionNo, &auction.PreviewStartDate,
			&auction.PreviewEndDate, &auction.PreviewLocation, &auction.AuctionDate,
			&auction.AuctionLocation, &auction.Description)
	if err != nil {
		utils.NotFound(c, "拍卖会不存在")
		return
	}

	rows, err := models.DB.Query(`SELECT id, auction_id, lot_number, name, era, category, estimate_min, estimate_max, 
		provenance, description, dimensions, material, condition_note 
		FROM lots WHERE auction_id = ? ORDER BY sort_order ASC, lot_number ASC`, auctionID)
	if err != nil {
		utils.InternalError(c, "查询拍品失败")
		return
	}
	defer rows.Close()

	var lots []models.Lot
	for rows.Next() {
		var lot models.Lot
		err := rows.Scan(&lot.ID, &lot.AuctionID, &lot.LotNumber, &lot.Name, &lot.Era, &lot.Category,
			&lot.EstimateMin, &lot.EstimateMax, &lot.Provenance, &lot.Description,
			&lot.Dimensions, &lot.Material, &lot.ConditionNote)
		if err != nil {
			continue
		}
		lots = append(lots, lot)
	}

	catalogueData := &pdf.CatalogueData{
		Auction: &auction,
		Lots:    lots,
	}

	pdfDoc, err := pdf.GenerateCatalogue(catalogueData)
	if err != nil {
		utils.InternalError(c, "生成PDF失败")
		return
	}

	var buf bytes.Buffer
	err = pdfDoc.Output(&buf)
	if err != nil {
		utils.InternalError(c, "生成PDF失败")
		return
	}

	filename := auction.AuctionNo + "_catalogue.pdf"
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Data(http.StatusOK, "application/pdf", buf.Bytes())
}
