package cn.arorms.prp.finance.repositories;

import java.math.BigDecimal;
import java.util.List;

/**
 * QueryDSL fragment replacing the balance update / currency sum XML.
 */
public interface AccountRepositoryCustom {
    void updateBalance(Long id, BigDecimal delta);

    List<CurrencyTotal> sumByCurrency(String userId);

    record CurrencyTotal(String currency, BigDecimal total) {
    }
}
