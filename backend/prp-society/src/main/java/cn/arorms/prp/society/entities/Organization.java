package cn.arorms.prp.society.entities;

import cn.arorms.prp.common.entities.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Organization. Keeps its identity information directly on this table.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "organizations")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Organization extends BaseEntity {

    @Column(name = "display_name", nullable = false, length = 128)
    private String displayName;

    @Column(name = "identity_code", length = 64)
    private String identityCode;

    @Column(length = 255)
    private String address;

    @Column(length = 128)
    private String website;
}
