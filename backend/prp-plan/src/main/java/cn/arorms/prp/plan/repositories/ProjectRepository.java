package cn.arorms.prp.plan.repositories;

import cn.arorms.prp.plan.entities.Project;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long>, ProjectRepositoryCustom {

    List<Project> findByUserId(String userId, Sort sort);

    Optional<Project> findByIdAndUserId(Long id, String userId);

    Boolean existsByIdAndUserId(Long id, String userId);

    int countByUserId(String userId);
}
