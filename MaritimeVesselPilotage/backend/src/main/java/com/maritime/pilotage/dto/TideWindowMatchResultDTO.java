package com.maritime.pilotage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TideWindowMatchResultDTO {

    private Long vesselId;

    private String vesselName;

    private BigDecimal etaDraft;

    private BigDecimal requiredTideHeight;

    private List<TideWindowDTO> availableWindows;

    private String remark;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TideWindowDTO {
        private Long tideId;
        private LocalDateTime windowStart;
        private LocalDateTime windowEnd;
        private LocalDateTime peakTime;
        private BigDecimal peakHeight;
        private BigDecimal minHeightInWindow;
        private String port;
        private Integer tideType;
    }
}
