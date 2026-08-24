package com.lms_payment_service.lms_payment_service.exceptions;

public class InvalidStateTransitionException extends RuntimeException {
    public InvalidStateTransitionException(String msg) { super(msg); }
}