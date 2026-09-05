package cn.arorms.prp.society.entities;

import cn.arorms.prp.common.entities.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Natural person. Keeps its identity information directly on this table.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Person extends BaseEntity {

    @Column(name = "display_name", nullable = false, length = 128)
    private String displayName;

    @Column(name = "identity_type", length = 32)
    private String identityType;

    @Column(name = "identity_code", length = 64)
    private String identityCode;

    @Column(length = 16)
    private String gender;

    @Column(name = "birth_date")
    private LocalDate birthDate;
}
