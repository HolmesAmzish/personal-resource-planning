package cn.arorms.prp.finance.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

/**
 * Income/expense classifier. userId NULL means system preset (immutable).
 * Migrated from personal-financial-management Category PO to JPA + PostgreSQL.
 */
@Entity @Table(name = "categories")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    @Comment("NULL means system preset")
    private String userId;

    @Column(name = "name", nullable = false, length = 64)
    private String name;

    @Column(name = "type", length = 16)
    @Comment("INCOME/EXPENSE")
    private String type;

    @Column(name = "icon", length = 32)
    private String icon;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 50;

    @Column(name = "is_system")
    @Builder.Default
    private Integer isSystem = 0;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (sortOrder == null) sortOrder = 50;
        if (isSystem == null) isSystem = 0;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
