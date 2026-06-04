package com.tcm.pulse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;

@SpringBootApplication
@CrossOrigin(origins = "*", maxAge = 3600)
public class PulseRecordApplication {

    public static void main(String[] args) {
        SpringApplication.run(PulseRecordApplication.class, args);
        System.out.println("========================================");
        System.out.println("  中医脉案诊疗记录系统 - 后端启动成功  ");
        System.out.println("  接口文档: http://localhost:8080/api/swagger-ui.html");
        System.out.println("========================================");
    }
}
