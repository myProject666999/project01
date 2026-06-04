package com.tcm.pulse.service;

import com.tcm.pulse.dto.ValidationResultDTO;
import com.tcm.pulse.entity.CompatibilityRule;
import com.tcm.pulse.entity.Herb;
import com.tcm.pulse.repository.CompatibilityRuleRepository;
import com.tcm.pulse.repository.HerbRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompatibilityService {

    private final CompatibilityRuleRepository compatibilityRuleRepository;
    private final HerbRepository herbRepository;

    public ValidationResultDTO validatePair(String herbName1, String herbName2) {
        Herb herb1 = resolveHerb(herbName1);
        Herb herb2 = resolveHerb(herbName2);

        if (herb1 == null || herb2 == null) {
            return ValidationResultDTO.success();
        }

        Optional<CompatibilityRule> ruleOpt = compatibilityRuleRepository
                .findByHerbPair(herb1.getId(), herb2.getId());

        if (ruleOpt.isPresent()) {
            CompatibilityRule rule = ruleOpt.get();
            String ruleTypeName = "EIGHTEEN_INCOMPATIBILITIES".equals(rule.getRuleType())
                    ? "十八反" : "十九畏";
            return ValidationResultDTO.conflict(
                    herb1.getName(),
                    herb2.getName(),
                    ruleTypeName,
                    rule.getDescription()
            );
        }

        return ValidationResultDTO.success();
    }

    public List<ValidationResultDTO> validatePrescription(List<String> herbNames) {
        List<ValidationResultDTO> results = new ArrayList<>();

        if (herbNames == null || herbNames.size() < 2) {
            return results;
        }

        Map<String, Long> herbNameToId = new HashMap<>();
        for (String name : herbNames) {
            Herb herb = resolveHerb(name);
            if (herb != null) {
                herbNameToId.put(name, herb.getId());
            }
        }

        List<Long> herbIds = new ArrayList<>(herbNameToId.values());
        if (herbIds.size() < 2) {
            return results;
        }

        List<CompatibilityRule> conflicts = compatibilityRuleRepository.findConflictsInHerbIds(herbIds);

        Map<Long, String> idToName = herbNameToId.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getValue, Map.Entry::getKey));

        for (CompatibilityRule rule : conflicts) {
            String nameA = idToName.getOrDefault(rule.getHerbAId(), "");
            String nameB = idToName.getOrDefault(rule.getHerbBId(), "");

            if (nameA.isEmpty() || nameB.isEmpty()) {
                continue;
            }

            String ruleTypeName = "EIGHTEEN_INCOMPATIBILITIES".equals(rule.getRuleType())
                    ? "十八反" : "十九畏";

            results.add(ValidationResultDTO.conflict(
                    nameA,
                    nameB,
                    ruleTypeName,
                    rule.getDescription()
            ));
        }

        return results;
    }

    private Herb resolveHerb(String name) {
        if (name == null || name.trim().isEmpty()) {
            return null;
        }
        return herbRepository.findByNameOrAlias(name.trim()).orElse(null);
    }

    public List<CompatibilityRule> getAllRules() {
        return compatibilityRuleRepository.findAll();
    }

    public List<CompatibilityRule> getEighteenIncompatibilities() {
        return compatibilityRuleRepository.findByRuleType("EIGHTEEN_INCOMPATIBILITIES");
    }

    public List<CompatibilityRule> getNineteenMutualRestraints() {
        return compatibilityRuleRepository.findByRuleType("NINETEEN_MUTUAL_RESTRAINTS");
    }
}
