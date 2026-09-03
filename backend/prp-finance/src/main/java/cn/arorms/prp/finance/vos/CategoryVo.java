package cn.arorms.prp.finance.vos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CategoryVo {
    private Long id;
    private String userId;
    private String name;
    private String type;
    private String icon;
    private Integer sortOrder;
    private Integer isSystem;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
