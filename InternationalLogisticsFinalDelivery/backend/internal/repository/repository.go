package repository

import (
	"logistics-final-delivery/internal/model"

	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

type BatchRepository interface {
	Create(batch *model.Batch) error
	GetByID(id uint64) (*model.Batch, error)
	GetByNo(batchNo string) (*model.Batch, error)
	List(page, pageSize int, warehouseID uint64) ([]model.Batch, int64, error)
	Update(batch *model.Batch) error
}

func (r *Repository) CreateBatch(batch *model.Batch) error {
	return r.db.Create(batch).Error
}

func (r *Repository) GetBatchByID(id uint64) (*model.Batch, error) {
	var batch model.Batch
	err := r.db.Preload("Warehouse").First(&batch, id).Error
	return &batch, err
}

func (r *Repository) GetBatchByNo(batchNo string) (*model.Batch, error) {
	var batch model.Batch
	err := r.db.Preload("Warehouse").Where("batch_no = ?", batchNo).First(&batch).Error
	return &batch, err
}

func (r *Repository) ListBatches(page, pageSize int, warehouseID uint64) ([]model.Batch, int64, error) {
	var batches []model.Batch
	var total int64

	query := r.db.Model(&model.Batch{})
	if warehouseID > 0 {
		query = query.Where("warehouse_id = ?", warehouseID)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	err := query.Preload("Warehouse").Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&batches).Error
	return batches, total, err
}

func (r *Repository) UpdateBatch(batch *model.Batch) error {
	return r.db.Save(batch).Error
}

type PackageRepository interface {
	Create(pkg *model.Package) error
	GetByID(id uint64) (*model.Package, error)
	GetByNo(packageNo string) (*model.Package, error)
	ListByBatch(batchID uint64, page, pageSize int) ([]model.Package, int64, error)
	Update(pkg *model.Package) error
	UpdateStatus(id uint64, status int8) error
}

func (r *Repository) CreatePackage(pkg *model.Package) error {
	return r.db.Create(pkg).Error
}

func (r *Repository) GetPackageByID(id uint64) (*model.Package, error) {
	var pkg model.Package
	err := r.db.Preload("Batch").Preload("Customer").Preload("Warehouse").Preload("Label").First(&pkg, id).Error
	return &pkg, err
}

func (r *Repository) GetPackageByNo(packageNo string) (*model.Package, error) {
	var pkg model.Package
	err := r.db.Preload("Batch").Preload("Customer").Preload("Warehouse").Preload("Label").Where("package_no = ?", packageNo).First(&pkg).Error
	return &pkg, err
}

func (r *Repository) ListPackagesByBatch(batchID uint64, page, pageSize int) ([]model.Package, int64, error) {
	var packages []model.Package
	var total int64

	query := r.db.Model(&model.Package{}).Where("batch_id = ?", batchID)
	query.Count(&total)
	offset := (page - 1) * pageSize
	err := query.Preload("Customer").Preload("Label").Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&packages).Error
	return packages, total, err
}

func (r *Repository) UpdatePackage(pkg *model.Package) error {
	return r.db.Save(pkg).Error
}

func (r *Repository) UpdatePackageStatus(id uint64, status int8) error {
	return r.db.Model(&model.Package{}).Where("id = ?", id).Update("status", status).Error
}

type CustomerRepository interface {
	Create(customer *model.Customer) error
	GetByID(id uint64) (*model.Customer, error)
	GetByPhone(phone string) (*model.Customer, error)
	Update(customer *model.Customer) error
}

func (r *Repository) CreateCustomer(customer *model.Customer) error {
	return r.db.Create(customer).Error
}

func (r *Repository) GetCustomerByID(id uint64) (*model.Customer, error) {
	var customer model.Customer
	err := r.db.First(&customer, id).Error
	return &customer, err
}

func (r *Repository) GetCustomerByPhone(phone string) (*model.Customer, error) {
	var customer model.Customer
	err := r.db.Where("phone = ?", phone).First(&customer).Error
	return &customer, err
}

func (r *Repository) UpdateCustomer(customer *model.Customer) error {
	return r.db.Save(customer).Error
}

type LabelRepository interface {
	Create(label *model.Label) error
	GetByID(id uint64) (*model.Label, error)
	GetByPackageID(packageID uint64) (*model.Label, error)
	GetByNo(labelNo string) (*model.Label, error)
	Update(label *model.Label) error
}

func (r *Repository) CreateLabel(label *model.Label) error {
	return r.db.Create(label).Error
}

func (r *Repository) GetLabelByID(id uint64) (*model.Label, error) {
	var label model.Label
	err := r.db.First(&label, id).Error
	return &label, err
}

func (r *Repository) GetLabelByPackageID(packageID uint64) (*model.Label, error) {
	var label model.Label
	err := r.db.Where("package_id = ?", packageID).First(&label).Error
	return &label, err
}

func (r *Repository) GetLabelByNo(labelNo string) (*model.Label, error) {
	var label model.Label
	err := r.db.Where("label_no = ?", labelNo).First(&label).Error
	return &label, err
}

func (r *Repository) UpdateLabel(label *model.Label) error {
	return r.db.Save(label).Error
}

type CourierRepository interface {
	Create(courier *model.Courier) error
	GetByID(id uint64) (*model.Courier, error)
	GetByNo(courierNo string) (*model.Courier, error)
	GetByPhone(phone string) (*model.Courier, error)
	List(page, pageSize int, status int8) ([]model.Courier, int64, error)
	Update(courier *model.Courier) error
}

func (r *Repository) CreateCourier(courier *model.Courier) error {
	return r.db.Create(courier).Error
}

func (r *Repository) GetCourierByID(id uint64) (*model.Courier, error) {
	var courier model.Courier
	err := r.db.First(&courier, id).Error
	return &courier, err
}

func (r *Repository) GetCourierByNo(courierNo string) (*model.Courier, error) {
	var courier model.Courier
	err := r.db.Where("courier_no = ?", courierNo).First(&courier).Error
	return &courier, err
}

func (r *Repository) GetCourierByPhone(phone string) (*model.Courier, error) {
	var courier model.Courier
	err := r.db.Where("phone = ?", phone).First(&courier).Error
	return &courier, err
}

func (r *Repository) ListCouriers(page, pageSize int, status int8) ([]model.Courier, int64, error) {
	var couriers []model.Courier
	var total int64

	query := r.db.Model(&model.Courier{})
	if status > 0 {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&couriers).Error
	return couriers, total, err
}

func (r *Repository) UpdateCourier(courier *model.Courier) error {
	return r.db.Save(courier).Error
}

type RouteRepository interface {
	Create(route *model.Route) error
	GetByID(id uint64) (*model.Route, error)
	GetByNo(routeNo string) (*model.Route, error)
	List(page, pageSize int, warehouseID uint64, courierID uint64) ([]model.Route, int64, error)
	Update(route *model.Route) error
}

func (r *Repository) CreateRoute(route *model.Route) error {
	return r.db.Create(route).Error
}

func (r *Repository) GetRouteByID(id uint64) (*model.Route, error) {
	var route model.Route
	err := r.db.Preload("Courier").Preload("Warehouse").Preload("Tasks").First(&route, id).Error
	return &route, err
}

func (r *Repository) GetRouteByNo(routeNo string) (*model.Route, error) {
	var route model.Route
	err := r.db.Preload("Courier").Preload("Warehouse").Preload("Tasks").Where("route_no = ?", routeNo).First(&route).Error
	return &route, err
}

func (r *Repository) ListRoutes(page, pageSize int, warehouseID uint64, courierID uint64) ([]model.Route, int64, error) {
	var routes []model.Route
	var total int64

	query := r.db.Model(&model.Route{})
	if warehouseID > 0 {
		query = query.Where("warehouse_id = ?", warehouseID)
	}
	if courierID > 0 {
		query = query.Where("courier_id = ?", courierID)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	err := query.Preload("Courier").Preload("Warehouse").Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&routes).Error
	return routes, total, err
}

func (r *Repository) UpdateRoute(route *model.Route) error {
	return r.db.Save(route).Error
}

type DeliveryTaskRepository interface {
	Create(task *model.DeliveryTask) error
	GetByID(id uint64) (*model.DeliveryTask, error)
	GetByNo(taskNo string) (*model.DeliveryTask, error)
	ListByRoute(routeID uint64) ([]model.DeliveryTask, error)
	ListByCourier(courierID uint64, page, pageSize int, status int8) ([]model.DeliveryTask, int64, error)
	ListPending(page, pageSize int, warehouseID uint64) ([]model.DeliveryTask, int64, error)
	Update(task *model.DeliveryTask) error
	UpdateStatus(id uint64, status int8) error
	BatchUpdateRoute(taskIDs []uint64, routeID uint64, courierID uint64) error
}

func (r *Repository) CreateDeliveryTask(task *model.DeliveryTask) error {
	return r.db.Create(task).Error
}

func (r *Repository) GetDeliveryTaskByID(id uint64) (*model.DeliveryTask, error) {
	var task model.DeliveryTask
	err := r.db.Preload("Package").Preload("Customer").Preload("Courier").Preload("Route").First(&task, id).Error
	return &task, err
}

func (r *Repository) GetDeliveryTaskByNo(taskNo string) (*model.DeliveryTask, error) {
	var task model.DeliveryTask
	err := r.db.Preload("Package").Preload("Customer").Preload("Courier").Preload("Route").Where("task_no = ?", taskNo).First(&task).Error
	return &task, err
}

func (r *Repository) ListDeliveryTasksByRoute(routeID uint64) ([]model.DeliveryTask, error) {
	var tasks []model.DeliveryTask
	err := r.db.Preload("Package").Preload("Customer").Where("route_id = ?", routeID).Order("sequence ASC").Find(&tasks).Error
	return tasks, err
}

func (r *Repository) ListDeliveryTasksByCourier(courierID uint64, page, pageSize int, status int8) ([]model.DeliveryTask, int64, error) {
	var tasks []model.DeliveryTask
	var total int64

	query := r.db.Model(&model.DeliveryTask{}).Where("courier_id = ?", courierID)
	if status > 0 {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	err := query.Preload("Package").Preload("Customer").Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&tasks).Error
	return tasks, total, err
}

func (r *Repository) ListPendingTasks(page, pageSize int, warehouseID uint64) ([]model.DeliveryTask, int64, error) {
	var tasks []model.DeliveryTask
	var total int64

	query := r.db.Model(&model.DeliveryTask{}).Where("status = ?", 1)
	if warehouseID > 0 {
		query = query.Joins("JOIN packages ON packages.id = delivery_tasks.package_id").
			Where("packages.warehouse_id = ?", warehouseID)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	err := query.Preload("Package").Preload("Customer").Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&tasks).Error
	return tasks, total, err
}

func (r *Repository) UpdateDeliveryTask(task *model.DeliveryTask) error {
	return r.db.Save(task).Error
}

func (r *Repository) UpdateDeliveryTaskStatus(id uint64, status int8) error {
	return r.db.Model(&model.DeliveryTask{}).Where("id = ?", id).Update("status", status).Error
}

func (r *Repository) BatchUpdateRoute(taskIDs []uint64, routeID uint64, courierID uint64) error {
	return r.db.Model(&model.DeliveryTask{}).
		Where("id IN ?", taskIDs).
		Updates(map[string]interface{}{
			"route_id":   routeID,
			"courier_id": courierID,
			"status":     2,
		}).Error
}

type DeliveryProofRepository interface {
	Create(proof *model.DeliveryProof) error
	GetByID(id uint64) (*model.DeliveryProof, error)
	GetByTaskID(taskID uint64) (*model.DeliveryProof, error)
	ListByPackageID(packageID uint64) ([]model.DeliveryProof, error)
}

func (r *Repository) CreateDeliveryProof(proof *model.DeliveryProof) error {
	return r.db.Create(proof).Error
}

func (r *Repository) GetDeliveryProofByID(id uint64) (*model.DeliveryProof, error) {
	var proof model.DeliveryProof
	err := r.db.First(&proof, id).Error
	return &proof, err
}

func (r *Repository) GetDeliveryProofByTaskID(taskID uint64) (*model.DeliveryProof, error) {
	var proof model.DeliveryProof
	err := r.db.Where("task_id = ?", taskID).First(&proof).Error
	return &proof, err
}

func (r *Repository) ListDeliveryProofsByPackageID(packageID uint64) ([]model.DeliveryProof, error) {
	var proofs []model.DeliveryProof
	err := r.db.Where("package_id = ?", packageID).Order("created_at DESC").Find(&proofs).Error
	return proofs, err
}

type DeliveryExceptionRepository interface {
	Create(exception *model.DeliveryException) error
	GetByID(id uint64) (*model.DeliveryException, error)
	GetByTaskID(taskID uint64) ([]model.DeliveryException, error)
	List(page, pageSize int, status int8, exceptionType string) ([]model.DeliveryException, int64, error)
	Update(exception *model.DeliveryException) error
	UpdateStatus(id uint64, status int8) error
}

func (r *Repository) CreateDeliveryException(exception *model.DeliveryException) error {
	return r.db.Create(exception).Error
}

func (r *Repository) GetDeliveryExceptionByID(id uint64) (*model.DeliveryException, error) {
	var exception model.DeliveryException
	err := r.db.First(&exception, id).Error
	return &exception, err
}

func (r *Repository) GetDeliveryExceptionsByTaskID(taskID uint64) ([]model.DeliveryException, error) {
	var exceptions []model.DeliveryException
	err := r.db.Where("task_id = ?", taskID).Order("created_at DESC").Find(&exceptions).Error
	return exceptions, err
}

func (r *Repository) ListDeliveryExceptions(page, pageSize int, status int8, exceptionType string) ([]model.DeliveryException, int64, error) {
	var exceptions []model.DeliveryException
	var total int64

	query := r.db.Model(&model.DeliveryException{})
	if status > 0 {
		query = query.Where("status = ?", status)
	}
	if exceptionType != "" {
		query = query.Where("exception_type = ?", exceptionType)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&exceptions).Error
	return exceptions, total, err
}

func (r *Repository) UpdateDeliveryException(exception *model.DeliveryException) error {
	return r.db.Save(exception).Error
}

func (r *Repository) UpdateDeliveryExceptionStatus(id uint64, status int8) error {
	return r.db.Model(&model.DeliveryException{}).Where("id = ?", id).Update("status", status).Error
}

type WarehouseRepository interface {
	GetByID(id uint64) (*model.Warehouse, error)
	GetByCode(code string) (*model.Warehouse, error)
	List() ([]model.Warehouse, error)
}

func (r *Repository) GetWarehouseByID(id uint64) (*model.Warehouse, error) {
	var warehouse model.Warehouse
	err := r.db.First(&warehouse, id).Error
	return &warehouse, err
}

func (r *Repository) GetWarehouseByCode(code string) (*model.Warehouse, error) {
	var warehouse model.Warehouse
	err := r.db.Where("code = ?", code).First(&warehouse).Error
	return &warehouse, err
}

func (r *Repository) ListWarehouses() ([]model.Warehouse, error) {
	var warehouses []model.Warehouse
	err := r.db.Where("status = 1").Find(&warehouses).Error
	return warehouses, err
}
