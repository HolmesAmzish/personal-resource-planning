package cn.arorms.prp.society.repositories;

import cn.arorms.prp.society.entities.Contact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ContactRepository extends JpaRepository<Contact, Long> {
    Optional<Contact> findByIdAndParty_UserId(Long id, String userId);

    @Query("""
        select c from Contact c
        where c.party.userId = :userId
          and (:partyId is null or c.party.id = :partyId)
          and (:contactType is null or c.contactType = :contactType)
          and (:q is null or lower(c.content) like lower(concat('%', :q, '%'))
              or lower(c.party.name) like lower(concat('%', :q, '%')))
        """)
    Page<Contact> search(
            @Param("userId") String userId,
            @Param("partyId") Long partyId,
            @Param("contactType") cn.arorms.prp.society.enums.ContactType contactType,
            @Param("q") String q,
            Pageable pageable
    );
}
