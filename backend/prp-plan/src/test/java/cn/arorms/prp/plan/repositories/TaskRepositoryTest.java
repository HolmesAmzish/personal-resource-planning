package cn.arorms.prp.plan.repositories;

import cn.arorms.prp.common.configs.QueryDslConfig;
import cn.arorms.prp.plan.entities.Task;
import cn.arorms.prp.plan.enums.TaskStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
@Import(QueryDslConfig.class)
class TaskRepositoryTest {
    @Autowired
    private TaskRepository taskRepository;

    @Test
    void ordersActiveTasksBeforeCompletedAndCancelled() {
        taskRepository.save(Task.builder().userId("user")
                .title("completed").status(TaskStatus.COMPLETED)
                .createdAt(LocalDateTime.of(2026, 9, 2, 10, 0)).build());
        taskRepository.save(Task.builder().userId("user")
                .title("cancelled").status(TaskStatus.CANCELLED)
                .createdAt(LocalDateTime.of(2026, 9, 3, 10, 0)).build());
        taskRepository.save(Task.builder().userId("user")
                .title("pending-new").status(TaskStatus.PENDING)
                .createdAt(LocalDateTime.of(2026, 9, 4, 10, 0)).build());
        taskRepository.save(Task.builder().userId("user")
                .title("pending-old").status(TaskStatus.PENDING)
                .createdAt(LocalDateTime.of(2026, 9, 1, 10, 0)).build());

        Page<Task> page = taskRepository.findByUserId("user", Pageable.ofSize(10).withPage(0));
        List<String> titles = page.getContent().stream().map(Task::getTitle).toList();

        assertEquals(List.of("pending-new", "pending-old", "completed", "cancelled"), titles);
    }

}
