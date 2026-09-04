package cn.arorms.prp.finance.repositories;

import cn.arorms.prp.finance.entities.Category;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.stereotype.Repository;

import java.util.List;

import static cn.arorms.prp.finance.entities.QCategory.category;

/**
 * QueryDSL implementation for system presets (userId NULL) plus own rows
 * (replaces the former JPQL @Query method ported from MyBatis XML).
 */
@Repository
public class CategoryRepositoryCustomImpl implements CategoryRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    public CategoryRepositoryCustomImpl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }

    @Override
    public List<Category> findVisible(String userId, String type) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(category.userId.isNull().or(category.userId.eq(userId)));
        if (type != null) builder.and(category.type.eq(type));

        return queryFactory.selectFrom(category)
                .where(builder)
                .orderBy(category.sortOrder.asc(), category.id.asc())
                .fetch();
    }
}
