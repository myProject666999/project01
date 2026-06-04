package com.tcm.pulse.dto;

import lombok.Data;

@Data
public class ValidationResultDTO {

    private boolean valid;

    private String herbA;

    private String herbB;

    private String ruleType;

    private String description;

    public static ValidationResultDTO success() {
        ValidationResultDTO result = new ValidationResultDTO();
        result.setValid(true);
        return result;
    }

    public static ValidationResultDTO conflict(String herbA, String herbB, String ruleType, String description) {
        ValidationResultDTO result = new ValidationResultDTO();
        result.setValid(false);
        result.setHerbA(herbA);
        result.setHerbB(herbB);
        result.setRuleType(ruleType);
        result.setDescription(description);
        return result;
    }
}
