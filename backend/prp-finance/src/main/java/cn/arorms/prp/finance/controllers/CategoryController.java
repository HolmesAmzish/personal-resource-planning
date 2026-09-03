package cn.arorms.prp.finance.controllers;

import cn.arorms.framework.security.UserPrincipal;
import cn.arorms.prp.finance.dtos.CategoryDto;
import cn.arorms.prp.finance.services.CategoryService;
import cn.arorms.prp.finance.vos.CategoryVo;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService categoryService;

    @Autowired
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryVo>> list(@AuthenticationPrincipal UserPrincipal user,
                                                 @RequestParam(required = false) String type) {
        return ResponseEntity.ok(categoryService.list(user.getId(), type));
    }

    @PostMapping
    public ResponseEntity<Long> create(@AuthenticationPrincipal UserPrincipal user,
                                       @Valid @RequestBody CategoryDto req) {
        return ResponseEntity.ok(categoryService.create(user.getId(), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@AuthenticationPrincipal UserPrincipal user,
                                       @PathVariable Long id,
                                       @Valid @RequestBody CategoryDto req) {
        categoryService.update(user.getId(), id, req);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal user,
                                       @PathVariable Long id) {
        categoryService.delete(user.getId(), id);
        return ResponseEntity.ok().build();
    }
}
