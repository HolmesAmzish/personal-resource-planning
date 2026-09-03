package cn.arorms.prp.finance.services;

import cn.arorms.prp.finance.dtos.CategoryDto;
import cn.arorms.prp.finance.entities.Category;
import cn.arorms.prp.finance.repositories.CategoryRepository;
import cn.arorms.prp.finance.vos.CategoryVo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * CategoryService — ported from PFM CategoryServiceImpl to JPA.
 * System presets (userId NULL) are visible to all but immutable.
 */
@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryVo> list(String userId, String type) {
        String t = (type == null || type.isBlank()) ? null : type;
        return categoryRepository.findVisible(userId, t).stream().map(this::toVo).toList();
    }

    public Long create(String userId, CategoryDto req) {
        Category c = Category.builder()
                .userId(userId)
                .name(req.getName())
                .type(req.getType())
                .icon(req.getIcon())
                .sortOrder(req.getSortOrder() == null ? 50 : req.getSortOrder())
                .isSystem(0)
                .build();
        return categoryRepository.save(c).getId();
    }

    public void update(String userId, Long id, CategoryDto req) {
        Category c = mustOwn(userId, id);
        c.setName(req.getName());
        c.setIcon(req.getIcon());
        c.setSortOrder(req.getSortOrder());
        categoryRepository.save(c);
    }

    public void delete(String userId, Long id) {
        Category c = mustOwn(userId, id);
        categoryRepository.delete(c);
    }

    private Category mustOwn(String userId, Long id) {
        Category c = categoryRepository.findById(id).orElse(null);
        if (c == null || c.getUserId() == null || !userId.equals(c.getUserId())) {
            throw new NoSuchElementException("分类不存在或不可改");
        }
        return c;
    }

    private CategoryVo toVo(Category c) {
        CategoryVo vo = new CategoryVo();
        vo.setId(c.getId());
        vo.setUserId(c.getUserId());
        vo.setName(c.getName());
        vo.setType(c.getType());
        vo.setIcon(c.getIcon());
        vo.setSortOrder(c.getSortOrder());
        vo.setIsSystem(c.getIsSystem());
        vo.setCreatedAt(c.getCreatedAt());
        vo.setUpdatedAt(c.getUpdatedAt());
        return vo;
    }
}
