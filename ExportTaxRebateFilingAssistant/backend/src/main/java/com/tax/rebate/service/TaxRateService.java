package com.tax.rebate.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tax.rebate.dto.PageRequest;
import com.tax.rebate.dto.PageResult;
import com.tax.rebate.entity.TaxRate;
import com.tax.rebate.mapper.TaxRateMapper;
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
public class TaxRateService {

    private final TaxRateMapper taxRateMapper;

    public int importCsv(MultipartFile file) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
        CSVParser csvParser = CSVParser.parse(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim());

        List<TaxRate> list = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (CSVRecord record : csvParser) {
            TaxRate entity = new TaxRate();
            entity.setHsCode(record.get("hs_code"));
            entity.setProductName(record.get("product_name"));
            entity.setTaxRate(new BigDecimal(record.get("tax_rate")));
            entity.setCategory(record.get("category"));
            entity.setEffectiveDate(LocalDate.parse(record.get("effective_date"), fmt));
            list.add(entity);
        }

        for (TaxRate item : list) {
            taxRateMapper.insert(item);
        }
        return list.size();
    }

    public PageResult<TaxRate> pageQuery(PageRequest pageRequest) {
        Page<TaxRate> page = new Page<>(pageRequest.getPage(), pageRequest.getSize());
        LambdaQueryWrapper<TaxRate> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(pageRequest.getKeyword())) {
            wrapper.like(TaxRate::getHsCode, pageRequest.getKeyword())
                    .or().like(TaxRate::getProductName, pageRequest.getKeyword())
                    .or().like(TaxRate::getCategory, pageRequest.getKeyword());
        }
        wrapper.orderByDesc(TaxRate::getCreatedAt);
        Page<TaxRate> result = taxRateMapper.selectPage(page, wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), pageRequest.getPage(), pageRequest.getSize());
    }

    public TaxRate getById(Long id) {
        return taxRateMapper.selectById(id);
    }

    public boolean save(TaxRate taxRate) {
        return taxRateMapper.insert(taxRate) > 0;
    }

    public boolean updateById(TaxRate taxRate) {
        return taxRateMapper.updateById(taxRate) > 0;
    }

    public boolean deleteById(Long id) {
        return taxRateMapper.deleteById(id) > 0;
    }

    public TaxRate queryByHsCode(String hsCode) {
        LambdaQueryWrapper<TaxRate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TaxRate::getHsCode, hsCode).orderByDesc(TaxRate::getEffectiveDate).last("LIMIT 1");
        return taxRateMapper.selectOne(wrapper);
    }
}
