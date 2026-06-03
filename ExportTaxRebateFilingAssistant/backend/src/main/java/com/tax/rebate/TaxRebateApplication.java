package com.tax.rebate;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.tax.rebate.mapper")
public class TaxRebateApplication {

    public static void main(String[] args) {
        SpringApplication.run(TaxRebateApplication.class, args);
    }
}
