package com.judicial.appraisal.service.impl;

import com.judicial.appraisal.common.enums.OperationType;
import com.judicial.appraisal.common.enums.SealStatus;
import com.judicial.appraisal.entity.Evidence;
import com.judicial.appraisal.entity.EvidenceChain;
import com.judicial.appraisal.entity.SysUser;
import com.judicial.appraisal.repository.EvidenceChainRepository;
import com.judicial.appraisal.repository.EvidenceRepository;
import com.judicial.appraisal.repository.SysUserRepository;
import com.judicial.appraisal.service.EvidenceChainService;
import com.judicial.appraisal.util.NoGenerator;
import com.judicial.appraisal.util.Pkcs7Util;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EvidenceChainServiceImpl implements EvidenceChainService {

    private static final String SIGN_PASSWORD = "123456";

    @Autowired
    private EvidenceChainRepository evidenceChainRepository;

    @Autowired
    private EvidenceRepository evidenceRepository;

    @Autowired
    private SysUserRepository sysUserRepository;

    @Override
    public List<EvidenceChain> getChainByEvidenceId(Long evidenceId) {
        return evidenceChainRepository.findByEvidenceIdOrderByOperationTimeAsc(evidenceId);
    }

    @Override
    @Transactional
    public EvidenceChain recordOperation(Long evidenceId, String operationType, Long operatorId,
                                         Long counterpartId, String remark) {
        Evidence evidence = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new IllegalArgumentException("检材不存在，ID: " + evidenceId));

        SysUser operator = sysUserRepository.findById(operatorId)
                .orElseThrow(() -> new IllegalArgumentException("操作人不存在，ID: " + operatorId));

        EvidenceChain chain = new EvidenceChain();
        chain.setEvidenceId(evidenceId);
        chain.setChainNo(NoGenerator.generateChainNo());
        chain.setOperationType(operationType);
        chain.setOperationTime(LocalDateTime.now());
        chain.setOperatorId(operatorId);
        chain.setRemark(remark);

        String signData = buildSignData(chain);
        String operatorSignature = Pkcs7Util.generateSignature(signData, SIGN_PASSWORD);
        chain.setOperatorSignature(operatorSignature);

        if (counterpartId != null) {
            SysUser counterpart = sysUserRepository.findById(counterpartId)
                    .orElseThrow(() -> new IllegalArgumentException("对方不存在，ID: " + counterpartId));
            chain.setCounterpartId(counterpartId);
            String counterpartSignature = Pkcs7Util.generateSignature(signData, SIGN_PASSWORD);
            chain.setCounterpartSignature(counterpartSignature);
        }

        return evidenceChainRepository.save(chain);
    }

    @Override
    @Transactional
    public EvidenceChain unsealEvidence(Long evidenceId, Long operatorId, Long counterpartId,
                                        String remark) {
        Evidence evidence = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new IllegalArgumentException("检材不存在，ID: " + evidenceId));

        String currentStatus = evidence.getSealStatus();
        if (!SealStatus.SEALED.getCode().equals(currentStatus)) {
            throw new IllegalStateException("检材当前状态不是已封存，无法启封");
        }

        SysUser operator = sysUserRepository.findById(operatorId)
                .orElseThrow(() -> new IllegalArgumentException("操作人不存在，ID: " + operatorId));

        EvidenceChain chain = new EvidenceChain();
        chain.setEvidenceId(evidenceId);
        chain.setChainNo(NoGenerator.generateChainNo());
        chain.setOperationType(OperationType.UNSEAL.getCode());
        chain.setOperationTime(LocalDateTime.now());
        chain.setOperatorId(operatorId);
        chain.setCounterpartId(counterpartId);
        chain.setPreviousSealStatus(currentStatus);
        chain.setNewSealStatus(SealStatus.UNSEALED.getCode());
        chain.setRemark(remark);

        String signData = buildSignData(chain);
        String operatorSignature = Pkcs7Util.generateSignature(signData, SIGN_PASSWORD);
        chain.setOperatorSignature(operatorSignature);

        if (counterpartId != null) {
            SysUser counterpart = sysUserRepository.findById(counterpartId)
                    .orElseThrow(() -> new IllegalArgumentException("对方不存在，ID: " + counterpartId));
            String counterpartSignature = Pkcs7Util.generateSignature(signData, SIGN_PASSWORD);
            chain.setCounterpartSignature(counterpartSignature);
        }

        evidence.setSealStatus(SealStatus.UNSEALED.getCode());
        evidenceRepository.save(evidence);

        return evidenceChainRepository.save(chain);
    }

    @Override
    @Transactional
    public EvidenceChain sealEvidence(Long evidenceId, Long operatorId, Long counterpartId,
                                      String remark) {
        Evidence evidence = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new IllegalArgumentException("检材不存在，ID: " + evidenceId));

        String currentStatus = evidence.getSealStatus();
        if (!SealStatus.UNSEALED.getCode().equals(currentStatus)) {
            throw new IllegalStateException("检材当前状态不是已启封，无法封存");
        }

        SysUser operator = sysUserRepository.findById(operatorId)
                .orElseThrow(() -> new IllegalArgumentException("操作人不存在，ID: " + operatorId));

        EvidenceChain chain = new EvidenceChain();
        chain.setEvidenceId(evidenceId);
        chain.setChainNo(NoGenerator.generateChainNo());
        chain.setOperationType(OperationType.SEAL.getCode());
        chain.setOperationTime(LocalDateTime.now());
        chain.setOperatorId(operatorId);
        chain.setCounterpartId(counterpartId);
        chain.setPreviousSealStatus(currentStatus);
        chain.setNewSealStatus(SealStatus.SEALED.getCode());
        chain.setRemark(remark);

        String signData = buildSignData(chain);
        String operatorSignature = Pkcs7Util.generateSignature(signData, SIGN_PASSWORD);
        chain.setOperatorSignature(operatorSignature);

        if (counterpartId != null) {
            SysUser counterpart = sysUserRepository.findById(counterpartId)
                    .orElseThrow(() -> new IllegalArgumentException("对方不存在，ID: " + counterpartId));
            String counterpartSignature = Pkcs7Util.generateSignature(signData, SIGN_PASSWORD);
            chain.setCounterpartSignature(counterpartSignature);
        }

        evidence.setSealStatus(SealStatus.SEALED.getCode());
        evidenceRepository.save(evidence);

        return evidenceChainRepository.save(chain);
    }

    @Override
    @Transactional
    public EvidenceChain transferEvidence(Long evidenceId, Long operatorId, Long counterpartId,
                                          String remark) {
        Evidence evidence = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new IllegalArgumentException("检材不存在，ID: " + evidenceId));

        if (counterpartId == null) {
            throw new IllegalArgumentException("交接操作必须指定对方人员");
        }

        SysUser operator = sysUserRepository.findById(operatorId)
                .orElseThrow(() -> new IllegalArgumentException("操作人不存在，ID: " + operatorId));

        SysUser counterpart = sysUserRepository.findById(counterpartId)
                .orElseThrow(() -> new IllegalArgumentException("对方不存在，ID: " + counterpartId));

        String currentStatus = evidence.getSealStatus();

        EvidenceChain chain = new EvidenceChain();
        chain.setEvidenceId(evidenceId);
        chain.setChainNo(NoGenerator.generateChainNo());
        chain.setOperationType(OperationType.TRANSFER.getCode());
        chain.setOperationTime(LocalDateTime.now());
        chain.setOperatorId(operatorId);
        chain.setCounterpartId(counterpartId);
        chain.setPreviousSealStatus(currentStatus);
        chain.setNewSealStatus(currentStatus);
        chain.setRemark(remark);

        String signData = buildSignData(chain);
        String operatorSignature = Pkcs7Util.generateSignature(signData, SIGN_PASSWORD);
        chain.setOperatorSignature(operatorSignature);

        String counterpartSignature = Pkcs7Util.generateSignature(signData, SIGN_PASSWORD);
        chain.setCounterpartSignature(counterpartSignature);

        return evidenceChainRepository.save(chain);
    }

    private String buildSignData(EvidenceChain chain) {
        return chain.getEvidenceId() + "|" +
                chain.getOperationType() + "|" +
                chain.getOperationTime() + "|" +
                chain.getOperatorId() + "|" +
                (chain.getCounterpartId() != null ? chain.getCounterpartId() : "") + "|" +
                (chain.getPreviousSealStatus() != null ? chain.getPreviousSealStatus() : "") + "|" +
                (chain.getNewSealStatus() != null ? chain.getNewSealStatus() : "") + "|" +
                (chain.getRemark() != null ? chain.getRemark() : "");
    }
}
