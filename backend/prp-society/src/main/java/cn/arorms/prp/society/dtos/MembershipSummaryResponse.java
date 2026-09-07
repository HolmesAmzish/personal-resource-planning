package cn.arorms.prp.society.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MembershipSummaryResponse {
    private Long id;
    private Long personId;
    private String personName;
    private Long organizationId;
    private String organizationName;
    private String note;
    private LocalDateTime createdAt;
}
