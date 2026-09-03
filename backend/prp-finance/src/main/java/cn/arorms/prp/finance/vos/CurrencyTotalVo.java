package cn.arorms.prp.finance.vos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor
public class CurrencyTotalVo {
    private String currency;
    private BigDecimal total;
}
