package cn.arorms.prp.finance.repositories;

import cn.arorms.prp.finance.entities.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByIdAndUserId(Long id, String userId);

    boolean existsByIdAndUserId(Long id, String userId);

    /** Filtered list, replaces MyBatis-Plus QueryWrapper in TransactionServiceImpl. */
    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId " +
            "AND (:from IS NULL OR t.occurredOn >= :from) " +
            "AND (:to IS NULL OR t.occurredOn <= :to) " +
            "AND (:accountId IS NULL OR t.fromAccountId = :accountId OR t.toAccountId = :accountId) " +
            "AND (:categoryId IS NULL OR t.categoryId = :categoryId) " +
            "AND (:type IS NULL OR t.type = :type)")
    Page<Transaction> search(@Param("userId") String userId,
                             @Param("from") LocalDate from,
                             @Param("to") LocalDate to,
                             @Param("accountId") Long accountId,
                             @Param("categoryId") Long categoryId,
                             @Param("type") String type,
                             Pageable pageable);

    /** Replaces StatisticsMapper.sumByType XML (hard delete now, no is_deleted). */
    @Query("SELECT t.type AS type, COALESCE(SUM(t.amount), 0) AS amount FROM Transaction t " +
            "WHERE t.userId = :userId AND t.occurredOn BETWEEN :from AND :to GROUP BY t.type")
    List<TypeSum> sumByType(@Param("userId") String userId,
                            @Param("from") LocalDate from,
                            @Param("to") LocalDate to);

    /** Replaces StatisticsMapper.sumByCategory XML (LEFT JOIN for transfers with NULL category). */
    @Query("SELECT t.categoryId AS categoryId, c.name AS categoryName, t.type AS type, " +
            "COALESCE(SUM(t.amount), 0) AS amount FROM Transaction t " +
            "LEFT JOIN Category c ON c.id = t.categoryId " +
            "WHERE t.userId = :userId AND t.occurredOn BETWEEN :from AND :to " +
            "GROUP BY t.categoryId, c.name, t.type ORDER BY SUM(t.amount) DESC")
    List<CategorySum> sumByCategory(@Param("userId") String userId,
                                    @Param("from") LocalDate from,
                                    @Param("to") LocalDate to);

    /** Replaces StatisticsMapper.dailyTypeSum XML (INCOME/EXPENSE only, TRANSFER excluded). */
    @Query("SELECT t.occurredOn AS date, t.type AS type, COALESCE(SUM(t.amount), 0) AS amount " +
            "FROM Transaction t WHERE t.userId = :userId AND t.occurredOn BETWEEN :from AND :to " +
            "AND t.type IN ('INCOME', 'EXPENSE') GROUP BY t.occurredOn, t.type ORDER BY t.occurredOn")
    List<DailyTypeSum> dailyTypeSum(@Param("userId") String userId,
                                    @Param("from") LocalDate from,
                                    @Param("to") LocalDate to);

    interface TypeSum {
        String getType();
        java.math.BigDecimal getAmount();
    }

    interface CategorySum {
        Long getCategoryId();
        String getCategoryName();
        String getType();
        java.math.BigDecimal getAmount();
    }

    interface DailyTypeSum {
        LocalDate getDate();
        String getType();
        java.math.BigDecimal getAmount();
    }
}
