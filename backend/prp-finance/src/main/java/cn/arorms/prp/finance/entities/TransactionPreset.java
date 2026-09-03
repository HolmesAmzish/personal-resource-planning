package cn.arorms.prp.finance.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Reusable transaction template ("quick card"). No occurrence date —
 * the date defaults to today when applied.
 * Migrated from personal-financial-management TransactionPreset PO to JPA + PostgreSQL.
 */
@Entity @Table(name = "transaction_presets")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TransactionPreset {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    @Comment("Created by")
    private String userId;

    @Column(name = "type", length = 16)
    @Comment("INCOME/EXPENSE/TRANSFER")
    private String type;

    @Column(name = "amount", precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "from_account_id")
    private Long fromAccountId;

    @Column(name = "to_account_id")
    private Long toAccountId;

    @Column(name = "category_id")
    private Long categoryId;

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
