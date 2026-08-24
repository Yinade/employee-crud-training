package com.lms_payment_service.lms_payment_service.utils.errors;

public class DuplicateNameException extends RuntimeException {
    private final String resource;
    private final String field;
    private final String value;

    public DuplicateNameException(String resource, String field, String value) {
        super(resource + " with " + field + " '" + value + "' already exists");
        this.resource = resource;
        this.field = field;
        this.value = value;
    }

    public String getResource() { return resource; }
    public String getField() { return field; }
    public String getValue() { return value; }
}
