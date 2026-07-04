package com.hackathon.gateway.filter;

import com.hackathon.common.util.JwtUtils;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter implements Filter {

    private final JwtUtils jwtUtils;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    private static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/auth/login",
            "/auth/login/mfa/verify",
            "/auth/register",
            "/auth/refresh",
            "/auth/logout",
            "/auth/users",
            "/auth/users/**",
            "**/actuator/**"
    );

    public JwtAuthenticationFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        String path = httpRequest.getRequestURI();

        // Bypass CORS preflight OPTIONS requests
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        boolean isPublic = PUBLIC_ENDPOINTS.stream()
                .anyMatch(pattern -> pathMatcher.match(pattern, path));

        if (isPublic) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            onError(httpResponse, "Missing or invalid Authorization Header", HttpStatus.UNAUTHORIZED);
            return;
        }

        String token = authHeader.substring(7);

        try {
            if (!jwtUtils.validateToken(token)) {
                onError(httpResponse, "Invalid or Expired JWT Token", HttpStatus.UNAUTHORIZED);
                return;
            }

            String username = jwtUtils.extractUsername(token);
            List<String> roles = jwtUtils.extractRoles(token);
            String rolesStr = String.join(",", roles);

            HttpServletRequestWrapper requestWrapper = new HttpServletRequestWrapper(httpRequest) {
                @Override
                public String getHeader(String name) {
                    if ("X-User-Name".equalsIgnoreCase(name)) {
                        return username;
                    }
                    if ("X-User-Roles".equalsIgnoreCase(name)) {
                        return rolesStr;
                    }
                    return super.getHeader(name);
                }

                @Override
                public java.util.Enumeration<String> getHeaderNames() {
                    java.util.List<String> names = java.util.Collections.list(super.getHeaderNames());
                    names.add("X-User-Name");
                    names.add("X-User-Roles");
                    return java.util.Collections.enumeration(names);
                }

                @Override
                public java.util.Enumeration<String> getHeaders(String name) {
                    if ("X-User-Name".equalsIgnoreCase(name)) {
                        return java.util.Collections.enumeration(List.of(username));
                    }
                    if ("X-User-Roles".equalsIgnoreCase(name)) {
                        return java.util.Collections.enumeration(List.of(rolesStr));
                    }
                    return super.getHeaders(name);
                }
            };

            chain.doFilter(requestWrapper, response);

        } catch (Exception e) {
            onError(httpResponse, "Token verification failed: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    private void onError(HttpServletResponse response, String err, HttpStatus status) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        String body = String.format("{\"success\":false,\"message\":\"%s\",\"timestamp\":\"%s\"}", 
                err, java.time.LocalDateTime.now());
        response.getWriter().write(body);
    }
}
