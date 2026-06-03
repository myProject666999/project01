package com.tax.rebate.dto;

import lombok.Data;

import javax.validation.constraints.Min;

@Data
public class PageRequest {

    @Min(1)
    private int page = 1;

    @Min(1)
    private int size = 10;

    private String keyword;
}
