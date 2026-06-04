package com.tcm.pulse.controller;

import com.tcm.pulse.common.Result;
import com.tcm.pulse.exception.BusinessException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Tag(name = "文件上传", description = "舌象照片等文件上传")
@RestController
@RequestMapping("/upload")
public class FileUploadController {

    @Value("${file.upload.path:./uploads}")
    private String uploadPath;

    @Operation(summary = "上传舌象照片")
    @PostMapping("/tongue")
    public Result<Map<String, String>> uploadTongueImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("请选择上传文件");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new BusinessException("文件名不能为空");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        if (!".jpg".equalsIgnoreCase(extension) && !".jpeg".equalsIgnoreCase(extension)
                && !".png".equalsIgnoreCase(extension) && !".gif".equalsIgnoreCase(extension)) {
            throw new BusinessException("仅支持JPG、PNG、GIF格式的图片");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BusinessException("图片大小不能超过10MB");
        }

        try {
            String newFilename = UUID.randomUUID().toString().replace("-", "") + extension;
            String subDir = "tongue/" + java.time.LocalDate.now();
            Path dirPath = Paths.get(uploadPath, subDir);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }

            Path filePath = dirPath.resolve(newFilename);
            file.transferTo(filePath.toFile());

            String fileUrl = "/uploads/" + subDir + "/" + newFilename;

            Map<String, String> result = new HashMap<>();
            result.put("url", fileUrl);
            result.put("filename", newFilename);
            result.put("originalFilename", originalFilename);

            return Result.success(result);
        } catch (IOException e) {
            log.error("文件上传失败", e);
            throw new BusinessException("文件上传失败: " + e.getMessage());
        }
    }
}
