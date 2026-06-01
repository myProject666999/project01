package com.lawfirm.case_management.repository;

import com.lawfirm.case_management.entity.DocumentTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentTemplateRepository extends JpaRepository<DocumentTemplate, Long> {

    DocumentTemplate findByTemplateCode(String templateCode);

    List<DocumentTemplate> findByTemplateType(String templateType);
}
