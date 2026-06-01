package com.gafpr.service;

import com.gafpr.entity.ApprovalNodeConfig;
import com.gafpr.repository.ApprovalNodeConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ApprovalNodeConfigService {

    @Autowired
    private ApprovalNodeConfigRepository approvalNodeConfigRepository;

    public List<ApprovalNodeConfig> getAllConfigs() {
        return approvalNodeConfigRepository.findAll();
    }

    public List<ApprovalNodeConfig> getConfigsByAirspaceType(String airspaceType) {
        return approvalNodeConfigRepository.findByAirspaceTypeOrderBySequenceAsc(airspaceType);
    }

    public List<ApprovalNodeConfig> getConfigsByAirspaceTypeAndLevel(String airspaceType, Integer level) {
        return approvalNodeConfigRepository.findByAirspaceTypeAndLevelOrderBySequenceAsc(airspaceType, level);
    }

    @Transactional
    public ApprovalNodeConfig createConfig(ApprovalNodeConfig config) {
        return approvalNodeConfigRepository.save(config);
    }

    @Transactional
    public ApprovalNodeConfig updateConfig(Long id, ApprovalNodeConfig config) {
        ApprovalNodeConfig existing = approvalNodeConfigRepository.findById(id).orElse(null);
        if (existing == null) {
            return null;
        }
        config.setId(id);
        return approvalNodeConfigRepository.save(config);
    }

    @Transactional
    public boolean deleteConfig(Long id) {
        if (!approvalNodeConfigRepository.existsById(id)) {
            return false;
        }
        approvalNodeConfigRepository.deleteById(id);
        return true;
    }
}
