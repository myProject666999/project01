package com.lawfirm.case_management.controller;

import com.lawfirm.case_management.entity.Document;
import com.lawfirm.case_management.entity.DocumentTemplate;
import com.lawfirm.case_management.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping("/templates")
    public ResponseEntity<List<DocumentTemplate>> getAllTemplates() {
        return ResponseEntity.ok(documentService.getAllTemplates());
    }

    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<Document>> getDocumentsByCaseId(@PathVariable Long caseId) {
        return ResponseEntity.ok(documentService.getDocumentsByCaseId(caseId));
    }

    @GetMapping("/generate/{caseId}/{templateCode}")
    public ResponseEntity<byte[]> generateDocument(
            @PathVariable Long caseId,
            @PathVariable String templateCode) {
        try {
            byte[] content = documentService.generateDocument(caseId, templateCode);
            String fileName = URLEncoder.encode(templateCode + ".docx", "UTF-8");

            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + fileName)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(content);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/save/{caseId}/{templateCode}")
    public ResponseEntity<?> saveDocument(
            @PathVariable Long caseId,
            @PathVariable String templateCode,
            @RequestParam String docName) {
        try {
            Document document = documentService.saveGeneratedDocument(caseId, templateCode, docName);
            return ResponseEntity.ok(document);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
