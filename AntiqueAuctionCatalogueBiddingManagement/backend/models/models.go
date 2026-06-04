package models

import "time"

type User struct {
	ID        int       `json:"id"`
	Username  string    `json:"username"`
	Password  string    `json:"-"`
	RealName  string    `json:"real_name"`
	Role      string    `json:"role"`
	Phone     string    `json:"phone"`
	Email     string    `json:"email"`
	Status    int       `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Auction struct {
	ID               int       `json:"id"`
	Name             string    `json:"name"`
	AuctionNo        string    `json:"auction_no"`
	PreviewStartDate string    `json:"preview_start_date"`
	PreviewEndDate   string    `json:"preview_end_date"`
	PreviewLocation  string    `json:"preview_location"`
	AuctionDate      string    `json:"auction_date"`
	AuctionLocation  string    `json:"auction_location"`
	Status           string    `json:"status"`
	Description      string    `json:"description"`
	CreatedBy        int       `json:"created_by"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type Lot struct {
	ID           int       `json:"id"`
	AuctionID    int       `json:"auction_id"`
	LotNumber    int       `json:"lot_number"`
	Name         string    `json:"name"`
	Era          string    `json:"era"`
	Category     string    `json:"category"`
	EstimateMin  float64   `json:"estimate_min"`
	EstimateMax  float64   `json:"estimate_max"`
	ReservePrice float64   `json:"reserve_price,omitempty"`
	Provenance   string    `json:"provenance"`
	Description  string    `json:"description"`
	Dimensions   string    `json:"dimensions"`
	Material     string    `json:"material"`
	ConditionNote string   `json:"condition_note"`
	SortOrder    int       `json:"sort_order"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	Images       []LotImage `json:"images,omitempty"`
}

type LotImage struct {
	ID            int    `json:"id"`
	LotID         int    `json:"lot_id"`
	ImageURL      string `json:"image_url"`
	ThumbnailURL  string `json:"thumbnail_url"`
	ImageName     string `json:"image_name"`
	SortOrder     int    `json:"sort_order"`
	IsPrimary     int    `json:"is_primary"`
}

type Bidder struct {
	ID          int       `json:"id"`
	BidderNo    string    `json:"bidder_no"`
	Name        string    `json:"name"`
	Gender      string    `json:"gender"`
	IDCard      string    `json:"id_card"`
	Phone       string    `json:"phone"`
	Email       string    `json:"email"`
	Address     string    `json:"address"`
	Company     string    `json:"company"`
	BankAccount string    `json:"bank_account"`
	BankName    string    `json:"bank_name"`
	Remark      string    `json:"remark"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type BidderQualification struct {
	ID                  int       `json:"id"`
	AuctionID           int       `json:"auction_id"`
	BidderID            int       `json:"bidder_id"`
	PaddleNumber        string    `json:"paddle_number"`
	DepositAmount       float64   `json:"deposit_amount"`
	DepositPaid         int       `json:"deposit_paid"`
	DepositPaidAt       string    `json:"deposit_paid_at"`
	IDVerified          int       `json:"id_verified"`
	BankStatementVerified int     `json:"bank_statement_verified"`
	HighValueBidder     int       `json:"high_value_bidder"`
	QualificationStatus string    `json:"qualification_status"`
	ApprovedBy          int       `json:"approved_by"`
	ApprovedAt          string    `json:"approved_at"`
	RejectReason        string    `json:"reject_reason"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
	Bidder              *Bidder   `json:"bidder,omitempty"`
}

type PreviewAppointment struct {
	ID              int       `json:"id"`
	AuctionID       int       `json:"auction_id"`
	BidderID        int       `json:"bidder_id"`
	AppointmentDate string    `json:"appointment_date"`
	AppointmentTime string    `json:"appointment_time"`
	VisitorCount    int       `json:"visitor_count"`
	CheckIn         int       `json:"check_in"`
	CheckInTime     string    `json:"check_in_time"`
	Remark          string    `json:"remark"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	Bidder          *Bidder   `json:"bidder,omitempty"`
}

type AuctionResult struct {
	ID                   int       `json:"id"`
	LotID                int       `json:"lot_id"`
	AuctionID            int       `json:"auction_id"`
	HammerPrice          float64   `json:"hammer_price"`
	BuyerPaddleNumber    string    `json:"buyer_paddle_number"`
	BuyerQualificationID int       `json:"buyer_qualification_id"`
	IsUnsold             int       `json:"is_unsold"`
	EnteredBy            int       `json:"entered_by"`
	EnteredAt            time.Time `json:"entered_at"`
	UpdatedAt            time.Time `json:"updated_at"`
	Remark               string    `json:"remark"`
	Lot                  *Lot      `json:"lot,omitempty"`
}
