package cn.arorms.prp.finance.vos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class AccountVo {
    private Long id;
    private String userId;
    private String name;
    private String type;
    private BigDecimal balance;
    private String currency;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
