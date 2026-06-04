package com.tcm.pulse.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("中医脉案诊疗记录系统 - API文档")
                        .version("1.0.0")
                        .description("基于望闻问切四诊的中医诊疗记录系统，支持处方开具、十八反十九畏配伍禁忌校验、复诊加味减味等功能")
                        .contact(new Contact()
                                .name("中医脉案系统")
                                .email("support@tcm-pulse.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")));
    }
}
