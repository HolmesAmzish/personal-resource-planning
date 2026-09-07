package cn.arorms.prp.society.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Map;

@Data
public class MembershipDto {
    @NotNull
    private Long personId;

    @NotNull
    private Long organizationId;

    @Size(max = 255)
    private String note;

    private Map<String, Object> extendJson;
}
