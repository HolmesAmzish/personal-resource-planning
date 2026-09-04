package cn.arorms.prp.finance;

import cn.arorms.prp.common.configs.QueryDslConfig;
import cn.arorms.prp.finance.dtos.AccountDto;
import cn.arorms.prp.finance.dtos.CategoryDto;
import cn.arorms.prp.finance.dtos.PresetDto;
import cn.arorms.prp.finance.dtos.TransactionDto;
import cn.arorms.prp.finance.entities.Account;
import cn.arorms.prp.finance.entities.Category;
import cn.arorms.prp.finance.repositories.AccountRepository;
import cn.arorms.prp.finance.repositories.CategoryRepository;
import cn.arorms.prp.finance.repositories.TransactionPresetRepository;
import cn.arorms.prp.finance.repositories.TransactionRepository;
import cn.arorms.prp.finance.services.AccountService;
import cn.arorms.prp.finance.services.CategoryService;
import cn.arorms.prp.finance.services.StatisticsService;
import cn.arorms.prp.finance.services.TransactionPresetService;
import cn.arorms.prp.finance.services.TransactionService;
import cn.arorms.prp.finance.shared.TransactionOwnershipChecker;
import cn.arorms.prp.finance.vos.SummaryVo;
import cn.arorms.prp.finance.vos.TrendPointVo;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.*;

/**
 * JPA slice test on H2: validates DDL mapping, JPQL queries and the
 * balance reversal flow ported from PFM (create/update/delete).
 */
@DataJpaTest
@Import(QueryDslConfig.class)
class FinanceFlowTest {
    private static final String UID = "test-user";

    @Autowired AccountRepository accounts;
    @Autowired CategoryRepository categories;
    @Autowired TransactionRepository transactions;
    @Autowired TransactionPresetRepository presets;

    @PersistenceContext EntityManager em;

    AccountService accountService;
    CategoryService categoryService;
    TransactionService transactionService;
    TransactionPresetService presetService;
    StatisticsService statisticsService;

    @BeforeEach
    void init() {
        TransactionOwnershipChecker ownership = new TransactionOwnershipChecker(accounts, categories);
        accountService = new AccountService(accounts);
        categoryService = new CategoryService(categories);
        transactionService = new TransactionService(transactions, accounts, categories, ownership);
        presetService = new TransactionPresetService(presets, accounts, categories, ownership);
        statisticsService = new StatisticsService(transactions, accounts);
    }

    private Long newAccount(String name, String amount) {
        AccountDto dto = new AccountDto();
        dto.setName(name);
        dto.setType("BANK");
        dto.setBalance(new BigDecimal(amount));
        dto.setCurrency("CNY");
        return accountService.create(UID, dto);
    }

    private Long newCategory(String name, String type) {
        CategoryDto dto = new CategoryDto();
        dto.setName(name);
        dto.setType(type);
        dto.setSortOrder(10);
        return categoryService.create(UID, dto);
    }

    private TransactionDto txDto(Long from, Long to, Long cat, String type, String amount, LocalDate day) {
        TransactionDto dto = new TransactionDto();
        dto.setFromAccountId(from);
        dto.setToAccountId(to);
        dto.setCategoryId(cat);
        dto.setType(type);
        dto.setAmount(new BigDecimal(amount));
        dto.setOccurredOn(day);
        return dto;
    }

    private BigDecimal balanceOf(Long id) {
        // bulk updateBalance bypasses L1; emulate a fresh request per read
        em.clear();
        return accounts.findById(id).orElseThrow().getBalance();
    }

    @Test
    void accountCrudAndTotals() {
        Long a = newAccount("A", "1000.00");
        Long b = newAccount("B", "500.00");

        assertEquals(0, new BigDecimal("1000.00").compareTo(balanceOf(a)));

        // update must not touch balance
        AccountDto upd = new AccountDto();
        upd.setName("A2");
        upd.setType("CASH");
        upd.setCurrency("CNY");
        upd.setBalance(new BigDecimal("999999"));
        accountService.update(UID, a, upd);
        assertEquals(0, new BigDecimal("1000.00").compareTo(balanceOf(a)));

        assertEquals(2, accountService.list(UID, Pageable.ofSize(20).withPage(0)).getTotalElements());
        assertEquals(1, accountService.totalBalance(UID).size());
        assertEquals(0, new BigDecimal("1500.00").compareTo(accountService.totalBalance(UID).get(0).getTotal()));

        accountService.delete(UID, b);
        assertEquals(1, accountService.list(UID, Pageable.ofSize(20).withPage(0)).getTotalElements());

        assertThrows(NoSuchElementException.class, () -> accountService.delete("other", a));
    }

    @Test
    void categoryVisibilityAndSystemImmutability() {
        categories.save(Category.builder().userId(null).name("餐饮").type("EXPENSE")
                .icon("Food").sortOrder(1).isSystem(1).build());
        Long own = newCategory("咖啡", "EXPENSE");

        assertEquals(2, categoryService.list(UID, null).size());
        assertEquals(2, categoryService.list(UID, "EXPENSE").size());
        assertEquals(0, categoryService.list(UID, "INCOME").size());
        // other users still see the system preset
        assertEquals(1, categoryService.list("someone-else", null).size());

        // system rows are immutable via service
        Long systemId = categoryService.list(UID, null).stream()
                .filter(c -> c.getUserId() == null).findFirst().orElseThrow().getId();
        CategoryDto upd = new CategoryDto();
        upd.setName("x");
        upd.setType("EXPENSE");
        assertThrows(NoSuchElementException.class, () -> categoryService.update(UID, systemId, upd));
        assertThrows(NoSuchElementException.class, () -> categoryService.delete(UID, systemId));

        categoryService.delete(UID, own);
        assertEquals(1, categoryService.list(UID, null).size());
    }

    @Test
    void transactionBalanceFlow() {
        Long a = newAccount("A", "1000.00");
        Long b = newAccount("B", "0.00");
        Long food = newCategory("餐饮", "EXPENSE");

        // EXPENSE 100 from A
        Long t1 = transactionService.create(UID, txDto(a, null, food, "EXPENSE", "100.00", LocalDate.of(2026, 9, 1)));
        assertEquals(0, new BigDecimal("900.00").compareTo(balanceOf(a)));

        // TRANSFER 200 A -> B
        Long t2 = transactionService.create(UID, txDto(a, b, null, "TRANSFER", "200.00", LocalDate.of(2026, 9, 2)));
        assertEquals(0, new BigDecimal("700.00").compareTo(balanceOf(a)));
        assertEquals(0, new BigDecimal("200.00").compareTo(balanceOf(b)));

        // same-account transfer rejected
        assertThrows(IllegalArgumentException.class,
                () -> transactionService.create(UID, txDto(a, a, null, "TRANSFER", "10.00", LocalDate.of(2026, 9, 2))));

        // update t1: 100 -> 50, balance restored accordingly
        transactionService.update(UID, t1, txDto(a, null, food, "EXPENSE", "50.00", LocalDate.of(2026, 9, 1)));
        assertEquals(0, new BigDecimal("750.00").compareTo(balanceOf(a)));

        // delete transfer: balances reversed
        transactionService.delete(UID, t2);
        assertEquals(0, new BigDecimal("950.00").compareTo(balanceOf(a)));
        assertEquals(0, new BigDecimal("0.00").compareTo(balanceOf(b)));

        // filtered list
        var page = transactionService.list(UID, LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 30),
                a, null, "EXPENSE", Pageable.ofSize(20).withPage(0));
        assertEquals(1, page.getTotalElements());
        assertEquals("A", page.getContent().get(0).getFromAccountName());
        assertEquals("餐饮", page.getContent().get(0).getCategoryName());
    }

    @Test
    void categoryTypeMismatchRejected() {
        Long a = newAccount("A", "1000.00");
        Long incomeCat = newCategory("工资", "INCOME");
        assertThrows(IllegalArgumentException.class,
                () -> transactionService.create(UID, txDto(a, null, incomeCat, "EXPENSE", "10.00", LocalDate.of(2026, 9, 1))));
    }

    @Test
    void statisticsQueries() {
        Long a = newAccount("A", "10000.00");
        Long b = newAccount("B", "0.00");
        Long food = newCategory("餐饮", "EXPENSE");
        Long salary = newCategory("工资", "INCOME");

        transactionService.create(UID, txDto(null, a, salary, "INCOME", "8000.00", LocalDate.of(2026, 9, 1)));
        transactionService.create(UID, txDto(a, null, food, "EXPENSE", "100.00", LocalDate.of(2026, 9, 2)));
        transactionService.create(UID, txDto(a, b, null, "TRANSFER", "500.00", LocalDate.of(2026, 9, 3)));

        SummaryVo summary = statisticsService.summary(UID, LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 30));
        assertEquals(0, new BigDecimal("8000.00").compareTo(summary.getTotalIncome()));
        assertEquals(0, new BigDecimal("100.00").compareTo(summary.getTotalExpense()));
        assertEquals(0, new BigDecimal("7900.00").compareTo(summary.getNet()));
        assertFalse(summary.getByCategory().isEmpty());

        List<TrendPointVo> trend = statisticsService.trend(UID,
                LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 3), "day");
        assertEquals(3, trend.size());
        assertEquals(0, new BigDecimal("8000.00").compareTo(trend.get(0).getIncome()));

        List<TrendPointVo> weekly = statisticsService.trend(UID,
                LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 30), "week");
        assertFalse(weekly.isEmpty());

        assertEquals(2, statisticsService.accountBalances(UID).size());
        assertThrows(IllegalArgumentException.class,
                () -> statisticsService.summary(UID, LocalDate.of(2026, 9, 5), LocalDate.of(2026, 9, 1)));
        assertThrows(IllegalArgumentException.class,
                () -> statisticsService.trend(UID, LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 2), "year"));
    }

    @Test
    void presetCrudWithoutBalanceMovement() {
        Long a = newAccount("A", "1000.00");
        Long food = newCategory("餐饮", "EXPENSE");

        PresetDto dto = new PresetDto();
        dto.setFromAccountId(a);
        dto.setCategoryId(food);
        dto.setType("EXPENSE");
        dto.setAmount(new BigDecimal("25.50"));
        dto.setNote("午餐");
        Long id = presetService.create(UID, dto);

        assertEquals(0, new BigDecimal("1000.00").compareTo(balanceOf(a)));
        assertEquals(1, presetService.list(UID).size());
        assertEquals("A", presetService.list(UID).get(0).getFromAccountName());

        dto.setAmount(new BigDecimal("30.00"));
        presetService.update(UID, id, dto);
        presetService.delete(UID, id);
        assertTrue(presetService.list(UID).isEmpty());
    }
}
