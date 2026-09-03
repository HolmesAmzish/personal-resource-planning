package cn.arorms.prp.finance.vos;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data @AllArgsConstructor
public class AccountBalanceVo {
    private Long accountId;
    private String accountName;
    private String currency;
    private BigDecimal balance;
}
