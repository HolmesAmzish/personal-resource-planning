package cn.arorms.prp.finance.repositories;

import cn.arorms.prp.finance.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    /** System presets (userId NULL) plus own rows, optional type filter. */
    @Query("SELECT c FROM Category c " +
            "WHERE (c.userId IS NULL OR c.userId = :userId) " +
            "AND (:type IS NULL OR c.type = :type) " +
            "ORDER BY c.sortOrder ASC, c.id ASC")
    List<Category> findVisible(@Param("userId") String userId, @Param("type") String type);

    Optional<Category> findByIdAndUserId(Long id, String userId);

    boolean existsByIdAndUserId(Long id, String userId);

    long countByUserIdIsNull();
}
