package com.lawfirm.case_management.service;

import com.lawfirm.case_management.entity.Client;
import com.lawfirm.case_management.entity.LegalCase;
import com.lawfirm.case_management.repository.ClientRepository;
import com.lawfirm.case_management.repository.LegalCaseRepository;
import com.lawfirm.case_management.util.NameNormalizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConflictCheckService {

    private final ClientRepository clientRepository;
    private final LegalCaseRepository legalCaseRepository;
    private final NameNormalizer nameNormalizer;

    public ConflictCheckResult checkConflict(String clientName) {
        ConflictCheckResult result = new ConflictCheckResult();
        result.setClientName(clientName);
        result.setConflicts(new ArrayList<>());

        String normalizedName = nameNormalizer.normalize(clientName);
        log.info("利益冲突检索 - 原始名称: {}, 归一化名称: {}", clientName, normalizedName);

        List<Client> allClients = clientRepository.findAll();

        for (Client client : allClients) {
            if (nameNormalizer.isSimilar(clientName, client.getName())) {
                List<LegalCase> relatedCases = legalCaseRepository.findByClientIdOrOpposingPartyId(client.getId());

                for (LegalCase legalCase : relatedCases) {
                    ConflictInfo info = new ConflictInfo();
                    info.setCaseId(legalCase.getId());
                    info.setCaseNumber(legalCase.getCaseNumber());
                    info.setCaseName(legalCase.getCaseName());
                    info.setClientName(client.getName());
                    info.setMatchName(client.getName());

                    boolean isOpposing = client.getId().equals(legalCase.getOpposingPartyId());
                    info.setRoleInCase(isOpposing ? "对方当事人" : "我方当事人");
                    info.setConflictType(isOpposing ? ConflictType.DIRECT : ConflictType.POTENTIAL);

                    if (isOpposing) {
                        result.setHasDirectConflict(true);
                    } else {
                        result.setHasPotentialConflict(true);
                    }

                    result.getConflicts().add(info);
                }
            }
        }

        return result;
    }

    public static class ConflictCheckResult {
        private String clientName;
        private boolean hasDirectConflict;
        private boolean hasPotentialConflict;
        private List<ConflictInfo> conflicts;

        public String getClientName() { return clientName; }
        public void setClientName(String clientName) { this.clientName = clientName; }
        public boolean isHasDirectConflict() { return hasDirectConflict; }
        public void setHasDirectConflict(boolean hasDirectConflict) { this.hasDirectConflict = hasDirectConflict; }
        public boolean isHasPotentialConflict() { return hasPotentialConflict; }
        public void setHasPotentialConflict(boolean hasPotentialConflict) { this.hasPotentialConflict = hasPotentialConflict; }
        public List<ConflictInfo> getConflicts() { return conflicts; }
        public void setConflicts(List<ConflictInfo> conflicts) { this.conflicts = conflicts; }
    }

    public static class ConflictInfo {
        private Long caseId;
        private String caseNumber;
        private String caseName;
        private String clientName;
        private String matchName;
        private String roleInCase;
        private ConflictType conflictType;

        public Long getCaseId() { return caseId; }
        public void setCaseId(Long caseId) { this.caseId = caseId; }
        public String getCaseNumber() { return caseNumber; }
        public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }
        public String getCaseName() { return caseName; }
        public void setCaseName(String caseName) { this.caseName = caseName; }
        public String getClientName() { return clientName; }
        public void setClientName(String clientName) { this.clientName = clientName; }
        public String getMatchName() { return matchName; }
        public void setMatchName(String matchName) { this.matchName = matchName; }
        public String getRoleInCase() { return roleInCase; }
        public void setRoleInCase(String roleInCase) { this.roleInCase = roleInCase; }
        public ConflictType getConflictType() { return conflictType; }
        public void setConflictType(ConflictType conflictType) { this.conflictType = conflictType; }
    }

    public enum ConflictType {
        DIRECT("直接冲突"),
        POTENTIAL("潜在冲突");

        private final String description;

        ConflictType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
