package cn.arorms.prp.finance.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryDto {
    @NotBlank @Size(max = 64) private String name;
    @NotBlank private String type;
    @Size(max = 32) private String icon;
    private Integer sortOrder;
}
