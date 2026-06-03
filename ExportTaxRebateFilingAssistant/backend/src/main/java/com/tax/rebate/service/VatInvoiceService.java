package com.tax.rebate.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tax.rebate.dto.PageRequest;
import com.tax.rebate.dto.PageResult;
import com.tax.rebate.entity.VatInvoice;
import com.tax.rebate.mapper.VatInvoiceMapper;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
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

@Service
@RequiredArgsConstructor
public class VatInvoiceService {

    private final VatInvoiceMapper vatInvoiceMapper;

    public int importCsv(MultipartFile file) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
        CSVParser csvParser = CSVParser.parse(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim());

        List<VatInvoice> list = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (CSVRecord record : csvParser) {
            VatInvoice entity = new VatInvoice();
            entity.setInvoiceNo(record.get("invoice_no"));
            entity.setInvoiceCode(record.get("invoice_code"));
            entity.setProductName(record.get("product_name"));
            entity.setQuantity(new BigDecimal(record.get("quantity")));
            entity.setUnit(record.get("unit"));
            entity.setAmount(new BigDecimal(record.get("amount")));
            entity.setTaxAmount(new BigDecimal(record.get("tax_amount")));
            entity.setSellerName(record.get("seller_name"));
            entity.setSellerTaxNo(record.get("seller_tax_no"));
            entity.setInvoiceDate(LocalDate.parse(record.get("invoice_date"), fmt));
            entity.setStatus("PENDING");
            list.add(entity);
        }

        for (VatInvoice item : list) {
            vatInvoiceMapper.insert(item);
        }
        return list.size();
    }

    public PageResult<VatInvoice> pageQuery(PageRequest pageRequest) {
        Page<VatInvoice> page = new Page<>(pageRequest.getPage(), pageRequest.getSize());
        LambdaQueryWrapper<VatInvoice> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(pageRequest.getKeyword())) {
            wrapper.like(VatInvoice::getInvoiceNo, pageRequest.getKeyword())
                    .or().like(VatInvoice::getProductName, pageRequest.getKeyword())
                    .or().like(VatInvoice::getSellerName, pageRequest.getKeyword());
        }
        wrapper.orderByDesc(VatInvoice::getCreatedAt);
        Page<VatInvoice> result = vatInvoiceMapper.selectPage(page, wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), pageRequest.getPage(), pageRequest.getSize());
    }

    public VatInvoice getById(Long id) {
        return vatInvoiceMapper.selectById(id);
    }

    public boolean deleteById(Long id) {
        return vatInvoiceMapper.deleteById(id) > 0;
    }
}
