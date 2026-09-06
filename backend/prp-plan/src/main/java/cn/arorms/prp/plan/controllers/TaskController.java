package cn.arorms.prp.plan.controllers;

import cn.arorms.framework.security.UserPrincipal;
import cn.arorms.prp.plan.entities.Task;
import cn.arorms.prp.plan.enums.TaskStatus;
import cn.arorms.prp.plan.services.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * TaskController
 * @version 1.0 2026-09-03
 * @author Cacciatore
 */
@RestController
@RequestMapping("/api/task")
public class TaskController {
    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // Get all tasks with pagination
    @GetMapping
    public Page<Task> getAllTasks(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "projectId", required = false) Long projectId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        return taskService.getAllByUserId(pageable, userPrincipal.getId(), projectId);
    }

    @GetMapping("/deadline")
    public Page<Task> getAllTasksByDeadline(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        return taskService.getAllByDeadline(pageable, userPrincipal.getId());
    }

    // Get an entity detail by ID
    @GetMapping("/{id}")
    public Task getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id);
    }

    // Add a new entity
    @PostMapping("/add")
    public ResponseEntity<Task> addTask(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Task task
    ) {
        return ResponseEntity.ok(taskService.addTask(userPrincipal.getId(), task));
    }

    // Change status of an entity
    @PutMapping("/{id}/status")
    public ResponseEntity<Task> changeTaskStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestBody TaskStatus status
    ) {
        return ResponseEntity.ok(taskService.changeStatus(userPrincipal.getId(), id, status));
    }

    // Modify
    @PutMapping
    public ResponseEntity<Task> updateTask(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Task task
    ) {
        return ResponseEntity.ok(taskService.updateTask(userPrincipal.getId(), task));
    }

    // Delete an entity
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id
    ) {
        taskService.deleteTask(userPrincipal.getId(), id);
        return ResponseEntity.ok().build();
    }
}
