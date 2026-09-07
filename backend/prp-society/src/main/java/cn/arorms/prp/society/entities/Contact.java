package cn.arorms.prp.society.entities;

import cn.arorms.framework.common.domain.BaseEntity;
import cn.arorms.prp.society.enums.ContactType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * @version 0.1.0 2026-09-07
 * @author cacc
 * @since 2026-09-07
 */
@Entity @Table(name = "contacts")
@Getter @Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Contact extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "party_id", nullable = false)
    private Party party;

    private ContactType contactType;
    @Column(length = 255)
    private String content;
}
