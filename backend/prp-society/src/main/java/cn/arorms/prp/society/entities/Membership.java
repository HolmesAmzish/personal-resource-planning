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
 * A natural person's role inside an organization.
 *
 * <p>Typed common fields are kept here; role-specific fields live in
 * {@code extendJson} according to a {@link MembershipConfig} schema.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "memberships",
    indexes = {
        @Index(name = "idx_memberships_person", columnList = "person_id"),
        @Index(name = "idx_memberships_organization", columnList = "organization_id")
    }
)
@JsonIgnoreProperties({
    "person",
    "organization",
    "hibernateLazyInitializer",
    "handler"
})
public class Membership extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(length = 255)
    private String note;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "extend_json")
    private Map<String, Object> extendJson = new HashMap<>();
}
