package cn.arorms.prp.society.repositories;

import cn.arorms.prp.society.entities.Party;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PartyRepository extends JpaRepository<Party, Long> {
    Optional<Party> findByIdAndUserId(Long id, String userId);

    @Query("""
        select distinct p from Party p
        left join p.contacts c
        where p.userId = :userId
          and (:includePerson = false or exists (select 1 from Person sp where sp.id = p.id))
          and (:includeOrganization = false or exists (select 1 from Organization so where so.id = p.id))
          and (:q is null or lower(p.name) like lower(concat('%', :q, '%'))
              or lower(p.identityCode) like lower(concat('%', :q, '%'))
              or lower(p.address) like lower(concat('%', :q, '%'))
              or lower(c.content) like lower(concat('%', :q, '%')))
        """)
    Page<Party> search(
            @Param("userId") String userId,
            @Param("q") String q,
            @Param("includePerson") boolean includePerson,
            @Param("includeOrganization") boolean includeOrganization,
            Pageable pageable
    );
}
