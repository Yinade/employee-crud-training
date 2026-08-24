package com.lms_payment_service.lms_payment_service.utils;

import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

public class FileValidation {
    private static final Set<String> ALLOWED = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png"
    );

    public static void validateInvoice(MultipartFile file, long maxBytes) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file uploaded.");
        }
        if (file.getSize() > maxBytes) {
            throw new IllegalArgumentException("File too large. Max is " + (maxBytes / (1024*1024)) + "MB");
        }
        String ct = file.getContentType();
        if (ct == null || !ALLOWED.contains(ct)) {
            throw new IllegalArgumentException("Unsupported file type. Allowed: PDF, JPEG, PNG");
        }
    }
}

