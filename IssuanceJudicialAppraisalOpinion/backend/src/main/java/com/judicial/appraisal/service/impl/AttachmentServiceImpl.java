package com.judicial.appraisal.service.impl;

import cn.hutool.json.JSONUtil;
import com.judicial.appraisal.common.enums.BizType;
import com.judicial.appraisal.entity.Attachment;
import com.judicial.appraisal.repository.AttachmentRepository;
import com.judicial.appraisal.service.AttachmentService;
import com.judicial.appraisal.util.NoGenerator;
import com.judicial.appraisal.util.WatermarkUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AttachmentServiceImpl implements AttachmentService {

    private static final String UPLOAD_DIR = "D:/judicial-appraisal/uploads/";
    private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Override
    @Transactional
    public Attachment uploadEvidencePhoto(MultipartFile file, Long evidenceId, Long userId, String location) {
        return uploadPhoto(file, BizType.EVIDENCE.getCode(), evidenceId, userId, location);
    }

    @Override
    @Transactional
    public Attachment uploadInspectionPhoto(MultipartFile file, Long inspectionId, Long userId, String location) {
        return uploadPhoto(file, BizType.INSPECTION.getCode(), inspectionId, userId, location);
    }

    private Attachment uploadPhoto(MultipartFile file, String bizType, Long bizId, Long userId, String location) {
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String fileName = UUID.randomUUID().toString() + extension;

            String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
            byte[] fileBytes = file.getBytes();
            byte[] watermarkedBytes = WatermarkUtil.addWatermark(fileBytes, timestamp, location);

            String fileHash = WatermarkUtil.generateFileHash(watermarkedBytes);

            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            Path filePath = Paths.get(UPLOAD_DIR, fileName);
            Files.write(filePath, watermarkedBytes);

            Map<String, String> watermarkInfo = new HashMap<>();
            watermarkInfo.put("timestamp", timestamp);
            watermarkInfo.put("location", location);
            watermarkInfo.put("hash", fileHash);
            String watermarkInfoJson = JSONUtil.toJsonStr(watermarkInfo);

            Attachment attachment = new Attachment();
            attachment.setAttachmentNo(NoGenerator.generateAttachmentNo());
            attachment.setBizType(bizType);
            attachment.setBizId(bizId);
            attachment.setFileName(originalFilename);
            attachment.setFilePath(filePath.toString());
            attachment.setFileSize((long) watermarkedBytes.length);
            attachment.setFileType(file.getContentType());
            attachment.setWatermarkInfo(watermarkInfoJson);
            attachment.setFileHash(fileHash);
            attachment.setUploadedBy(userId);

            return attachmentRepository.save(attachment);
        } catch (IOException e) {
            throw new RuntimeException("文件上传失败", e);
        }
    }

    @Override
    public List<Attachment> getAttachments(String bizType, Long bizId) {
        return attachmentRepository.findByBizTypeAndBizId(bizType, bizId);
    }

    @Override
    public Resource downloadFile(Long id) {
        Attachment attachment = attachmentRepository.findById(id).orElse(null);
        if (attachment == null) {
            throw new RuntimeException("文件不存在");
        }
        File file = new File(attachment.getFilePath());
        if (!file.exists()) {
            throw new RuntimeException("文件不存在");
        }
        return new FileSystemResource(file);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        Attachment attachment = attachmentRepository.findById(id).orElse(null);
        if (attachment != null) {
            File file = new File(attachment.getFilePath());
            if (file.exists()) {
                file.delete();
            }
            attachmentRepository.deleteById(id);
        }
    }
}
