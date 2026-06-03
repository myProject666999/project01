package com.monitoring.wastewater;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.monitoring.wastewater.mapper")
public class WastewaterMonitoringApplication {
    public static void main(String[] args) {
        SpringApplication.run(WastewaterMonitoringApplication.class, args);
    }
}
