package com.tcm.pulse.repository;

import com.tcm.pulse.entity.PrescriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItem, Long> {

    List<PrescriptionItem> findByPrescriptionIdOrderById(Long prescriptionId);

    void deleteByPrescriptionId(Long prescriptionId);
}
