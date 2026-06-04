package models

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type SuccessResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

type ErrorResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Error   interface{} `json:"error,omitempty"`
}

type Pagination struct {
	Total       int64 `json:"total"`
	Page        int   `json:"page"`
	PageSize    int   `json:"page_size"`
	TotalPages  int   `json:"total_pages"`
	HasNext     bool  `json:"has_next"`
	HasPrev     bool  `json:"has_prev"`
}

type PaginatedResponse struct {
	Code       int         `json:"code"`
	Message    string      `json:"message"`
	Data       interface{} `json:"data"`
	Pagination Pagination  `json:"pagination"`
}

func NewSuccess(data interface{}) Response {
	return Response{
		Code:    200,
		Message: "success",
		Data:    data,
	}
}

func NewSuccessWithMessage(message string, data interface{}) Response {
	return Response{
		Code:    200,
		Message: message,
		Data:    data,
	}
}

func NewError(code int, message string) Response {
	return Response{
		Code:    code,
		Message: message,
	}
}

func NewErrorWithDetail(code int, message string, err interface{}) Response {
	return Response{
		Code:    code,
		Message: message,
		Data:    err,
	}
}

func NewPaginated(data interface{}, total int64, page, pageSize int) PaginatedResponse {
	totalPages := int(total) / pageSize
	if int(total)%pageSize != 0 {
		totalPages++
	}

	return PaginatedResponse{
		Code:    200,
		Message: "success",
		Data:    data,
		Pagination: Pagination{
			Total:      total,
			Page:       page,
			PageSize:   pageSize,
			TotalPages: totalPages,
			HasNext:    page < totalPages,
			HasPrev:    page > 1,
		},
	}
}
