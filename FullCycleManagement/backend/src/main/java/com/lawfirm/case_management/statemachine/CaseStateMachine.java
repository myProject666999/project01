package com.lawfirm.case_management.statemachine;

import com.lawfirm.case_management.enums.CaseStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Slf4j
@Component
public class CaseStateMachine {

    private final Map<CaseStatus, Set<CaseStatus>> allowedTransitions = new HashMap<>();

    public CaseStateMachine() {
        allowedTransitions.put(CaseStatus.CONSULTATION, new HashSet<CaseStatus>() {{
            add(CaseStatus.ACCEPTED);
            add(CaseStatus.ARCHIVED);
        }});

        allowedTransitions.put(CaseStatus.ACCEPTED, new HashSet<CaseStatus>() {{
            add(CaseStatus.FILING);
            add(CaseStatus.ARCHIVED);
        }});

        allowedTransitions.put(CaseStatus.FILING, new HashSet<CaseStatus>() {{
            add(CaseStatus.FILED);
            add(CaseStatus.ARCHIVED);
        }});

        allowedTransitions.put(CaseStatus.FILED, new HashSet<CaseStatus>() {{
            add(CaseStatus.HEARING);
            add(CaseStatus.CLOSED);
            add(CaseStatus.ARCHIVED);
        }});

        allowedTransitions.put(CaseStatus.HEARING, new HashSet<CaseStatus>() {{
            add(CaseStatus.JUDGED);
            add(CaseStatus.CLOSED);
            add(CaseStatus.ARCHIVED);
        }});

        allowedTransitions.put(CaseStatus.JUDGED, new HashSet<CaseStatus>() {{
            add(CaseStatus.EXECUTION);
            add(CaseStatus.CLOSED);
            add(CaseStatus.ARCHIVED);
        }});

        allowedTransitions.put(CaseStatus.EXECUTION, new HashSet<CaseStatus>() {{
            add(CaseStatus.CLOSED);
            add(CaseStatus.ARCHIVED);
        }});

        allowedTransitions.put(CaseStatus.CLOSED, new HashSet<CaseStatus>() {{
            add(CaseStatus.ARCHIVED);
        }});

        allowedTransitions.put(CaseStatus.ARCHIVED, Collections.<CaseStatus>emptySet());
    }

    public boolean canTransition(CaseStatus currentStatus, CaseStatus targetStatus) {
        if (currentStatus == targetStatus) {
            return true;
        }

        Set<CaseStatus> allowed = allowedTransitions.get(currentStatus);
        if (allowed == null) {
            log.warn("未知的状态: {}", currentStatus);
            return false;
        }

        boolean result = allowed.contains(targetStatus);
        if (!result) {
            log.warn("非法状态跳转: {} -> {}", currentStatus, targetStatus);
        }
        return result;
    }

    public Set<CaseStatus> getAllowedTransitions(CaseStatus currentStatus) {
        return allowedTransitions.getOrDefault(currentStatus, Collections.<CaseStatus>emptySet());
    }
}
