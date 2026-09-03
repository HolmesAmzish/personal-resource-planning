package cn.arorms.prp.finance.repositories;

import cn.arorms.prp.finance.entities.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    Page<Account> findByUserId(String userId, Pageable pageable);

    Optional<Account> findByIdAndUserId(Long id, String userId);

    boolean existsByIdAndUserId(Long id, String userId);

    List<Account> findByUserIdOrderByBalanceDesc(String userId);

    /** Atomic balance adjustment, replaces MyBatis-Plus updateBalance XML. */
    @Modifying
    @Query("UPDATE Account a SET a.balance = a.balance + :delta WHERE a.id = :id")
    void updateBalance(@Param("id") Long id, @Param("delta") BigDecimal delta);

    /** Per-currency totals, replaces AccountMapper.sumByCurrency XML. */
    @Query("SELECT a.currency AS currency, COALESCE(SUM(a.balance), 0) AS total " +
            "FROM Account a WHERE a.userId = :userId GROUP BY a.currency")
    List<CurrencyTotal> sumByCurrency(@Param("userId") String userId);

    interface CurrencyTotal {
        String getCurrency();
        BigDecimal getTotal();
    }
}
