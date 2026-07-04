package com.hackathon.common.aspect;

import com.hackathon.common.annotation.RequiresRole;
import com.hackathon.common.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.util.Arrays;

@Aspect
@Component
public class RoleAuthorizationAspect {

    @Before("@annotation(com.hackathon.common.annotation.RequiresRole) || @within(com.hackathon.common.annotation.RequiresRole)")
    public void authorize(JoinPoint joinPoint) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return;
        }

        HttpServletRequest request = attributes.getRequest();
        String rolesHeader = request.getHeader("X-User-Roles");

        if (rolesHeader == null || rolesHeader.isBlank()) {
            throw new UnauthorizedException("Access Denied: Missing user roles authorization header");
        }

        // Get the @RequiresRole annotation (from method or class level)
        RequiresRole requiresRole = getAnnotation(joinPoint);
        if (requiresRole == null) {
            return;
        }

        String[] allowedRoles = requiresRole.value();
        boolean hasRequiredRole = Arrays.stream(allowedRoles)
                .anyMatch(role -> rolesHeader.contains(role));

        if (!hasRequiredRole) {
            throw new UnauthorizedException("Access Denied: Required privilege role missing");
        }
    }

    private RequiresRole getAnnotation(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        
        RequiresRole annotation = method.getAnnotation(RequiresRole.class);
        if (annotation != null) {
            return annotation;
        }

        return joinPoint.getTarget().getClass().getAnnotation(RequiresRole.class);
    }
}
