package com.borderport.repository;

import com.borderport.entity.Quota;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface QuotaRepository extends JpaRepository<Quota, Long> {

    List<Quota> findByPortIdAndVehicleTypeAndQuotaDate(Long portId, String vehicleType, LocalDate quotaDate);

    Optional<Quota> findByPortIdAndVehicleTypeAndQuotaDateAndTimeSlot(Long portId, String vehicleType, LocalDate quotaDate, String timeSlot);
}
