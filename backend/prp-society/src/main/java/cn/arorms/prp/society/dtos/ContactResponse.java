package cn.arorms.prp.society.dtos;

import cn.arorms.prp.society.enums.ContactType;
import cn.arorms.prp.society.enums.PartyType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ContactResponse {
    private Long id;
    private Long partyId;
    private String partyName;
    private PartyType partyType;
    private ContactType contactType;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
