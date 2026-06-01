package com.fishery.fryrelease;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.fishery.fryrelease.mapper")
public class FishFryReleaseApplication {
    public static void main(String[] args) {
        SpringApplication.run(FishFryReleaseApplication.class, args);
    }
}
