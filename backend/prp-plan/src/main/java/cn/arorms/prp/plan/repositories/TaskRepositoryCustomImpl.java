package cn.arorms.prp.plan.repositories;

import cn.arorms.prp.plan.entities.Task;
import cn.arorms.prp.plan.enums.TaskStatus;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Repository;

import java.util.List;

import static cn.arorms.prp.plan.entities.QTask.task;

@Repository
public class TaskRepositoryCustomImpl implements TaskRepositoryCustom {
    private final JPAQueryFactory queryFactory;

    public TaskRepositoryCustomImpl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }

    @Override
    public Page<Task> search(String userId, Long projectId, Pageable pageable) {
        BooleanBuilder where = new BooleanBuilder(task.userId.eq(userId));
        if (projectId != null) {
            where.and(task.project.id.eq(projectId));
        }

        Pageable normalizedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        List<Task> content = queryFactory.selectFrom(task)
                .where(where)
                .offset(normalizedPageable.getOffset())
                .limit(normalizedPageable.getPageSize())
                .orderBy(statusRank().asc(), task.createdAt.desc())
                .fetch();

        return PageableExecutionUtils.getPage(content, normalizedPageable,
                () -> queryFactory.select(task.count())
                        .from(task)
                        .where(where)
                        .fetchOne());
    }

    private NumberExpression<Integer> statusRank() {
        return new CaseBuilder()
                .when(task.status.eq(TaskStatus.PENDING)).then(0)
                .when(task.status.eq(TaskStatus.COMPLETED)).then(1)
                .otherwise(2);
    }
}
