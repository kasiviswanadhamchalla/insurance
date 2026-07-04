package com.hackathon.gateway.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(100) // Execute late in the chain
public class LoggingFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(LoggingFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        long startTime = System.currentTimeMillis();
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String method = httpRequest.getMethod();
        String path = httpRequest.getRequestURI();
        String remoteAddress = httpRequest.getRemoteAddr();

        log.info("API Gateway Routing - Method: {}, Path: {}, Client Address: {}", method, path, remoteAddress);

        try {
            chain.doFilter(request, response);
        } finally {
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            long duration = System.currentTimeMillis() - startTime;
            log.info("API Gateway Routing Complete - Status: {}, Method: {}, Path: {}, Latency: {} ms",
                    httpResponse.getStatus(), method, path, duration);
        }
    }
}
