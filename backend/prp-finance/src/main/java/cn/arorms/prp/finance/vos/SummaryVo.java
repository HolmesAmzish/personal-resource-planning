package cn.arorms.prp.finance.vos;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data @AllArgsConstructor
public class SummaryVo {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal net;
    private List<CategoryBreakdownVo> byCategory;
}
