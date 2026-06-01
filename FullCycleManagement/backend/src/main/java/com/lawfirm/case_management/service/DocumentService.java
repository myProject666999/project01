package com.lawfirm.case_management.service;

import com.lawfirm.case_management.entity.CaseLawyer;
import com.lawfirm.case_management.entity.Client;
import com.lawfirm.case_management.entity.Document;
import com.lawfirm.case_management.entity.DocumentTemplate;
import com.lawfirm.case_management.entity.Lawyer;
import com.lawfirm.case_management.entity.LegalCase;
import com.lawfirm.case_management.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentTemplateRepository documentTemplateRepository;
    private final LegalCaseRepository legalCaseRepository;
    private final LawyerRepository lawyerRepository;
    private final ClientRepository clientRepository;
    private final CaseLawyerRepository caseLawyerRepository;

    @Value("${file.template-path:./templates}")
    private String templatePath;

    @Value("${file.upload-path:./uploads}")
    private String uploadPath;

    public List<DocumentTemplate> getAllTemplates() {
        return documentTemplateRepository.findAll();
    }

    public List<Document> getDocumentsByCaseId(Long caseId) {
        return documentRepository.findByCaseId(caseId);
    }

    public byte[] generateDocument(Long caseId, String templateCode) throws Exception {
        LegalCase legalCase = legalCaseRepository.findById(caseId)
            .orElseThrow(() -> new IllegalArgumentException("案件不存在: " + caseId));

        DocumentTemplate template = documentTemplateRepository.findByTemplateCode(templateCode);
        if (template == null) {
            throw new IllegalArgumentException("模板不存在: " + templateCode);
        }

        Map<String, String> placeholders = buildPlaceholders(legalCase);

        Path templateFile = Paths.get(template.getFilePath());
        if (!Files.exists(templateFile)) {
            Files.createDirectories(Paths.get(templatePath));
            return createDefaultDocument(legalCase, templateCode);
        }

        try (InputStream is = Files.newInputStream(templateFile);
             XWPFDocument document = new XWPFDocument(is)) {

            replacePlaceholders(document, placeholders);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.write(baos);
            return baos.toByteArray();
        }
    }

    public Document saveGeneratedDocument(Long caseId, String templateCode, String docName) throws Exception {
        byte[] content = generateDocument(caseId, templateCode);

        Files.createDirectories(Paths.get(uploadPath));
        String fileName = UUID.randomUUID().toString() + ".docx";
        Path filePath = Paths.get(uploadPath, fileName);
        Files.write(filePath, content);

        Document document = new Document();
        document.setCaseId(caseId);
        document.setDocName(docName);
        document.setDocType(templateCode);
        document.setTemplateCode(templateCode);
        document.setFilePath(filePath.toString());

        return documentRepository.save(document);
    }

    private Map<String, String> buildPlaceholders(LegalCase legalCase) {
        Map<String, String> placeholders = new HashMap<>();

        placeholders.put("${caseNumber}", legalCase.getCaseNumber());
        placeholders.put("${caseName}", legalCase.getCaseName());
        placeholders.put("${caseDescription}", legalCase.getCaseDescription() != null ? legalCase.getCaseDescription() : "");
        placeholders.put("${court}", legalCase.getCourt() != null ? legalCase.getCourt() : "");
        placeholders.put("${judge}", legalCase.getJudge() != null ? legalCase.getJudge() : "");
        placeholders.put("${today}", LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy年MM月dd日")));

        if (legalCase.getFilingDate() != null) {
            placeholders.put("${filingDate}", legalCase.getFilingDate().format(DateTimeFormatter.ofPattern("yyyy年MM月dd日")));
        } else {
            placeholders.put("${filingDate}", "");
        }

        if (legalCase.getClientId() != null) {
            Client client = clientRepository.findById(legalCase.getClientId()).orElse(null);
            if (client != null) {
                placeholders.put("${clientName}", client.getName());
                placeholders.put("${clientPhone}", client.getPhone() != null ? client.getPhone() : "");
                placeholders.put("${clientAddress}", client.getAddress() != null ? client.getAddress() : "");
            }
        }

        if (legalCase.getOpposingPartyId() != null) {
            Client opposing = clientRepository.findById(legalCase.getOpposingPartyId()).orElse(null);
            if (opposing != null) {
                placeholders.put("${opposingName}", opposing.getName());
            }
        }

        List<CaseLawyer> caseLawyers = caseLawyerRepository.findByCaseId(legalCase.getId());
        if (!caseLawyers.isEmpty()) {
            Lawyer lawyer = lawyerRepository.findById(caseLawyers.get(0).getLawyerId()).orElse(null);
            if (lawyer != null) {
                placeholders.put("${lawyerName}", lawyer.getName());
                placeholders.put("${lawyerLicense}", lawyer.getLicenseNumber() != null ? lawyer.getLicenseNumber() : "");
                placeholders.put("${lawyerPhone}", lawyer.getPhone() != null ? lawyer.getPhone() : "");
            }
        }

        return placeholders;
    }

    private void replacePlaceholders(XWPFDocument document, Map<String, String> placeholders) {
        for (XWPFParagraph paragraph : document.getParagraphs()) {
            replaceInParagraph(paragraph, placeholders);
        }

        for (XWPFTable table : document.getTables()) {
            for (XWPFTableRow row : table.getRows()) {
                for (XWPFTableCell cell : row.getTableCells()) {
                    for (XWPFParagraph paragraph : cell.getParagraphs()) {
                        replaceInParagraph(paragraph, placeholders);
                    }
                }
            }
        }
    }

    private void replaceInParagraph(XWPFParagraph paragraph, Map<String, String> placeholders) {
        List<XWPFRun> runs = paragraph.getRuns();
        if (runs == null || runs.isEmpty()) {
            return;
        }

        StringBuilder fullText = new StringBuilder();
        for (XWPFRun run : runs) {
            String text = run.getText(0);
            if (text != null) {
                fullText.append(text);
            }
        }

        String originalText = fullText.toString();
        String replacedText = originalText;

        for (Map.Entry<String, String> entry : placeholders.entrySet()) {
            replacedText = replacedText.replace(entry.getKey(), entry.getValue());
        }

        if (!originalText.equals(replacedText)) {
            for (int i = 0; i < runs.size(); i++) {
                if (i == 0) {
                    runs.get(i).setText(replacedText, 0);
                } else {
                    runs.get(i).setText("", 0);
                }
            }
        }
    }

    private byte[] createDefaultDocument(LegalCase legalCase, String templateCode) throws Exception {
        try (XWPFDocument document = new XWPFDocument()) {
            XWPFParagraph title = document.createParagraph();
            title.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun titleRun = title.createRun();
            titleRun.setBold(true);
            titleRun.setFontSize(18);
            titleRun.setText(templateCode + " - " + legalCase.getCaseName());

            XWPFParagraph p1 = document.createParagraph();
            XWPFRun run1 = p1.createRun();
            run1.setText("案件编号: " + legalCase.getCaseNumber());

            XWPFParagraph p2 = document.createParagraph();
            XWPFRun run2 = p2.createRun();
            run2.setText("案件名称: " + legalCase.getCaseName());

            if (legalCase.getCaseDescription() != null) {
                XWPFParagraph p3 = document.createParagraph();
                XWPFRun run3 = p3.createRun();
                run3.setText("案情描述: " + legalCase.getCaseDescription());
            }

            XWPFParagraph p4 = document.createParagraph();
            XWPFRun run4 = p4.createRun();
            run4.setText("\n生成时间: " + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy年MM月dd日")));

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.write(baos);
            return baos.toByteArray();
        }
    }
}
