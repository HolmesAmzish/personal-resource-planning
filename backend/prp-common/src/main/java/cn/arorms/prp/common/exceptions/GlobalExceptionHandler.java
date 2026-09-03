package cn.arorms.prp.common.exceptions;

import cn.arorms.framework.common.exception.BaseExceptionHandler;
import org.hibernate.PropertyValueException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

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
}
