package cn.arorms.prp.society.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Natural person. Keeps its identity information directly on this table.
 * @version 0.1.0 2026-09-07
 * @author cacc
 * @since 2026-09-07
 */
@Getter @Setter
@NoArgsConstructor
@Entity @Table(name = "persons")
@DiscriminatorValue("PERSON")
@PrimaryKeyJoinColumn(name = "id")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Person extends Party {

    @Column(length = 16)
    private String gender;

    @Column(name = "birth_date")
    private LocalDate birthDate;
}
