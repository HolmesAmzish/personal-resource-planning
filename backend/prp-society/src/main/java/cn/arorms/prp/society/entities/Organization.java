package cn.arorms.prp.society.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Organization. Keeps its identity information directly on this table.
 * @version 0.1.0 2026-09-04
 * @author cacc
 * @since 2026-09-03
 */
@Getter @Setter
@NoArgsConstructor
@Entity @Table(name = "organizations")
@DiscriminatorValue("ORGANIZATION")
@PrimaryKeyJoinColumn(name = "id")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Organization extends Party {

    @Column(length = 128)
    private String website;
}
