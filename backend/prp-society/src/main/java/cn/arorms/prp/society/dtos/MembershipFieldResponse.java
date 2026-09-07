package cn.arorms.prp.society.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MembershipFieldResponse {
    private Long id;
    private Long organizationId;
    private String organizationName;
    private String fieldKey;
    private String fieldName;
    private String fieldValue;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
