package cn.arorms.prp.society.repositories;

import cn.arorms.prp.society.entities.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findByIdAndUserId(Long id, String userId);
}
