package com.lms_payment_service.lms_payment_service.utils;

import com.lms_payment_service.lms_payment_service.security.CurrentUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class AuthUtils {
    private AuthUtils() {}

    public static Long currentAccountId() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a == null || !(a.getPrincipal() instanceof CurrentUser cu) || cu.accountId() == null) {
            throw new IllegalArgumentException("Missing accountId in token");
        }
        return ((CurrentUser) a.getPrincipal()).accountId();
    }
}