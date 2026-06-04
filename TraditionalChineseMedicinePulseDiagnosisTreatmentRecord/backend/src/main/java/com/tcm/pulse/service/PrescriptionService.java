package com.tcm.pulse.service;

import com.tcm.pulse.common.PageResult;
import com.tcm.pulse.dto.PrescriptionDTO;
import com.tcm.pulse.dto.PrescriptionItemDTO;
import com.tcm.pulse.dto.ValidationResultDTO;
import com.tcm.pulse.entity.Prescription;
import com.tcm.pulse.entity.PrescriptionItem;
import com.tcm.pulse.exception.BusinessException;
import com.tcm.pulse.repository.ConsultationRepository;
import com.tcm.pulse.repository.PatientRepository;
import com.tcm.pulse.repository.PrescriptionItemRepository;
import com.tcm.pulse.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final PatientRepository patientRepository;
    private final ConsultationRepository consultationRepository;
    private final CompatibilityService compatibilityService;

    public PageResult<Prescription> findPage(int pageNum, int pageSize, Long patientId, String doctorName) {
        Pageable pageable = PageRequest.of(pageNum - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Prescription> page = prescriptionRepository.findByConditions(patientId, doctorName, pageable);
        return new PageResult<>(page.getContent(), page.getTotalElements(), pageNum, pageSize);
    }

    public List<Prescription> findByPatientId(Long patientId) {
        return prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    public List<Prescription> findForComparison(Long patientId) {
        return prescriptionRepository.findByPatientIdForComparison(patientId);
    }

    public Prescription findById(Long id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new BusinessException("处方不存在"));
    }

    public Prescription findDetailById(Long id) {
        return prescriptionRepository.findWithItemsById(id)
                .orElseThrow(() -> new BusinessException("处方不存在"));
    }

    public Prescription getLatestPrescription(Long patientId) {
        return prescriptionRepository.findTopByPatientIdOrderByCreatedAtDesc(patientId)
                .orElseThrow(() -> new BusinessException("该患者暂无处方记录"));
    }

    @Transactional
    public Prescription create(PrescriptionDTO dto) {
        validatePrescription(dto);

        List<ValidationResultDTO> conflicts = compatibilityService.validatePrescription(
                dto.getItems().stream()
                        .map(PrescriptionItemDTO::getHerbName)
                        .collect(Collectors.toList())
        );

        if (!conflicts.isEmpty()) {
            ValidationResultDTO firstConflict = conflicts.get(0);
            throw new BusinessException("配伍禁忌校验失败: " +
                    firstConflict.getHerbA() + " 与 " + firstConflict.getHerbB() +
                    " 存在" + firstConflict.getRuleType() + "禁忌 - " +
                    firstConflict.getDescription());
        }

        Prescription prescription = new Prescription();
        BeanUtils.copyProperties(dto, prescription, "items", "id", "createdAt");
        prescription = prescriptionRepository.save(prescription);

        savePrescriptionItems(prescription.getId(), dto.getItems());

        return prescriptionRepository.findWithItemsById(prescription.getId()).orElse(prescription);
    }

    @Transactional
    public Prescription update(Long id, PrescriptionDTO dto) {
        Prescription existing = findById(id);
        validatePrescription(dto);

        List<ValidationResultDTO> conflicts = compatibilityService.validatePrescription(
                dto.getItems().stream()
                        .map(PrescriptionItemDTO::getHerbName)
                        .collect(Collectors.toList())
        );

        if (!conflicts.isEmpty()) {
            ValidationResultDTO firstConflict = conflicts.get(0);
            throw new BusinessException("配伍禁忌校验失败: " +
                    firstConflict.getHerbA() + " 与 " + firstConflict.getHerbB() +
                    " 存在" + firstConflict.getRuleType() + "禁忌 - " +
                    firstConflict.getDescription());
        }

        BeanUtils.copyProperties(dto, existing, "id", "items", "createdAt", "patientId");
        prescriptionRepository.save(existing);

        prescriptionItemRepository.deleteByPrescriptionId(id);
        savePrescriptionItems(id, dto.getItems());

        return prescriptionRepository.findWithItemsById(id).orElse(existing);
    }

    @Transactional
    public Prescription addFlavor(Long sourceId, PrescriptionDTO dto) {
        Prescription source = findDetailById(sourceId);

        if (!source.getPatientId().equals(dto.getPatientId())) {
            throw new BusinessException("处方患者不一致，无法加味");
        }

        Prescription newPrescription = new Prescription();
        BeanUtils.copyProperties(source, newPrescription, "id", "items", "createdAt");
        BeanUtils.copyProperties(dto, newPrescription, "id", "items", "createdAt", "patientId");
        newPrescription = prescriptionRepository.save(newPrescription);

        List<PrescriptionItemDTO> mergedItems = new ArrayList<>();
        if (source.getItems() != null) {
            for (PrescriptionItem item : source.getItems()) {
                PrescriptionItemDTO dtoItem = new PrescriptionItemDTO();
                dtoItem.setHerbId(item.getHerbId());
                dtoItem.setHerbName(item.getHerbName());
                dtoItem.setDosage(item.getDosage());
                dtoItem.setPreparationMethod(item.getPreparationMethod());
                mergedItems.add(dtoItem);
            }
        }

        if (dto.getItems() != null) {
            for (PrescriptionItemDTO newItem : dto.getItems()) {
                boolean found = false;
                for (PrescriptionItemDTO existingItem : mergedItems) {
                    if (existingItem.getHerbName().equals(newItem.getHerbName())) {
                        existingItem.setDosage(newItem.getDosage());
                        existingItem.setPreparationMethod(newItem.getPreparationMethod());
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    mergedItems.add(newItem);
                }
            }
        }

        validateAndSaveItems(newPrescription.getId(), mergedItems);

        return prescriptionRepository.findWithItemsById(newPrescription.getId()).orElse(newPrescription);
    }

    @Transactional
    public Prescription removeFlavor(Long sourceId, PrescriptionDTO dto) {
        Prescription source = findDetailById(sourceId);

        if (!source.getPatientId().equals(dto.getPatientId())) {
            throw new BusinessException("处方患者不一致，无法减味");
        }

        Prescription newPrescription = new Prescription();
        BeanUtils.copyProperties(source, newPrescription, "id", "items", "createdAt");
        BeanUtils.copyProperties(dto, newPrescription, "id", "items", "createdAt", "patientId");
        newPrescription = prescriptionRepository.save(newPrescription);

        List<String> herbsToRemove = dto.getItems().stream()
                .map(PrescriptionItemDTO::getHerbName)
                .collect(Collectors.toList());

        List<PrescriptionItemDTO> filteredItems = new ArrayList<>();
        if (source.getItems() != null) {
            for (PrescriptionItem item : source.getItems()) {
                if (!herbsToRemove.contains(item.getHerbName())) {
                    PrescriptionItemDTO dtoItem = new PrescriptionItemDTO();
                    dtoItem.setHerbId(item.getHerbId());
                    dtoItem.setHerbName(item.getHerbName());
                    dtoItem.setDosage(item.getDosage());
                    dtoItem.setPreparationMethod(item.getPreparationMethod());
                    filteredItems.add(dtoItem);
                }
            }
        }

        validateAndSaveItems(newPrescription.getId(), filteredItems);

        return prescriptionRepository.findWithItemsById(newPrescription.getId()).orElse(newPrescription);
    }

    private void validateAndSaveItems(Long prescriptionId, List<PrescriptionItemDTO> items) {
        if (items == null || items.isEmpty()) {
            throw new BusinessException("处方不能为空");
        }

        List<ValidationResultDTO> conflicts = compatibilityService.validatePrescription(
                items.stream()
                        .map(PrescriptionItemDTO::getHerbName)
                        .collect(Collectors.toList())
        );

        if (!conflicts.isEmpty()) {
            ValidationResultDTO firstConflict = conflicts.get(0);
            throw new BusinessException("配伍禁忌校验失败: " +
                    firstConflict.getHerbA() + " 与 " + firstConflict.getHerbB() +
                    " 存在" + firstConflict.getRuleType() + "禁忌 - " +
                    firstConflict.getDescription());
        }

        savePrescriptionItems(prescriptionId, items);
    }

    @Transactional
    public void delete(Long id) {
        if (!prescriptionRepository.existsById(id)) {
            throw new BusinessException("处方不存在");
        }
        prescriptionItemRepository.deleteByPrescriptionId(id);
        prescriptionRepository.deleteById(id);
    }

    private void validatePrescription(PrescriptionDTO dto) {
        if (!patientRepository.existsById(dto.getPatientId())) {
            throw new BusinessException("患者不存在");
        }
        if (dto.getConsultationId() != null && !consultationRepository.existsById(dto.getConsultationId())) {
            throw new BusinessException("诊疗记录不存在");
        }
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new BusinessException("处方明细不能为空");
        }
    }

    private void savePrescriptionItems(Long prescriptionId, List<PrescriptionItemDTO> items) {
        for (PrescriptionItemDTO itemDTO : items) {
            PrescriptionItem item = new PrescriptionItem();
            item.setPrescriptionId(prescriptionId);
            item.setHerbId(itemDTO.getHerbId());
            item.setHerbName(itemDTO.getHerbName());
            item.setDosage(itemDTO.getDosage());
            item.setPreparationMethod(itemDTO.getPreparationMethod());
            prescriptionItemRepository.save(item);
        }
    }

    public List<ValidationResultDTO> validatePrescriptionItems(List<PrescriptionItemDTO> items) {
        return compatibilityService.validatePrescription(
                items.stream()
                        .map(PrescriptionItemDTO::getHerbName)
                        .collect(Collectors.toList())
        );
    }
}
