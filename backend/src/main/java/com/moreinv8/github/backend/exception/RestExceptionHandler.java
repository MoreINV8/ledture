package com.moreinv8.github.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Global exception handler for the REST API.
 * Maps {@link BusinessException} and other runtime exceptions to appropriate HTTP responses.
 */
@RestControllerAdvice
public class RestExceptionHandler {

    public static class ErrorResponse {
        public String error;
        public String message;
        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
        }
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        // Determine status based on common error keywords used in BusinessException messages
        String msg = ex.getMessage();
        HttpStatus status = HttpStatus.BAD_REQUEST;
        if (msg != null) {
            if (msg.contains("UNAUTHORIZED")) {
                status = HttpStatus.UNAUTHORIZED;
            } else if (msg.contains("TRANSACTION_NOT_FOUND") || msg.contains("Category not found")) {
                status = HttpStatus.NOT_FOUND;
            } else if (msg.contains("DUPLICATE_EMAIL")) {
                status = HttpStatus.CONFLICT;
            } else if (msg.contains("TRANSACTION_TOO_OLD")) {
                status = HttpStatus.BAD_REQUEST;
            }
        }
        return new ResponseEntity<>(new ErrorResponse(status.getReasonPhrase(), msg), status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        // Fallback for unexpected errors
        return new ResponseEntity<>(new ErrorResponse("INTERNAL_SERVER_ERROR", ex.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
