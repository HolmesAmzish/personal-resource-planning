package cn.arorms.prp.common.exceptions;

import cn.arorms.framework.common.exception.BaseExceptionHandler;
import org.hibernate.PropertyValueException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler extends BaseExceptionHandler {
    /**
     * Data property exception
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> handleDatabaseError(DataIntegrityViolationException e) {

        if (e.getCause() instanceof PropertyValueException propertyValueException) {
            return ResponseEntity.badRequest().body("Property '" + propertyValueException.getPropertyName() + "' cannot be null.");
        }

        return ResponseEntity.internalServerError().body("Internal error.");
    }

    /**
     * Bean Validation failures on @Valid request bodies
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationError(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + " " + f.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return ResponseEntity.badRequest().body(message);
    }
}
