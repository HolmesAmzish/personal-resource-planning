package cn.arorms.prp.plan.repositories;

import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.stereotype.Repository;

import static cn.arorms.prp.plan.entities.QProject.project;

/**
 * QueryDSL implementation for project order-index shifting
 * (replaces the former JPQL @Modifying @Query methods).
 */
@Repository
public class ProjectRepositoryCustomImpl implements ProjectRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    public ProjectRepositoryCustomImpl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }

    @Override
    public void shiftForward(int start, int end, String userId) {
        queryFactory.update(project)
                .set(project.orderIndex, project.orderIndex.add(1))
                .where(project.orderIndex.goe(start)
                        .and(project.orderIndex.loe(end))
                        .and(project.userId.eq(userId)))
                .execute();
    }

    @Override
    public void shiftBackward(int start, int end, String userId) {
        queryFactory.update(project)
                .set(project.orderIndex, project.orderIndex.subtract(1))
                .where(project.orderIndex.goe(start)
                        .and(project.orderIndex.loe(end))
                        .and(project.userId.eq(userId)))
                .execute();
    }
}
