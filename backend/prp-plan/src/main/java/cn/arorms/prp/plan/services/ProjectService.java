package cn.arorms.prp.plan.services;

import cn.arorms.prp.plan.entities.Project;
import cn.arorms.prp.plan.repositories.ProjectRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * ProjectService
 * @version 1.0 2026-09-03
 * @author Cacciatore
 */
@Service
public class ProjectService {
    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public List<Project> getAllByUserId(String userId) {
        Sort sort = Sort.by(Sort.Direction.DESC, "orderIndex");
        return projectRepository.findByUserId(userId, sort);
    }

    public Project addProject(String userId, Project project) {
        // Check project id to prevent update wrongly
        if (project.getId() != null) {
            throw new IllegalArgumentException("New project cannot have an ID!");
        }

        // Set user
        project.setUserId(userId);

        // Set project order index for ui
        int count = projectRepository.countByUserId(userId);
        project.setOrderIndex(count);

        return projectRepository.save(project);
    }

    public Project updateProject(String userId, Project project) {
        if (!projectRepository.existsByIdAndUserId(project.getId(), userId)) {
            throw new NoSuchElementException("Can not found existing project");
        }
        project.setUserId(userId);
        return projectRepository.save(project);
    }

    @Transactional
    public Project updateProjectOrder(String userId, Project project) {

        int originalOrderIndex = projectRepository.findByIdAndUserId(project.getId(), userId)
                .map(Project::getOrderIndex)
                .orElseThrow(() -> new NoSuchElementException("Can not found existing project with id: " + project.getId()));

        int changedOrderIndex = project.getOrderIndex();

        // Shift related project order index before update the target project.
        if (originalOrderIndex < changedOrderIndex) {
            projectRepository.shiftBackward(originalOrderIndex + 1, changedOrderIndex, userId);
        } else {
            projectRepository.shiftForward(changedOrderIndex, originalOrderIndex - 1, userId);
        }

        return projectRepository.save(project);
    }

    public void deleteProject(String userId, Long id) {
        Project project = projectRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Project not found with ID: " + id));
        projectRepository.delete(project);
    }
}
