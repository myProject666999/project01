package models

import "time"

type ApiAccessLog struct {
	ID             int64     `json:"id" db:"id"`
	APIPath        string    `json:"api_path" db:"api_path"`
	IPAddress      string    `json:"ip_address" db:"ip_address"`
	UserAgent      string    `json:"user_agent" db:"user_agent"`
	RequestMethod  string    `json:"request_method" db:"request_method"`
	ResponseStatus *int      `json:"response_status" db:"response_status"`
	IsBlocked      int8      `json:"is_blocked" db:"is_blocked"`
	BlockReason    string    `json:"block_reason" db:"block_reason"`
	RequestTime    time.Time `json:"request_time" db:"request_time"`
}

type IPBlacklist struct {
	ID        int64      `json:"id" db:"id"`
	IPAddress string     `json:"ip_address" db:"ip_address"`
	Reason    string     `json:"reason" db:"reason"`
	BlockedAt time.Time  `json:"blocked_at" db:"blocked_at"`
	ExpireAt  *time.Time `json:"expire_at" db:"expire_at"`
}
