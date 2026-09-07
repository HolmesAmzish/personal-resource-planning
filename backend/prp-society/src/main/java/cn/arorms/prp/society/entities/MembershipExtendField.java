package cn.arorms.prp.society.entities;

import cn.arorms.framework.common.domain.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Config schema for the dynamic identity fields of one membership type.
 *
 * <p>{@code organization} is nullable: a null value means the global default
 * schema for {@code membershipType}, while a non-null value is an override for
 * that specific organization.</p>
 * @version 0.1.0 2026-09-07
 * @author cacc
 * @since 2026-09-07
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "membership_extend_fields")
@JsonIgnoreProperties({"organization", "hibernateLazyInitializer", "handler"})
public class MembershipExtendField extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "field_key", nullable = false, length = 64)
    private String fieldKey;

    @Column(name = "field_name", nullable = false, comment = "Config field display name")
    private String fieldName;

    @Column(name = "field_value")
    private String fieldValue;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;
}
