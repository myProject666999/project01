package com.judicial.appraisal.service;

import com.judicial.appraisal.entity.EvidenceChain;

import java.util.List;

public interface EvidenceChainService {

    List<EvidenceChain> getChainByEvidenceId(Long evidenceId);

    EvidenceChain recordOperation(Long evidenceId, String operationType, Long operatorId,
                                  Long counterpartId, String remark);

    EvidenceChain unsealEvidence(Long evidenceId, Long operatorId, Long counterpartId,
                                 String remark);

    EvidenceChain sealEvidence(Long evidenceId, Long operatorId, Long counterpartId,
                               String remark);

    EvidenceChain transferEvidence(Long evidenceId, Long operatorId, Long counterpartId,
                                   String remark);
}
