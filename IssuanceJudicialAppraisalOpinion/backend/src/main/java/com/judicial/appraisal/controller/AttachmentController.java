package com.judicial.appraisal.controller;

import com.judicial.appraisal.common.Result;
import com.judicial.appraisal.entity.Attachment;
import com.judicial.appraisal.service.AttachmentService;
import com.judicial.appraisal.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    @Autowired
    private AttachmentService attachmentService;

    @PostMapping("/evidence-photo")
    public Result<Attachment> uploadEvidencePhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam("evidenceId") Long evidenceId,
            @RequestParam("location") String location) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        if (currentUserId == null) {
            return Result.error("用户未登录");
        }
        if (file.isEmpty()) {
            return Result.error("文件不能为空");
        }
        try {
            Attachment attachment = attachmentService.uploadEvidencePhoto(file, evidenceId, currentUserId, location);
            return Result.success(attachment);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/inspection-photo")
    public Result<Attachment> uploadInspectionPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam("inspectionId") Long inspectionId,
            @RequestParam("location") String location) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        if (currentUserId == null) {
            return Result.error("用户未登录");
        }
        if (file.isEmpty()) {
            return Result.error("文件不能为空");
        }
        try {
            Attachment attachment = attachmentService.uploadInspectionPhoto(file, inspectionId, currentUserId, location);
            return Result.success(attachment);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping
    public Result<List<Attachment>> list(
            @RequestParam("bizType") String bizType,
            @RequestParam("bizId") Long bizId) {
        List<Attachment> attachments = attachmentService.getAttachments(bizType, bizId);
        return Result.success(attachments);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        try {
            Resource resource = attachmentService.downloadFile(id);
            String fileName = resource.getFilename();
            if (fileName == null) {
                fileName = "attachment_" + id;
            }
            String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8)
                    .replaceAll("\\+", "%20");
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + encodedFileName + "\"; filename*=UTF-8''" + encodedFileName)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteById(@PathVariable Long id) {
        attachmentService.deleteById(id);
        return Result.success();
    }
}
