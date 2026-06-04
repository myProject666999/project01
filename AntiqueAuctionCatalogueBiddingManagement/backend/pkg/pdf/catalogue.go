package pdf

import (
	"antique-auction/models"
	"fmt"
	"strconv"

	"github.com/jung-kurt/gofpdf"
)

type CatalogueData struct {
	Auction *models.Auction
	Lots    []models.Lot
}

func GenerateCatalogue(data *CatalogueData) (*gofpdf.Fpdf, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetAutoPageBreak(true, 20)
	pdf.SetMargins(20, 20, 20)

	addCover(pdf, data.Auction)
	addCatalogueInfo(pdf, data.Auction)
	addLots(pdf, data.Lots)

	return pdf, nil
}

func addCover(pdf *gofpdf.Fpdf, auction *models.Auction) {
	pdf.AddPage()

	pdf.SetFont("Arial", "B", 24)
	pdf.CellFormat(0, 40, "AUCTION CATALOGUE", "", 1, "C", false, 0, "")

	pdf.Ln(20)

	pdf.SetFont("Arial", "B", 20)
	pdf.CellFormat(0, 15, auction.Name, "", 1, "C", false, 0, "")

	pdf.Ln(10)

	pdf.SetFont("Arial", "", 14)
	pdf.CellFormat(0, 10, "Auction No.: "+auction.AuctionNo, "", 1, "C", false, 0, "")
	pdf.CellFormat(0, 10, "Date: "+auction.AuctionDate, "", 1, "C", false, 0, "")
	pdf.CellFormat(0, 10, "Venue: "+auction.AuctionLocation, "", 1, "C", false, 0, "")

	if auction.PreviewStartDate != "" {
		pdf.Ln(10)
		pdf.SetFont("Arial", "I", 12)
		pdf.CellFormat(0, 8, "Preview: "+auction.PreviewStartDate+" - "+auction.PreviewEndDate, "", 1, "C", false, 0, "")
		pdf.CellFormat(0, 8, "Preview Venue: "+auction.PreviewLocation, "", 1, "C", false, 0, "")
	}
}

func addCatalogueInfo(pdf *gofpdf.Fpdf, auction *models.Auction) {
	pdf.AddPage()

	pdf.SetFont("Arial", "B", 18)
	pdf.CellFormat(0, 15, "Important Information", "", 1, "L", false, 0, "")

	pdf.Ln(10)

	pdf.SetFont("Arial", "", 12)
	infoText := `
	This catalogue is published solely for the use of clients considering 
	bidding at the auction. All descriptions, estimates and illustrations 
	are for guidance only and do not constitute a warranty, representation 
	or assumption of liability by the auction house.

	All items are sold "as is" and without recourse. Prospective buyers 
	should inspect the items during the preview period.

	Bidding registration is required prior to the auction. 
	A deposit may be required.

	For further information, please contact our staff.
	`
	pdf.MultiCell(0, 8, infoText, "", "L", false)

	if auction.Description != "" {
		pdf.Ln(10)
		pdf.SetFont("Arial", "B", 14)
		pdf.CellFormat(0, 12, "Auction Description", "", 1, "L", false, 0, "")
		pdf.SetFont("Arial", "", 12)
		pdf.MultiCell(0, 8, auction.Description, "", "L", false)
	}
}

func addLots(pdf *gofpdf.Fpdf, lots []models.Lot) {
	for i, lot := range lots {
		if i > 0 {
			pdf.AddPage()
		}
		addLotPage(pdf, &lot)
	}
}

func addLotPage(pdf *gofpdf.Fpdf, lot *models.Lot) {
	pdf.SetFont("Arial", "B", 16)
	pdf.CellFormat(0, 12, "Lot "+strconv.Itoa(lot.LotNumber), "", 1, "L", false, 0, "")

	pdf.SetFont("Arial", "B", 14)
	pdf.CellFormat(0, 10, lot.Name, "", 1, "L", false, 0, "")

	pdf.Ln(5)

	// Image placeholder
	pdf.SetDrawColor(200, 200, 200)
	pdf.Rect(20, 50, 170, 100, "D")
	pdf.SetFont("Arial", "I", 10)
	pdf.SetXY(20, 95)
	pdf.CellFormat(170, 10, "[Image: "+lot.Name+"]", "", 1, "C", false, 0, "")

	pdf.SetY(160)

	// Details table
	pdf.SetFont("Arial", "B", 11)
	labelWidth := 40.0

	if lot.Era != "" {
		pdf.CellFormat(labelWidth, 8, "Era:", "", 0, "L", false, 0, "")
		pdf.SetFont("Arial", "", 11)
		pdf.CellFormat(0, 8, lot.Era, "", 1, "L", false, 0, "")
		pdf.SetFont("Arial", "B", 11)
	}

	if lot.Category != "" {
		pdf.CellFormat(labelWidth, 8, "Category:", "", 0, "L", false, 0, "")
		pdf.SetFont("Arial", "", 11)
		pdf.CellFormat(0, 8, lot.Category, "", 1, "L", false, 0, "")
		pdf.SetFont("Arial", "B", 11)
	}

	if lot.Dimensions != "" {
		pdf.CellFormat(labelWidth, 8, "Dimensions:", "", 0, "L", false, 0, "")
		pdf.SetFont("Arial", "", 11)
		pdf.CellFormat(0, 8, lot.Dimensions, "", 1, "L", false, 0, "")
		pdf.SetFont("Arial", "B", 11)
	}

	if lot.Material != "" {
		pdf.CellFormat(labelWidth, 8, "Material:", "", 0, "L", false, 0, "")
		pdf.SetFont("Arial", "", 11)
		pdf.CellFormat(0, 8, lot.Material, "", 1, "L", false, 0, "")
		pdf.SetFont("Arial", "B", 11)
	}

	// Estimate
	pdf.Ln(3)
	pdf.SetFont("Arial", "B", 11)
	estimate := fmt.Sprintf("Estimate: %.2f - %.2f", lot.EstimateMin, lot.EstimateMax)
	pdf.CellFormat(0, 10, estimate, "", 1, "L", false, 0, "")

	// Provenance
	if lot.Provenance != "" {
		pdf.Ln(3)
		pdf.SetFont("Arial", "B", 11)
		pdf.CellFormat(0, 8, "Provenance:", "", 1, "L", false, 0, "")
		pdf.SetFont("Arial", "", 10)
		pdf.MultiCell(0, 6, lot.Provenance, "", "L", false)
	}

	// Description
	if lot.Description != "" {
		pdf.Ln(3)
		pdf.SetFont("Arial", "B", 11)
		pdf.CellFormat(0, 8, "Description:", "", 1, "L", false, 0, "")
		pdf.SetFont("Arial", "", 10)
		pdf.MultiCell(0, 6, lot.Description, "", "L", false)
	}

	// Condition
	if lot.ConditionNote != "" {
		pdf.Ln(3)
		pdf.SetFont("Arial", "B", 11)
		pdf.CellFormat(0, 8, "Condition Note:", "", 1, "L", false, 0, "")
		pdf.SetFont("Arial", "", 10)
		pdf.MultiCell(0, 6, lot.ConditionNote, "", "L", false)
	}
}
