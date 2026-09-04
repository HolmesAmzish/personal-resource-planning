package cn.arorms.prp.finance.repositories;

import cn.arorms.prp.finance.entities.Category;
import cn.arorms.prp.finance.entities.Transaction;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static cn.arorms.prp.finance.entities.QCategory.category;
import static cn.arorms.prp.finance.entities.QTransaction.transaction;

/**
 * QueryDSL implementations for transaction search and statistics aggregation
 * (replaces the former JPQL @Query methods ported from MyBatis XML).
 */
@Repository
public class TransactionRepositoryCustomImpl implements TransactionRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    public TransactionRepositoryCustomImpl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }

    @Override
    public Page<Transaction> search(String userId, LocalDate from, LocalDate to,
                                     Long accountId, Long categoryId, String type, Pageable pageable) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(transaction.userId.eq(userId));
        if (from != null) builder.and(transaction.occurredOn.goe(from));
        if (to != null) builder.and(transaction.occurredOn.loe(to));
        if (accountId != null) {
            builder.and(transaction.fromAccountId.eq(accountId)
                    .or(transaction.toAccountId.eq(accountId)));
        }
        if (categoryId != null) builder.and(transaction.categoryId.eq(categoryId));
        if (type != null) builder.and(transaction.type.eq(type));

        List<Transaction> content = queryFactory.selectFrom(transaction)
                .where(builder)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .orderBy(transaction.occurredOn.desc(), transaction.id.desc())
                .fetch();

        return PageableExecutionUtils.getPage(content, pageable,
                () -> queryFactory.select(transaction.count())
                        .from(transaction)
                        .where(builder)
                        .fetchOne());
    }

    @Override
    public List<TypeSum> sumByType(String userId, LocalDate from, LocalDate to) {
        return queryFactory.select(Projections.constructor(TypeSum.class,
                        transaction.type,
                        transaction.amount.sum().coalesce(BigDecimal.ZERO)))
                .from(transaction)
                .where(dateRange(userId, from, to))
                .groupBy(transaction.type)
                .fetch();
    }

    @Override
    public List<CategorySum> sumByCategory(String userId, LocalDate from, LocalDate to) {
        return queryFactory.select(Projections.constructor(CategorySum.class,
                        transaction.categoryId,
                        category.name,
                        transaction.type,
                        transaction.amount.sum().coalesce(BigDecimal.ZERO)))
                .from(transaction)
                .leftJoin(category).on(category.id.eq(transaction.categoryId))
                .where(dateRange(userId, from, to))
                .groupBy(transaction.categoryId, category.name, transaction.type)
                .orderBy(transaction.amount.sum().desc())
                .fetch();
    }

    @Override
    public List<DailyTypeSum> dailyTypeSum(String userId, LocalDate from, LocalDate to) {
        return queryFactory.select(Projections.constructor(DailyTypeSum.class,
                        transaction.occurredOn,
                        transaction.type,
                        transaction.amount.sum().coalesce(BigDecimal.ZERO)))
                .from(transaction)
                .where(dateRange(userId, from, to)
                        .and(transaction.type.in("INCOME", "EXPENSE")))
                .groupBy(transaction.occurredOn, transaction.type)
                .orderBy(transaction.occurredOn.asc())
                .fetch();
    }

    private BooleanExpression dateRange(String userId, LocalDate from, LocalDate to) {
        return transaction.userId.eq(userId).and(transaction.occurredOn.between(from, to));
    }
}
