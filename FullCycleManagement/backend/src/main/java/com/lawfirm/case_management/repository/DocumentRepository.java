package com.lawfirm.case_management.repository;

import com.lawfirm.case_management.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByCaseId(Long caseId);

    List<Document> findByDocType(String docType);

    List<Document> findByTemplateCode(String templateCode);
}
