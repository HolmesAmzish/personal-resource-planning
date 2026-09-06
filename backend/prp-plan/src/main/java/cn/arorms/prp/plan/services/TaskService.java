package cn.arorms.prp.plan.services;

import cn.arorms.prp.plan.entities.Task;
import cn.arorms.prp.plan.enums.TaskStatus;
import cn.arorms.prp.plan.repositories.ProjectRepository;
import cn.arorms.prp.plan.repositories.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

/**
 * TaskService
 * @version 1.0 2026-09-03
 * @author Cacciatore
 */
@Service
public class TaskService {
    private static final Logger log = LoggerFactory.getLogger(TaskService.class);
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
    }

    public Page<Task> getAllByUserId(Pageable pageable, String userId, Long projectId) {
        Sort sort = Sort.by(Sort.Order.asc("status"),
                Sort.Order.desc("createdAt"));

        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                sort
        );

        if (projectId != null) {
            return taskRepository.findByUserIdAndProject_Id(userId, projectId, sortedPageable);
        }

        return taskRepository.findByUserId(userId, sortedPageable);
    }

    public Page<Task> getAllByDeadline(Pageable pageable, String userId) {
        Sort sort = Sort.by(Sort.Order.desc("deadline"),
                Sort.Order.desc("createdAt"));
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                sort
        );
        return taskRepository.findByUserIdAndDeadlineIsNotNull(userId, sortedPageable);
    }

    // Get by ID
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Task not found with ID: " + id));
    }

    // Create
    public Task addTask(String userId, Task task) {
        task.setUserId(userId);
        if (task.getProject() != null && task.getProject().getId() != null) {
            task.setProject(projectRepository.getReferenceById(task.getProject().getId()));
        }
        return taskRepository.save(task);
    }

    // Change status
    public Task changeStatus(String userId, Long id, TaskStatus status) {
        Task existingTask = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Can not found existing task."));
        existingTask.setStatus(status);
        return taskRepository.save(existingTask);
    }

    // Modify
    public Task updateTask(String userId, Task task) {
        if (!taskRepository.existsByIdAndUserId(task.getId(), userId)) {
            throw new NoSuchElementException("Can not found existing task.");
        }
        task.setUserId(userId);
        return taskRepository.save(task);
    }

    // Delete
    public void deleteTask(String userId, Long id) {
        Task existingTask = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Can not found existing task."));
        taskRepository.delete(existingTask);
    }
}
