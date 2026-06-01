package com.maritime.pilotage.service.impl;

import com.maritime.pilotage.dto.TideWindowMatchRequestDTO;
import com.maritime.pilotage.dto.TideWindowMatchResultDTO;
import com.maritime.pilotage.entity.Tide;
import com.maritime.pilotage.entity.Vessel;
import com.maritime.pilotage.mapper.TideMapper;
import com.maritime.pilotage.mapper.VesselMapper;
import com.maritime.pilotage.service.TideMatchingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TideMatchingServiceImpl implements TideMatchingService {

    private static final BigDecimal SAFETY_MARGIN = new BigDecimal("0.5");
    private static final int DEFAULT_SEARCH_DAYS = 7;
    private static final String DEFAULT_PORT = "Main Port";

    private final TideMapper tideMapper;
    private final VesselMapper vesselMapper;

    @Override
    public TideWindowMatchResultDTO matchTideWindows(TideWindowMatchRequestDTO request) {
        Vessel vessel = vesselMapper.selectById(request.getVesselId());
        if (vessel == null) {
            throw new IllegalArgumentException("船舶不存在: " + request.getVesselId());
        }

        BigDecimal requiredTideHeight = request.getEtaDraft().add(SAFETY_MARGIN);
        String port = request.getPort() != null ? request.getPort() : DEFAULT_PORT;

        LocalDate searchStartDate = request.getSearchStartDate() != null ?
                request.getSearchStartDate() : request.getEta().toLocalDate();
        LocalDate searchEndDate = request.getSearchEndDate() != null ?
                request.getSearchEndDate() : searchStartDate.plusDays(DEFAULT_SEARCH_DAYS);

        List<Tide> tides = tideMapper.findByDateRangeAndPort(searchStartDate, searchEndDate, port);

        List<TideWindowMatchResultDTO.TideWindowDTO> availableWindows =
                calculateAvailableWindows(tides, requiredTideHeight, request.getEta());

        availableWindows.sort(Comparator.comparing(w -> Math.abs(
                java.time.Duration.between(request.getEta(), w.getPeakTime()).toMinutes())));

        return TideWindowMatchResultDTO.builder()
                .vesselId(vessel.getId())
                .vesselName(vessel.getVesselName())
                .etaDraft(request.getEtaDraft())
                .requiredTideHeight(requiredTideHeight)
                .availableWindows(availableWindows)
                .remark(availableWindows.isEmpty() ?
                        "在搜索范围内未找到满足吃水要求的潮汐窗口" :
                        String.format("找到%d个可用潮汐窗口", availableWindows.size()))
                .build();
    }

    @Override
    public TideWindowMatchResultDTO findNearestAvailableWindow(TideWindowMatchRequestDTO request) {
        TideWindowMatchResultDTO result = matchTideWindows(request);
        if (result.getAvailableWindows() != null && !result.getAvailableWindows().isEmpty()) {
            result.setAvailableWindows(Collections.singletonList(result.getAvailableWindows().get(0)));
        }
        return result;
    }

    @Override
    public boolean checkTideSufficiency(Long vesselId, BigDecimal draft, LocalDateTime time) {
        Vessel vessel = vesselMapper.selectById(vesselId);
        if (vessel == null) {
            return false;
        }

        BigDecimal requiredHeight = draft.add(SAFETY_MARGIN);
        LocalDate date = time.toLocalDate();
        List<Tide> tides = tideMapper.findByDateRangeAndPort(date, date, DEFAULT_PORT);

        BigDecimal maxHeight = tides.stream()
                .map(Tide::getTideHeight)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        return maxHeight.compareTo(requiredHeight) >= 0;
    }

    private List<TideWindowMatchResultDTO.TideWindowDTO> calculateAvailableWindows(
            List<Tide> tides, BigDecimal requiredHeight, LocalDateTime eta) {

        List<TideWindowMatchResultDTO.TideWindowDTO> windows = new ArrayList<>();

        if (tides == null || tides.isEmpty()) {
            return windows;
        }

        List<Tide> highTides = tides.stream()
                .filter(t -> t.getTideType() == 1)
                .filter(t -> t.getTideHeight().compareTo(requiredHeight) >= 0)
                .collect(Collectors.toList());

        for (Tide highTide : highTides) {
            LocalDateTime peakTime = LocalDateTime.of(highTide.getTideDate(), highTide.getTideTime());

            LocalDateTime windowStart = findWindowBoundary(tides, highTide, requiredHeight, true);
            LocalDateTime windowEnd = findWindowBoundary(tides, highTide, requiredHeight, false);

            BigDecimal minHeightInWindow = calculateMinHeightInWindow(tides, windowStart, windowEnd);

            if (windowEnd.isAfter(eta) && minHeightInWindow.compareTo(requiredHeight) >= 0) {
                windows.add(TideWindowMatchResultDTO.TideWindowDTO.builder()
                        .tideId(highTide.getId())
                        .windowStart(windowStart)
                        .windowEnd(windowEnd)
                        .peakTime(peakTime)
                        .peakHeight(highTide.getTideHeight())
                        .minHeightInWindow(minHeightInWindow)
                        .port(highTide.getPort())
                        .tideType(highTide.getTideType())
                        .build());
            }
        }

        return windows;
    }

    private LocalDateTime findWindowBoundary(List<Tide> tides, Tide highTide,
                                             BigDecimal requiredHeight, boolean isStart) {
        LocalDateTime peakTime = LocalDateTime.of(highTide.getTideDate(), highTide.getTideTime());

        for (int i = 0; i < 6; i++) {
            long hoursToAdd = isStart ? -i : i;
            LocalDateTime checkTime = peakTime.plusHours(hoursToAdd);

            BigDecimal estimatedHeight = estimateTideHeight(tides, checkTime);
            if (estimatedHeight.compareTo(requiredHeight) < 0) {
                return checkTime.plusHours(isStart ? 1 : -1);
            }
        }

        return isStart ? peakTime.minusHours(4) : peakTime.plusHours(4);
    }

    private BigDecimal estimateTideHeight(List<Tide> tides, LocalDateTime time) {
        LocalDate date = time.toLocalDate();
        LocalTime timeOfDay = time.toLocalTime();

        List<Tide> dayTides = tides.stream()
                .filter(t -> t.getTideDate().equals(date))
                .collect(Collectors.toList());

        if (dayTides.isEmpty()) {
            return BigDecimal.ZERO;
        }

        Tide prevTide = null;
        Tide nextTide = null;

        for (Tide tide : dayTides) {
            if (tide.getTideTime().isBefore(timeOfDay) || tide.getTideTime().equals(timeOfDay)) {
                prevTide = tide;
            } else if (nextTide == null) {
                nextTide = tide;
            }
        }

        if (prevTide == null && nextTide != null) {
            return nextTide.getTideHeight();
        }
        if (nextTide == null && prevTide != null) {
            return prevTide.getTideHeight();
        }
        if (prevTide != null && nextTide != null) {
            LocalDateTime prevDateTime = LocalDateTime.of(prevTide.getTideDate(), prevTide.getTideTime());
            LocalDateTime nextDateTime = LocalDateTime.of(nextTide.getTideDate(), nextTide.getTideTime());
            long totalMinutes = java.time.Duration.between(prevDateTime, nextDateTime).toMinutes();
            long elapsedMinutes = java.time.Duration.between(prevDateTime, time).toMinutes();

            double ratio = totalMinutes > 0 ? (double) elapsedMinutes / totalMinutes : 0;
            double heightDiff = nextTide.getTideHeight().subtract(prevTide.getTideHeight()).doubleValue();

            return BigDecimal.valueOf(prevTide.getTideHeight().doubleValue() + heightDiff * ratio);
        }

        return BigDecimal.ZERO;
    }

    private BigDecimal calculateMinHeightInWindow(List<Tide> tides,
                                                  LocalDateTime windowStart,
                                                  LocalDateTime windowEnd) {
        BigDecimal minHeight = new BigDecimal("999");

        for (LocalDateTime time = windowStart;
             time.isBefore(windowEnd) || time.isEqual(windowEnd);
             time = time.plusHours(1)) {
            BigDecimal height = estimateTideHeight(tides, time);
            if (height.compareTo(minHeight) < 0) {
                minHeight = height;
            }
        }

        return minHeight;
    }
}
