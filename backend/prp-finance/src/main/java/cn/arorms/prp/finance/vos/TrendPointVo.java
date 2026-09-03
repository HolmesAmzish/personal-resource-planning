package cn.arorms.prp.finance.vos;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data @AllArgsConstructor
public class TrendPointVo {
    private String period;
    private BigDecimal income;
    private BigDecimal expense;
}
