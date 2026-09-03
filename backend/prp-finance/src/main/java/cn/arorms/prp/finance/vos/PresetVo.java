package cn.arorms.prp.finance.vos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PresetVo {
    private Long id;
    private String userId;
    private String type;
    private BigDecimal amount;
    private Long fromAccountId;
    private Long toAccountId;
    private Long categoryId;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String fromAccountName;
    private String toAccountName;
    private String categoryName;
}
