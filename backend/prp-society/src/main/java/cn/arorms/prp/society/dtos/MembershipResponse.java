package cn.arorms.prp.society.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class MembershipResponse {
    private Long id;
    private Long personId;
    private String personName;
    private Long organizationId;
    private String organizationName;
    private String note;
    private Map<String, Object> extendJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
