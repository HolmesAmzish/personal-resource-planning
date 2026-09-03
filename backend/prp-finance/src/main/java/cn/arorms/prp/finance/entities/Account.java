package cn.arorms.prp.finance.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Fund account entity.
 * Migrated from personal-financial-management Account PO (MyBatis-Plus + MySQL)
 * to JPA + PostgreSQL. DDL auto-created via hibernate ddl-auto, no Flyway.
 */
@Entity @Table(name = "accounts")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Account {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    @Comment("Created by")
    private String userId;

    @Column(name = "name", nullable = false, length = 64)
    private String name;

    @Column(name = "type", length = 16)
    @Comment("CASH/BANK/EWALLET/CREDIT/OTHER")
    private String type;

    @Column(name = "balance", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "currency", length = 3)
    @Builder.Default
    private String currency = "CNY";

    @Column(name = "note", length = 255)
    private String note;

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
        if (balance == null) balance = BigDecimal.ZERO;
        if (currency == null) currency = "CNY";
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
