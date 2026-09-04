package cn.arorms.prp.finance.repositories;

import cn.arorms.prp.finance.entities.Category;

import java.util.List;

/**
 * QueryDSL fragment replacing the visible-categories XML.
 */
public interface CategoryRepositoryCustom {
    List<Category> findVisible(String userId, String type);
}
