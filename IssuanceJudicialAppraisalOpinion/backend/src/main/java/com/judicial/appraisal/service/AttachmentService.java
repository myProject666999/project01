package com.judicial.appraisal.service;

import com.judicial.appraisal.entity.Attachment;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AttachmentService {

    Attachment uploadEvidencePhoto(MultipartFile file, Long evidenceId, Long userId, String location);

    Attachment uploadInspectionPhoto(MultipartFile file, Long inspectionId, Long userId, String location);

    List<Attachment> getAttachments(String bizType, Long bizId);

    Resource downloadFile(Long id);
}
