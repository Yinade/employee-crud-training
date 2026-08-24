package com.lms_payment_service.lms_payment_service.exceptions;

import com.lms_payment_service.lms_payment_service.utils.errors.DuplicateNameException;
import com.lms_payment_service.lms_payment_service.utils.errors.ErrorResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Locale;

// NOTE: Import BOTH types explicitly to avoid ambiguity
import java.util.regex.Matcher;
import java.util.regex.Pattern;

// Java does not support import aliasing; use fully-qualified name for Spring's type in method signature instead.

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ---------- Helper to build uniform ErrorResponse ----------
    private ResponseEntity<ErrorResponse> respond(
            HttpStatus status,
            String code,
            String message,
            HttpServletRequest req,
            String field,
            String rejectedValue
    ) {
        ErrorResponse body = ErrorResponse.of(
                status.value(),
                status.getReasonPhrase(),
                code,
                message,
                field,
                rejectedValue,
                req.getRequestURI()
        );
        return ResponseEntity.status(status).body(body);
    }

    private String inferCode(String message, String fallback) {
        if (message == null || message.isBlank()) return fallback;
        String first = message.split("[\\.:;\\n]")[0]
                .replaceAll("[^a-zA-Z0-9 ]", " ")
                .trim()
                .replaceAll("\\s+", "_")
                .toUpperCase(Locale.ROOT);
        return first.length() < 3 ? fallback : first;
    }

    // ---------- Domain / common exceptions ----------

    @ExceptionHandler(DuplicateNameException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(
            DuplicateNameException ex, HttpServletRequest req) {
        ErrorResponse body = ErrorResponse.of(
                "ITEM_NAME_TAKEN",
                ex.getMessage(),
                "name",
                ex.getValue(),
                req.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest req) {
        return respond(
                HttpStatus.BAD_REQUEST,
                inferCode(ex.getMessage(), "BAD_REQUEST"),
                ex.getMessage(),
                req, null, null
        );
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFound(
            EntityNotFoundException ex, HttpServletRequest req) {
        return respond(
                HttpStatus.NOT_FOUND,
                inferCode(ex.getMessage(), "NOT_FOUND"),
                ex.getMessage(),
                req, null, null
        );
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(
            IllegalStateException ex,
            HttpServletRequest req
    ) {
        // Try to extract the status from the message: "... Current status: APPROVED"
        String msg = ex.getMessage();
        String field = "status";
        String rejected = null;

        Matcher m = Pattern.compile("Current status:\\s*([A-Z_]+)").matcher(msg != null ? msg : "");
        if (m.find()) {
            rejected = m.group(1);
        }

        ErrorResponse body = ErrorResponse.of(
                HttpStatus.CONFLICT.value(),                 // 409
                HttpStatus.CONFLICT.getReasonPhrase(),
                "EDIT_NOT_ALLOWED_NON_PENDING",              // domain code
                (msg == null || msg.isBlank())
                        ? "Only PENDING expenses can be edited."
                        : msg,
                field,
                rejected,
                req.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(
            DataIntegrityViolationException ex, HttpServletRequest req) {
        String msg = ex.getMostSpecificCause() != null
                ? ex.getMostSpecificCause().getMessage()
                : "Data conflict / constraint violation.";
        return respond(
                HttpStatus.CONFLICT,
                "DATA_INTEGRITY_VIOLATION",
                msg,
                req, null, null
        );
    }

    private <T extends Throwable> T findCause(Throwable ex, Class<T> type) {
        Throwable cur = ex;
        while (cur != null) {
            if (type.isInstance(cur)) return type.cast(cur);
            cur = cur.getCause();
        }
        return null;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest req) {
        FieldError first = ex.getBindingResult().getFieldErrors().stream().findFirst().orElse(null);
        String message = "Validation failed";
        String field = null;
        String rejected = null;

        if (first != null) {
            field = first.getField();
            rejected = first.getRejectedValue() == null ? null : String.valueOf(first.getRejectedValue());
            message = field + ": " + first.getDefaultMessage();
        }

        return respond(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                message,
                req, field, rejected
        );
    }

    @ExceptionHandler(TransactionSystemException.class)
    public ResponseEntity<ErrorResponse> handleTransaction(
            TransactionSystemException ex, HttpServletRequest req) {
        return respond(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                "Transaction failed",
                req, null, null
        );
    }

    // ---------- Access Denied (two distinct types) ----------

    // Service-level (you throw java.nio.file.AccessDeniedException in your code)
    @ExceptionHandler(java.nio.file.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleNioAccessDenied(
            java.nio.file.AccessDeniedException ex, HttpServletRequest req) {
        return respond(
                HttpStatus.FORBIDDEN,
                "ACCESS_DENIED",
                ex.getMessage(),
                req, null, null
        );
    }

    // Spring Security variant (if/when thrown by filters/interceptors)
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleSpringAccessDenied(
            org.springframework.security.access.AccessDeniedException ex, HttpServletRequest req) {
        return respond(
                HttpStatus.FORBIDDEN,
                "ACCESS_DENIED",
                ex.getMessage(),
                req, null, null
        );
    }

    // ---------- Fallbacks ----------

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntime(
            RuntimeException ex, HttpServletRequest req) {
        String msg = ex.getMessage() == null ? "Unexpected error" : ex.getMessage();
        String lower = msg.toLowerCase(Locale.ROOT);
        if (lower.contains("not found") || lower.contains("no expenses")) {
            return respond(HttpStatus.NOT_FOUND, inferCode(msg, "NOT_FOUND"), msg, req, null, null);
        }
        return respond(HttpStatus.BAD_REQUEST, inferCode(msg, "BAD_REQUEST"), msg, req, null, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleOther(Exception ex, HttpServletRequest req) {
        // 1) If the root cause is our service-level AccessDenied, return 403 with its message
        java.nio.file.AccessDeniedException nio = findCause(ex, java.nio.file.AccessDeniedException.class);
        if (nio != null) {
            return respond(
                    HttpStatus.FORBIDDEN,
                    "ACCESS_DENIED",
                    nio.getMessage() != null ? nio.getMessage() : "Access denied.",
                    req, null, null
            );
        }

        // 2) If the root cause is our 409-style edit rule, surface it as CONFLICT with the actual text
        IllegalStateException illegalState = findCause(ex, IllegalStateException.class);
        if (illegalState != null) {
            String msg = illegalState.getMessage();
            String field = "status";
            String rejected = null;
            if (msg != null) {
                java.util.regex.Matcher m = java.util.regex.Pattern
                        .compile("Current status:\\s*([A-Z_]+)")
                        .matcher(msg);
                if (m.find()) rejected = m.group(1);
            }
            ErrorResponse body = ErrorResponse.of(
                    HttpStatus.CONFLICT.value(),
                    HttpStatus.CONFLICT.getReasonPhrase(),
                    "EDIT_NOT_ALLOWED_NON_PENDING",
                    (msg == null || msg.isBlank()) ? "Only PENDING expenses can be edited." : msg,
                    field,
                    rejected,
                    req.getRequestURI()
            );
            return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
        }

        // 3) Otherwise, DON’T hide the real message — surface it with a stable code
        String msg = (ex.getMessage() == null || ex.getMessage().isBlank())
                ? "Unexpected error"
                : ex.getMessage();
        return respond(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_ERROR",
                msg,  // <-- use the real message when available
                req, null, null
        );
    }


}
