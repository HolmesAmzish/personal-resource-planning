package cn.arorms.prp.finance.vos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TransactionVo {
    private Long id;
    private String userId;
    private Long fromAccountId;
    private Long toAccountId;
    private Long categoryId;
    private String type;
    private BigDecimal amount;
    private LocalDate occurredOn;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String fromAccountName;
    private String toAccountName;
    private String categoryName;
}
