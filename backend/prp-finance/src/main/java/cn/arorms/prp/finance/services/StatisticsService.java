package cn.arorms.prp.finance.services;

import cn.arorms.prp.finance.repositories.AccountRepository;
import cn.arorms.prp.finance.repositories.TransactionRepository;
import cn.arorms.prp.finance.vos.AccountBalanceVo;
import cn.arorms.prp.finance.vos.CategoryBreakdownVo;
import cn.arorms.prp.finance.vos.SummaryVo;
import cn.arorms.prp.finance.vos.TrendPointVo;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * StatisticsService — ported from PFM StatisticsServiceImpl.
 * SQL moved from MyBatis XML to JPQL in TransactionRepository.
 */
@Service
public class StatisticsService {
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public StatisticsService(TransactionRepository transactionRepository,
                             AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    public SummaryVo summary(String userId, LocalDate from, LocalDate to) {
        validateRange(from, to);
        Map<String, BigDecimal> typeSum = transactionRepository.sumByType(userId, from, to).stream()
                .collect(Collectors.toMap(TransactionRepository.TypeSum::getType,
                        r -> r.getAmount() == null ? BigDecimal.ZERO : r.getAmount()));
        BigDecimal income = typeSum.getOrDefault("INCOME", BigDecimal.ZERO);
        BigDecimal expense = typeSum.getOrDefault("EXPENSE", BigDecimal.ZERO);
        List<CategoryBreakdownVo> byCat = transactionRepository.sumByCategory(userId, from, to).stream()
                .map(r -> new CategoryBreakdownVo(r.getCategoryId(), r.getCategoryName(),
                        r.getType(), r.getAmount() == null ? BigDecimal.ZERO : r.getAmount()))
                .toList();
        return new SummaryVo(income, expense, income.subtract(expense), byCat);
    }

    public List<TrendPointVo> trend(String userId, LocalDate from, LocalDate to, String unit) {
        validateRange(from, to);
        String u = unit == null ? "day" : unit;
        if (!Set.of("day", "week", "month").contains(u)) {
            throw new IllegalArgumentException("unit 仅支持 day/week/month");
        }

        Map<LocalDate, Map<String, BigDecimal>> daily = transactionRepository
                .dailyTypeSum(userId, from, to).stream()
                .collect(Collectors.groupingBy(TransactionRepository.DailyTypeSum::getDate,
                        Collectors.toMap(TransactionRepository.DailyTypeSum::getType,
                                r -> r.getAmount() == null ? BigDecimal.ZERO : r.getAmount(),
                                BigDecimal::add)));

        Map<LocalDate, BigDecimal[]> buckets = new LinkedHashMap<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            LocalDate key = bucketStart(d, u);
            BigDecimal[] acc = buckets.computeIfAbsent(key,
                    k -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            Map<String, BigDecimal> sums = daily.get(d);
            if (sums != null) {
                acc[0] = acc[0].add(sums.getOrDefault("INCOME", BigDecimal.ZERO));
                acc[1] = acc[1].add(sums.getOrDefault("EXPENSE", BigDecimal.ZERO));
            }
        }

        List<TrendPointVo> result = new ArrayList<>(buckets.size());
        for (Map.Entry<LocalDate, BigDecimal[]> e : buckets.entrySet()) {
            result.add(new TrendPointVo(e.getKey().toString(), e.getValue()[0], e.getValue()[1]));
        }
        return result;
    }

    public List<AccountBalanceVo> accountBalances(String userId) {
        return accountRepository.findByUserIdOrderByBalanceDesc(userId).stream()
                .map(a -> new AccountBalanceVo(a.getId(), a.getName(), a.getCurrency(), a.getBalance()))
                .toList();
    }

    private void validateRange(LocalDate from, LocalDate to) {
        if (from == null || to == null || from.isAfter(to)) {
            throw new IllegalArgumentException("时间范围无效：from 不能晚于 to");
        }
    }

    private LocalDate bucketStart(LocalDate date, String unit) {
        return switch (unit) {
            case "month" -> date.withDayOfMonth(1);
            case "week" -> date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            default -> date;
        };
    }
}
