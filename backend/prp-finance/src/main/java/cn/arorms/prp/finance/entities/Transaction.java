package cn.arorms.prp.finance.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Ledger line. Account/category references are plain IDs (no FK relations)
 * to preserve TRANSFER semantics and nullable category.
 * Migrated from personal-financial-management Transaction PO to JPA + PostgreSQL.
 */
@Entity @Table(name = "transactions")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Transaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    @Comment("Created by")
    private String userId;

    @Column(name = "from_account_id")
    @Comment("Source account for EXPENSE/TRANSFER")
    private Long fromAccountId;

    @Column(name = "to_account_id")
    @Comment("Target account for INCOME/TRANSFER")
    private Long toAccountId;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "type", nullable = false, length = 16)
    @Comment("INCOME/EXPENSE/TRANSFER")
    private String type;

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "occurred_on", nullable = false)
    private LocalDate occurredOn;

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
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
