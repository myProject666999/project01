package com.judicial.appraisal.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class VerifyResultVO {

    private String verifyResult;

    private String verifyResultDesc;

    private String opinionNo;

    private String title;

    private String caseName;

    private String appraisalType;

    private String appraisalMatter;

    private LocalDate issueDate;

    private String conclusion;

    private String appraiser1Name;

    private String appraiser2Name;

    private String status;

    private LocalDateTime verifyTime;
}
