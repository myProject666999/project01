package com.tcm.pulse.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ConsultationDTO {

    private Long id;

    @NotNull(message = "患者ID不能为空")
    private Long patientId;

    private String complexion;

    private String tongueAppearance;

    private String tongueImageUrl;

    private String breath;

    private String cough;

    private String voice;

    @NotBlank(message = "主诉不能为空")
    private String chiefComplaint;

    private String associatedSymptoms;

    private String stool;

    private String urine;

    private String pulseTypes;

    @NotNull(message = "就诊时间不能为空")
    private LocalDateTime visitDate;

    private String remark;
}
