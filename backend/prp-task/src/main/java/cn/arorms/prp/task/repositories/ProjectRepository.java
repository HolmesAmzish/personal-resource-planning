package cn.arorms.prp.task.repositories;

import cn.arorms.prp.task.entities.Project;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByUserId(String userId, Sort sort);

    Optional<Project> findByIdAndUserId(Long id, String userId);

    Boolean existsByIdAndUserId(Long id, String userId);

    @Modifying
    @Query("UPDATE Project p SET p.orderIndex = p.orderIndex + 1 " +
            "WHERE p.orderIndex >= :start AND p.orderIndex <= :end AND p.userId = :userId")
    void shiftForward(int start, int end, String userId);

    @Modifying
    @Query("UPDATE Project p SET p.orderIndex = p.orderIndex - 1 " +
            "WHERE p.orderIndex >= :start AND p.orderIndex <= :end AND p.userId = :userId")
    void shiftBackward(int start, int end, String userId);

    int countByUserId(String userId);
}
