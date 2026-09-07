package cn.arorms.prp.plan.repositories;

import cn.arorms.prp.plan.entities.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    @Query("""
            SELECT task FROM Task task
            WHERE task.userId = :userId
            ORDER BY CASE task.status
                         WHEN cn.arorms.prp.plan.enums.TaskStatus.PENDING THEN 0
                         WHEN cn.arorms.prp.plan.enums.TaskStatus.COMPLETED THEN 1
                         ELSE 2
                     END ASC,
                     task.createdAt DESC
            """)
    Page<Task> findByUserId(@Param("userId") String userId, Pageable pageable);

    @Query("""
            SELECT task FROM Task task
            WHERE task.userId = :userId AND task.project.id = :projectId
            ORDER BY CASE task.status
                         WHEN cn.arorms.prp.plan.enums.TaskStatus.PENDING THEN 0
                         WHEN cn.arorms.prp.plan.enums.TaskStatus.COMPLETED THEN 1
                         ELSE 2
                     END ASC,
                     task.createdAt DESC
            """)
    Page<Task> findByUserIdAndProject_Id(
            @Param("userId") String userId,
            @Param("projectId") Long projectId,
            Pageable pageable
    );

    Boolean existsByIdAndUserId(Long id, String userId);
    Optional<Task> findByIdAndUserId(Long id, String userId);

    Page<Task> findByUserIdAndDeadlineIsNotNull(String userId, Pageable pageable);
}
