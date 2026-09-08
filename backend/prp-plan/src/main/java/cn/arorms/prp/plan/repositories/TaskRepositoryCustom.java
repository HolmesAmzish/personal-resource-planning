package cn.arorms.prp.plan.repositories;

import cn.arorms.prp.plan.entities.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TaskRepositoryCustom {
    Page<Task> search(String userId, Long projectId, Pageable pageable);
}
