package com.craftbeer.brewing;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 精酿啤酒酿造批次记录系统主启动类
 */
@SpringBootApplication
@MapperScan("com.craftbeer.brewing.mapper")
public class BrewingBatchApplication {

    public static void main(String[] args) {
        SpringApplication.run(BrewingBatchApplication.class, args);
        System.out.println("================================================");
        System.out.println("  精酿啤酒酿造批次记录系统启动成功!");
        System.out.println("  访问地址: http://localhost:8080/api");
        System.out.println("================================================");
    }
}
