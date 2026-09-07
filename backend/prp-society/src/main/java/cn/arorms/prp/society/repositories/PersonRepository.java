package cn.arorms.prp.society.repositories;

import cn.arorms.prp.society.entities.Person;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PersonRepository extends JpaRepository<Person, Long> {
    Optional<Person> findByIdAndUserId(Long id, String userId);
}
