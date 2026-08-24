package com.lms_payment_service.lms_payment_service.utils.errors;

import java.time.OffsetDateTime;
import org.springframework.http.HttpStatus;

public class ErrorResponse {
    // Domain-level fields
    private String code;            // e.g., "ITEM_NAME_TAKEN"
    private String message;         // human-friendly message
    private String field;           // e.g., "name"
    private String rejectedValue;   // e.g., "Fuel"

    // Common fields
    private String path;            // request path
    private OffsetDateTime timestamp;

    // HTTP-level fields
    private int status;             // e.g., 409
    private String error;           // e.g., "Conflict"

    public ErrorResponse() {
        this.timestamp = OffsetDateTime.now();
    }

    // ✅ HTTP-only constructor (used by build(...).simple(...))
    public ErrorResponse(int status, String error, String message, String path) {
        this.timestamp = OffsetDateTime.now();
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }

    // ✅ Full constructor
    public ErrorResponse(int status, String error, String code, String message,
                         String field, String rejectedValue, String path, OffsetDateTime timestamp) {
        this.status = status;
        this.error = error;
        this.code = code;
        this.message = message;
        this.field = field;
        this.rejectedValue = rejectedValue;
        this.path = path;
        this.timestamp = (timestamp != null) ? timestamp : OffsetDateTime.now();
    }

    // ---------- Static factories ----------

    // General purpose (HTTP + domain)
    public static ErrorResponse of(int status, String error, String code, String message,
                                   String field, String rejectedValue, String path) {
        return new ErrorResponse(status, error, code, message, field, rejectedValue, path, OffsetDateTime.now());
    }

    // 👇 Overload that matches your current handleDuplicate(...) call.
    // Defaults to 409 CONFLICT for duplicate-name cases.
    public static ErrorResponse of(String code, String message, String field, String rejectedValue, String path) {
        return new ErrorResponse(HttpStatus.CONFLICT.value(), HttpStatus.CONFLICT.getReasonPhrase(),
                code, message, field, rejectedValue, path, OffsetDateTime.now());
    }

    // Used by build(...) helper
    public static ErrorResponse simple(int status, String error, String message, String path) {
        return new ErrorResponse(status, error, message, path);
    }

    // ---------- Getters (needed by Jackson) ----------
    public String getCode() { return code; }
    public String getMessage() { return message; }
    public String getField() { return field; }
    public String getRejectedValue() { return rejectedValue; }
    public String getPath() { return path; }
    public OffsetDateTime getTimestamp() { return timestamp; }
    public int getStatus() { return status; }
    public String getError() { return error; }

    // (Optional) Setters if you need them for Jackson deserialization
}