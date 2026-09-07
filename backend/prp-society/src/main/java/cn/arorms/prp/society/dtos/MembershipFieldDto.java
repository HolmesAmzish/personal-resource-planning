package cn.arorms.prp.society.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MembershipFieldDto {
    @NotBlank
    @Size(max = 64)
    @Pattern(regexp = "^[A-Za-z][A-Za-z0-9_]*$", message = "must start with a letter and contain letters, numbers or underscores")
    private String fieldKey;

    @NotBlank
    private String fieldName;

    @Size(max = 255)
    private String fieldValue;

    private Integer sortOrder;
}
