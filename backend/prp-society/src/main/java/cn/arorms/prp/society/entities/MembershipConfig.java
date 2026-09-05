package cn.arorms.prp.society.entities;

import cn.arorms.prp.common.entities.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashMap;
import java.util.Map;

/**
 * Config schema for the dynamic identity fields of one membership type.
 *
 * <p>{@code organization} is nullable: a null value means the global default
 * schema for {@code membershipType}, while a non-null value is an override for
 * that specific organization.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "membership_configs",
    indexes = {
        @Index(name = "idx_membership_configs_type", columnList = "membership_type"),
        @Index(name = "idx_membership_configs_org", columnList = "organization_id")
    }
)
@JsonIgnoreProperties({"organization", "hibernateLazyInitializer", "handler"})
public class MembershipConfig extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @Column(name = "field_key", nullable = false, length = 64)
    private String fieldKey;

    @Column(name = "field_label", nullable = false, length = 128)
    private String fieldLabel;

    @Column(nullable = false)
    private boolean required;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;
}
