package com.maritime.pilotage.service;

import com.maritime.pilotage.dto.TideWindowMatchRequestDTO;
import com.maritime.pilotage.dto.TideWindowMatchResultDTO;

public interface TideMatchingService {

    TideWindowMatchResultDTO matchTideWindows(TideWindowMatchRequestDTO request);

    TideWindowMatchResultDTO findNearestAvailableWindow(TideWindowMatchRequestDTO request);

    boolean checkTideSufficiency(Long vesselId, java.math.BigDecimal draft, java.time.LocalDateTime time);
}
