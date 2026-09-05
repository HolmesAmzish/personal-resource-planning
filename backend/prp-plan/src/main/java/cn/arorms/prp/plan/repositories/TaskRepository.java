package cn.arorms.prp.plan.repositories;

import cn.arorms.prp.plan.entities.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    Page<Task> findByUserId(String userId, Pageable sortedPageable);
    Page<Task> findByUserIdAndProject_Id(String userId, Long projectId, Pageable sortedPageable);

    Boolean existsByIdAndUserId(Long id, String userId);
    Optional<Task> findByIdAndUserId(Long id, String userId);

    Page<Task> findByUserIdAndDeadlineIsNotNull(String userId, Pageable pageable);
}
