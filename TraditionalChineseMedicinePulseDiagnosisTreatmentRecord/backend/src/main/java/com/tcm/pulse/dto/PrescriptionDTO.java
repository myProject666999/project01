package com.tcm.pulse.dto;

import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class PrescriptionDTO {

    private Long id;

    @NotNull(message = "患者ID不能为空")
    private Long patientId;

    private Long consultationId;

    private String diagnosis;

    private Integer totalDosage;

    private String prescriptionUsage;

    private String doctorName;

    @NotEmpty(message = "处方明细不能为空")
    @Valid
    private List<PrescriptionItemDTO> items;
}
