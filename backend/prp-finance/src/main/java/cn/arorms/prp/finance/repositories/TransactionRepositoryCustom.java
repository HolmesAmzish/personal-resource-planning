package cn.arorms.prp.finance.repositories;

import cn.arorms.prp.finance.entities.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * QueryDSL fragment replacing MyBatis-Plus QueryWrapper / Statistics XML.
 */
public interface TransactionRepositoryCustom {
    Page<Transaction> search(String userId, LocalDate from, LocalDate to,
                             Long accountId, Long categoryId, String type, Pageable pageable);

    List<TypeSum> sumByType(String userId, LocalDate from, LocalDate to);

    List<CategorySum> sumByCategory(String userId, LocalDate from, LocalDate to);

    List<DailyTypeSum> dailyTypeSum(String userId, LocalDate from, LocalDate to);

    record TypeSum(String type, BigDecimal amount) {
    }

    record CategorySum(Long categoryId, String categoryName, String type, BigDecimal amount) {
    }

    record DailyTypeSum(LocalDate date, String type, BigDecimal amount) {
    }
}
