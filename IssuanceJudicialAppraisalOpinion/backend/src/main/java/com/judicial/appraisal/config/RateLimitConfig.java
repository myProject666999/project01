package com.judicial.appraisal.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.judicial.appraisal.common.Result;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.time.Duration;

@Configuration
public class RateLimitConfig {

    @Bean
    public Bucket verifyBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(10)
                .refillIntervally(10, Duration.ofMinutes(1))
                .build();
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    @Bean
    public Filter rateLimitFilter(Bucket verifyBucket, ObjectMapper objectMapper) {
        return new RateLimitFilter(verifyBucket, objectMapper);
    }

    public static class RateLimitFilter implements Filter {

        private final Bucket verifyBucket;
        private final ObjectMapper objectMapper;

        public RateLimitFilter(Bucket verifyBucket, ObjectMapper objectMapper) {
            this.verifyBucket = verifyBucket;
            this.objectMapper = objectMapper;
        }

        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {
            HttpServletRequest httpRequest = (HttpServletRequest) request;
            String path = httpRequest.getRequestURI();

            if (path.startsWith("/api/verify/")) {
                if (verifyBucket.tryConsume(1)) {
                    chain.doFilter(request, response);
                } else {
                    HttpServletResponse httpResponse = (HttpServletResponse) response;
                    httpResponse.setStatus(429);
                    httpResponse.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    httpResponse.setCharacterEncoding("UTF-8");
                    Result<?> result = Result.error(429, "请求过于频繁，请稍后再试");
                    httpResponse.getWriter().write(objectMapper.writeValueAsString(result));
                }
            } else {
                chain.doFilter(request, response);
            }
        }
    }
}
