package cn.arorms.prp.society.repositories;

import cn.arorms.prp.society.entities.Membership;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MembershipRepository extends JpaRepository<Membership, Long> {
    @Query("""
        select m from Membership m
        join m.person p
        join m.organization o
        where p.userId = :userId and o.userId = :userId
          and (:personId is null or p.id = :personId)
          and (:organizationId is null or o.id = :organizationId)
          and (:q is null or lower(p.name) like lower(concat('%', :q, '%'))
              or lower(o.name) like lower(concat('%', :q, '%'))
              or lower(m.note) like lower(concat('%', :q, '%')))
        """)
    Page<Membership> search(
            @Param("userId") String userId,
            @Param("personId") Long personId,
            @Param("organizationId") Long organizationId,
            @Param("q") String q,
            Pageable pageable
    );

    Optional<Membership> findWithRelationsById(Long id);

    void deleteAllByPerson_Id(Long personId);

    void deleteAllByOrganization_Id(Long organizationId);
}
