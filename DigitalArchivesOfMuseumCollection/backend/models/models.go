package models

import (
	"time"
)

type User struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Username   string    `gorm:"size:50;uniqueIndex" json:"username"`
	Password   string    `gorm:"size:255" json:"-"`
	RealName   string    `gorm:"size:50" json:"real_name"`
	Phone      string    `gorm:"size:20" json:"phone"`
	Department string    `gorm:"size:50" json:"department"`
	Role       string    `gorm:"size:20;default:'staff'" json:"role"`
	Status     int8      `gorm:"default:1" json:"status"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type Category struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Code        string    `gorm:"size:50;uniqueIndex" json:"code"`
	Name        string    `gorm:"size:100" json:"name"`
	ParentID    uint      `gorm:"default:0" json:"parent_id"`
	Description string    `gorm:"type:text" json:"description"`
	SortOrder   int       `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Collection struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	CollectionNo    string         `gorm:"size:100;uniqueIndex" json:"collection_no"`
	CategoryID      *uint          `json:"category_id"`
	CategoryNo      string         `gorm:"size:50" json:"category_no"`
	Name            string         `gorm:"size:200" json:"name"`
	Era             string         `gorm:"size:100" json:"era"`
	Source          string         `gorm:"size:50" json:"source"`
	Material        string         `gorm:"size:100" json:"material"`
	Level           string         `gorm:"size:20;default:'一般'" json:"level"`
	ValueAssessment *float64       `gorm:"type:decimal(15,2)" json:"value_assessment"`
	CurrentLocation string         `gorm:"size:200" json:"current_location"`
	QRCode          string         `gorm:"size:200;uniqueIndex" json:"qr_code"`
	Description     string         `gorm:"type:text" json:"description"`
	Dimensions      string         `gorm:"size:200" json:"dimensions"`
	Weight          *float64       `gorm:"type:decimal(10,3)" json:"weight"`
	Status          string         `gorm:"size:20;default:'在库'" json:"status"`
	KeeperID        *uint          `json:"keeper_id"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	Photos          []CollectionPhoto `gorm:"foreignKey:CollectionID" json:"photos,omitempty"`
	Models3D        []Collection3DModel `gorm:"foreignKey:CollectionID" json:"models_3d,omitempty"`
}

type CollectionPhoto struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	CollectionID uint      `json:"collection_id"`
	FileName     string    `gorm:"size:255" json:"file_name"`
	FilePath     string    `gorm:"size:500" json:"file_path"`
	FileSize     int64     `json:"file_size"`
	FileType     string    `gorm:"size:50" json:"file_type"`
	Angle        string    `gorm:"size:50" json:"angle"`
	IsPrimary    int8      `gorm:"default:0" json:"is_primary"`
	UploadedBy   *uint     `json:"uploaded_by"`
	CreatedAt    time.Time `json:"created_at"`
	SignedURL    string    `gorm:"-" json:"signed_url,omitempty"`
}

type Collection3DModel struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	CollectionID uint      `json:"collection_id"`
	FileName     string    `gorm:"size:255" json:"file_name"`
	FilePath     string    `gorm:"size:500" json:"file_path"`
	FileSize     int64     `json:"file_size"`
	FileFormat   string    `gorm:"size:10" json:"file_format"`
	Description  string    `gorm:"type:text" json:"description"`
	UploadedBy   *uint     `json:"uploaded_by"`
	CreatedAt    time.Time `json:"created_at"`
	SignedURL    string    `gorm:"-" json:"signed_url,omitempty"`
}

type Location struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:100" json:"name"`
	Type        string    `gorm:"size:20;default:'库房'" json:"type"`
	Building    string    `gorm:"size:100" json:"building"`
	Floor       string    `gorm:"size:50" json:"floor"`
	RoomNo      string    `gorm:"size:50" json:"room_no"`
	ShelfNo     string    `gorm:"size:50" json:"shelf_no"`
	Description string    `gorm:"type:text" json:"description"`
	Status      int8      `gorm:"default:1" json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type MovementRecord struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	MovementNo        string    `gorm:"size:50;uniqueIndex" json:"movement_no"`
	CollectionID      uint      `json:"collection_id"`
	MovementType      string    `gorm:"size:20" json:"movement_type"`
	FromLocation      string    `gorm:"size:200" json:"from_location"`
	ToLocation        string    `gorm:"size:200" json:"to_location"`
	Reason            string    `gorm:"type:text" json:"reason"`
	ExhibitionName    string    `gorm:"size:200" json:"exhibition_name"`
	Borrower          string    `gorm:"size:100" json:"borrower"`
	BorrowerContact   string    `gorm:"size:50" json:"borrower_contact"`
	BorrowerPhone     string    `gorm:"size:20" json:"borrower_phone"`
	ExpectedReturnDate *time.Time `json:"expected_return_date"`
	ActualReturnDate   *time.Time `json:"actual_return_date"`
	ApplicantID       *uint     `json:"applicant_id"`
	ApproverID        *uint     `json:"approver_id"`
	ApprovedAt        *time.Time `json:"approved_at"`
	OutHandoverID     *uint     `json:"out_handover_id"`
	OutHandoverAt     *time.Time `json:"out_handover_at"`
	InHandoverID      *uint     `json:"in_handover_id"`
	InHandoverAt      *time.Time `json:"in_handover_at"`
	OutSignatureURL   string    `gorm:"size:500" json:"out_signature_url"`
	InSignatureURL    string    `gorm:"size:500" json:"in_signature_url"`
	Status            string    `gorm:"size:20;default:'待审批'" json:"status"`
	Remarks           string    `gorm:"type:text" json:"remarks"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
	Collection        *Collection `gorm:"foreignKey:CollectionID" json:"collection,omitempty"`
	PackingLists      []PackingList `gorm:"foreignKey:MovementID" json:"packing_lists,omitempty"`
}

type PackingList struct {
	ID               uint             `gorm:"primaryKey" json:"id"`
	ListNo           string           `gorm:"size:50;uniqueIndex" json:"list_no"`
	MovementID       uint             `json:"movement_id"`
	BoxNo            string           `gorm:"size:50" json:"box_no"`
	CollectionCount  int              `gorm:"default:0" json:"collection_count"`
	CreatedBy        *uint            `json:"created_by"`
	CreatedAt        time.Time        `json:"created_at"`
	Items            []PackingListItem `gorm:"foreignKey:PackingListID" json:"items,omitempty"`
}

type PackingListItem struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	PackingListID uint      `json:"packing_list_id"`
	CollectionID  uint      `json:"collection_id"`
	CollectionNo  string    `gorm:"size:100" json:"collection_no"`
	CollectionName string   `gorm:"size:200" json:"collection_name"`
	Remarks       string    `gorm:"size:500" json:"remarks"`
	CreatedAt     time.Time `json:"created_at"`
}

type InventoryPlan struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	PlanNo         string    `gorm:"size:50;uniqueIndex" json:"plan_no"`
	PlanName       string    `gorm:"size:200" json:"plan_name"`
	PlanDate       *time.Time `json:"plan_date"`
	LocationScope  string    `gorm:"size:500" json:"location_scope"`
	CategoryScope  string    `gorm:"size:500" json:"category_scope"`
	Status         string    `gorm:"size:20;default:'待执行'" json:"status"`
	TotalCount     int       `gorm:"default:0" json:"total_count"`
	CheckedCount   int       `gorm:"default:0" json:"checked_count"`
	MissingCount   int       `gorm:"default:0" json:"missing_count"`
	CreatorID      *uint     `json:"creator_id"`
	ExecutorID     *uint     `json:"executor_id"`
	StartTime      *time.Time `json:"start_time"`
	EndTime        *time.Time `json:"end_time"`
	Remarks        string    `gorm:"type:text" json:"remarks"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	Items          []InventoryItem `gorm:"foreignKey:PlanID" json:"items,omitempty"`
}

type InventoryItem struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	PlanID           uint      `json:"plan_id"`
	CollectionID     uint      `json:"collection_id"`
	CollectionNo     string    `gorm:"size:100" json:"collection_no"`
	CollectionName   string    `gorm:"size:200" json:"collection_name"`
	ExpectedLocation string    `gorm:"size:200" json:"expected_location"`
	ActualLocation   string    `gorm:"size:200" json:"actual_location"`
	Status           string    `gorm:"size:20;default:'待盘点'" json:"status"`
	CheckedBy        *uint     `json:"checked_by"`
	CheckedAt        *time.Time `json:"checked_at"`
	IsOffline        int8      `gorm:"default:0" json:"is_offline"`
	Remarks          string    `gorm:"type:text" json:"remarks"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type StatusRecord struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	CollectionID       uint      `json:"collection_id"`
	OldStatus          string    `gorm:"size:50" json:"old_status"`
	NewStatus          string    `gorm:"size:50" json:"new_status"`
	ChangeReason       string    `gorm:"type:text" json:"change_reason"`
	DamageDescription  string    `gorm:"type:text" json:"damage_description"`
	RepairPlan         string    `gorm:"type:text" json:"repair_plan"`
	RecordType         string    `gorm:"size:20" json:"record_type"`
	RecorderID         *uint     `json:"recorder_id"`
	AttachmentURLs     string    `gorm:"type:text" json:"attachment_urls"`
	CreatedAt          time.Time `json:"created_at"`
}

type OperationLog struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	UserID        *uint     `json:"user_id"`
	Username      string    `gorm:"size:50" json:"username"`
	Module        string    `gorm:"size:50" json:"module"`
	Operation     string    `gorm:"size:50" json:"operation"`
	TargetID      *uint     `json:"target_id"`
	TargetType    string    `gorm:"size:50" json:"target_type"`
	IPAddress     string    `gorm:"size:50" json:"ip_address"`
	UserAgent     string    `gorm:"size:500" json:"user_agent"`
	RequestParams string    `gorm:"type:text" json:"request_params"`
	ResponseData  string    `gorm:"type:text" json:"response_data"`
	Status        int8      `gorm:"default:1" json:"status"`
	ErrorMessage  string    `gorm:"type:text" json:"error_message"`
	CreatedAt     time.Time `json:"created_at"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  *User  `json:"user"`
}

type Pagination struct {
	Page     int `form:"page" json:"page"`
	PageSize int `form:"page_size" json:"page_size"`
}

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}
