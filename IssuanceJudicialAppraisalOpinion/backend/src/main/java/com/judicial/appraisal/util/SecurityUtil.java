package com.judicial.appraisal.util;

import com.judicial.appraisal.security.LoginUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    public static LoginUser getCurrentLoginUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof LoginUser) {
            return (LoginUser) authentication.getPrincipal();
        }
        return null;
    }

    public static Long getCurrentUserId() {
        LoginUser loginUser = getCurrentLoginUser();
        return loginUser != null ? loginUser.getId() : null;
    }

    public static String getCurrentUsername() {
        LoginUser loginUser = getCurrentLoginUser();
        return loginUser != null ? loginUser.getUsername() : null;
    }

    public static String getCurrentRealName() {
        LoginUser loginUser = getCurrentLoginUser();
        return loginUser != null ? loginUser.getRealName() : null;
    }

    public static String getCurrentRole() {
        LoginUser loginUser = getCurrentLoginUser();
        return loginUser != null ? loginUser.getRole() : null;
    }
}
