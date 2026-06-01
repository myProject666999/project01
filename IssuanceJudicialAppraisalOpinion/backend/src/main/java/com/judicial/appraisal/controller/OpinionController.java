package com.judicial.appraisal.controller;

import com.judicial.appraisal.common.Result;
import com.judicial.appraisal.entity.Opinion;
import com.judicial.appraisal.service.OpinionService;
import com.judicial.appraisal.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.List;

@RestController
@RequestMapping("/api/opinions")
public class OpinionController {

    @Autowired
    private OpinionService opinionService;

    @GetMapping
    public Result<List<Opinion>> list(@RequestParam(required = false) String status) {
        List<Opinion> opinions;
        if (status != null && !status.isEmpty()) {
            opinions = opinionService.findByStatus(status);
        } else {
            opinions = opinionService.findAll();
        }
        return Result.success(opinions);
    }

    @GetMapping("/{id}")
    public Result<Opinion> getById(@PathVariable Long id) {
        Opinion opinion = opinionService.getOpinionDetail(id);
        if (opinion == null) {
            return Result.error("意见书不存在");
        }
        return Result.success(opinion);
    }

    @GetMapping("/entrustment/{entrustmentId}")
    public Result<List<Opinion>> getByEntrustmentId(@PathVariable Long entrustmentId) {
        List<Opinion> opinions = opinionService.findByEntrustmentId(entrustmentId);
        return Result.success(opinions);
    }

    @PostMapping("/draft")
    public Result<Opinion> createDraft(@RequestBody Opinion opinion) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        if (currentUserId == null) {
            return Result.error("用户未登录");
        }
        try {
            Opinion created = opinionService.createDraft(opinion, currentUserId);
            return Result.success(created);
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/submit-review")
    public Result<Opinion> submitReview(@PathVariable Long id) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        if (currentUserId == null) {
            return Result.error("用户未登录");
        }
        try {
            Opinion updated = opinionService.submitToReview(id, currentUserId);
            return Result.success(updated);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/{id}/qrcode")
    public ResponseEntity<Resource> getQrcode(@PathVariable Long id) {
        Opinion opinion = opinionService.getOpinionDetail(id);
        if (opinion == null || opinion.getQrCodePath() == null) {
            return ResponseEntity.notFound().build();
        }
        File qrFile = new File(opinion.getQrCodePath());
        if (!qrFile.exists()) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new FileSystemResource(qrFile);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"qrcode_" + id + ".png\"")
                .contentType(MediaType.IMAGE_PNG)
                .body(resource);
    }
}
