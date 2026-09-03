package cn.arorms.prp.task.controllers;

import cn.arorms.framework.security.UserPrincipal;
import cn.arorms.prp.task.entities.Project;
import cn.arorms.prp.task.services.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ProjectController
 * @version 1.0 2026-09-03
 * @author Cacciatore
 */
@RestController @RequestMapping("/api/project")
public class ProjectController {
    private final ProjectService projectService;

    @Autowired
    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // Get all projects
    @GetMapping
    public List<Project> getAllProjects(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return projectService.getAllByUserId(userPrincipal.getId());
    }

    // Add a new project
    @PostMapping
    public ResponseEntity<Project> addProject(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Project project
    ) {
        return ResponseEntity.ok(projectService.addProject(userPrincipal.getId(), project));
    }

    // Change Order index
    @PutMapping("/updateOrder")
    public ResponseEntity<Project> updateOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Project project
    ) {
        return ResponseEntity.ok(projectService.updateProjectOrder(userPrincipal.getId(), project));
    }

    // Modify the project
    @PutMapping
    public ResponseEntity<Project> updateProject(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Project project
    ) {
        return ResponseEntity.ok(projectService.updateProject(userPrincipal.getId(), project));
    }

    // Delete the project
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id
    ) {
        projectService.deleteProject(userPrincipal.getId(), id);
        return ResponseEntity.ok().build();
    }
}
