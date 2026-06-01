package com.fishery.fryrelease.common;

import lombok.Data;

@Data
public class PageRequest {
    private int page = 1;
    private int size = 10;

    public long getOffset() {
        return (long) (page - 1) * size;
    }
}
