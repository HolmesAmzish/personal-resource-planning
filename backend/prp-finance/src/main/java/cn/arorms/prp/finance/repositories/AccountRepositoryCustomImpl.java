package cn.arorms.prp.finance.repositories;

import cn.arorms.prp.finance.entities.Account;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

import static cn.arorms.prp.finance.entities.QAccount.account;

/**
 * QueryDSL implementations for atomic balance adjustment and per-currency totals
 * (replaces the former JPQL @Query methods ported from MyBatis XML).
 */
@Repository
public class AccountRepositoryCustomImpl implements AccountRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    public AccountRepositoryCustomImpl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }

    @Override
    public void updateBalance(Long id, BigDecimal delta) {
        queryFactory.update(account)
                .set(account.balance, account.balance.add(delta))
                .where(account.id.eq(id))
                .execute();
    }

    @Override
    public List<CurrencyTotal> sumByCurrency(String userId) {
        return queryFactory.select(Projections.constructor(CurrencyTotal.class,
                        account.currency,
                        account.balance.sum().coalesce(BigDecimal.ZERO)))
                .from(account)
                .where(account.userId.eq(userId))
                .groupBy(account.currency)
                .fetch();
    }
}
