package cn.arorms.prp.society.repositories;

import cn.arorms.prp.society.entities.MembershipExtendField;
import cn.arorms.prp.society.entities.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MembershipFieldRepository extends JpaRepository<MembershipExtendField, Long> {
    List<MembershipExtendField> findByOrganization_IdOrderBySortOrderAscIdAsc(Long organizationId);

    List<MembershipExtendField> findByOrganization_UserIdOrderByOrganization_NameAscSortOrderAscIdAsc(String userId);

    Optional<MembershipExtendField> findByIdAndOrganization_UserId(Long id, String userId);

    boolean existsByOrganizationAndFieldKeyIgnoreCase(Organization organization, String fieldKey);

    boolean existsByOrganizationAndFieldKeyIgnoreCaseAndIdNot(Organization organization, String fieldKey, Long id);

    void deleteAllByOrganization_Id(Long organizationId);
}
