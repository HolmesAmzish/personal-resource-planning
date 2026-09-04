package cn.arorms.prp.finance.repositories;

import cn.arorms.prp.finance.entities.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long>, AccountRepositoryCustom {
    Page<Account> findByUserId(String userId, Pageable pageable);

    Optional<Account> findByIdAndUserId(Long id, String userId);

    boolean existsByIdAndUserId(Long id, String userId);

    List<Account> findByUserIdOrderByBalanceDesc(String userId);
}
