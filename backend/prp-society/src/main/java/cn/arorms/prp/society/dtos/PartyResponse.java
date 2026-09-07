package cn.arorms.prp.society.dtos;

import cn.arorms.prp.society.enums.PartyType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PartyResponse {
    private Long id;
    private PartyType partyType;
    private String name;
    private String identityCode;
    private String address;
    private String gender;
    private LocalDate birthDate;
    private String website;
    private List<ContactResponse> contacts;
    private List<MembershipSummaryResponse> memberships;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
