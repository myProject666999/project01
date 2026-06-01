package com.aics.quality;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
@MapperScan("com.aics.quality.mapper")
public class AiCsQualityApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiCsQualityApplication.class, args);
        System.out.println("AI客服对话质检与话术优化系统启动成功！");
    }
}
