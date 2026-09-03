package cn.arorms.prp.finance.repositories;

import cn.arorms.prp.finance.entities.TransactionPreset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionPresetRepository extends JpaRepository<TransactionPreset, Long> {
    List<TransactionPreset> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<TransactionPreset> findByIdAndUserId(Long id, String userId);

    boolean existsByIdAndUserId(Long id, String userId);
}
