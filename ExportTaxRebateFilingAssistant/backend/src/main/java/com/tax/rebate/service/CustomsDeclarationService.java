package com.tax.rebate.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tax.rebate.dto.CustomsDeclarationImportDTO;
import com.tax.rebate.dto.PageRequest;
import com.tax.rebate.dto.PageResult;
import com.tax.rebate.entity.CustomsDeclaration;
import com.tax.rebate.mapper.CustomsDeclarationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;

@Service
@RequiredArgsConstructor
public class CustomsDeclarationService {

    private final CustomsDeclarationMapper customsDeclarationMapper;

    public int importCsv(MultipartFile file) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
        CSVParser csvParser = CSVParser.parse(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim());

        List<CustomsDeclaration> list = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (CSVRecord record : csvParser) {
            CustomsDeclaration entity = new CustomsDeclaration();
            entity.setDeclarationNo(record.get("declaration_no"));
            entity.setHsCode(record.get("hs_code"));
            entity.setProductName(record.get("product_name"));
            entity.setQuantity(new BigDecimal(record.get("quantity")));
            entity.setUnit(record.get("unit"));
            entity.setAmountUsd(new BigDecimal(record.get("amount_usd")));
            entity.setAmountCny(new BigDecimal(record.get("amount_cny")));
            entity.setCurrency(record.get("currency"));
            entity.setExportDate(LocalDate.parse(record.get("export_date"), fmt));
            entity.setStatus("PENDING");
            list.add(entity);
        }

        for (CustomsDeclaration item : list) {
            customsDeclarationMapper.insert(item);
        }
        return list.size();
    }

    public PageResult<CustomsDeclaration> pageQuery(PageRequest pageRequest) {
        Page<CustomsDeclaration> page = new Page<>(pageRequest.getPage(), pageRequest.getSize());
        LambdaQueryWrapper<CustomsDeclaration> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(pageRequest.getKeyword())) {
            wrapper.like(CustomsDeclaration::getDeclarationNo, pageRequest.getKeyword())
                    .or().like(CustomsDeclaration::getProductName, pageRequest.getKeyword())
                    .or().like(CustomsDeclaration::getHsCode, pageRequest.getKeyword());
        }
        wrapper.orderByDesc(CustomsDeclaration::getCreatedAt);
        Page<CustomsDeclaration> result = customsDeclarationMapper.selectPage(page, wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), pageRequest.getPage(), pageRequest.getSize());
    }

    public CustomsDeclaration getById(Long id) {
        return customsDeclarationMapper.selectById(id);
    }

    public boolean deleteById(Long id) {
        return customsDeclarationMapper.deleteById(id) > 0;
    }
}
