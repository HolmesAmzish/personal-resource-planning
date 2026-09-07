package cn.arorms.prp.society.entities;

import cn.arorms.framework.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * @version 0.1.0 2026-09-07
 * @author cacc
 * @since 2026-09-07
 */
@Entity @Table(name = "parties")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "party_type", length = 20)
@Getter @Setter
public class Party extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private String userId;

    private String name;
    private String identityCode;
    private String address;

    @OneToMany(mappedBy = "party", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Contact> contacts = new ArrayList<>();
}
