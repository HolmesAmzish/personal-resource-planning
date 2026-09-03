package cn.arorms.prp.finance.services;

import cn.arorms.prp.finance.dtos.TransactionDto;
import cn.arorms.prp.finance.entities.Account;
import cn.arorms.prp.finance.entities.Transaction;
import cn.arorms.prp.finance.repositories.AccountRepository;
import cn.arorms.prp.finance.repositories.CategoryRepository;
import cn.arorms.prp.finance.repositories.TransactionRepository;
import cn.arorms.prp.finance.shared.TransactionOwnershipChecker;
import cn.arorms.prp.finance.vos.TransactionVo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * TransactionService — ported from PFM TransactionServiceImpl (MyBatis-Plus) to JPA.
 * Balance movement uses atomic JPQL updateBalance; create/update/delete reverse
 * and re-apply balances inside @Transactional boundaries.
 */
@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionOwnershipChecker ownership;

    public TransactionService(TransactionRepository transactionRepository,
                              AccountRepository accountRepository,
                              CategoryRepository categoryRepository,
                              TransactionOwnershipChecker ownership) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.ownership = ownership;
    }

    public Page<TransactionVo> list(String userId, LocalDate from, LocalDate to,
                                    Long accountId, Long categoryId, String type, Pageable pageable) {
        String t = (type == null || type.isBlank()) ? null : type;
        Pageable sorted = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Order.desc("occurredOn"), Sort.Order.desc("id")));
        Page<Transaction> page = transactionRepository.search(userId, from, to, accountId, categoryId, t, sorted);
        List<TransactionVo> vos = page.getContent().stream().map(this::toVo).toList();
        fillDisplayNames(vos);
        return new PageImpl<>(vos, sorted, page.getTotalElements());
    }

    @Transactional
    public Long create(String userId, TransactionDto req) {
        Account fromAcc = req.getFromAccountId() != null
                ? ownership.mustOwnAccount(userId, req.getFromAccountId()) : null;
        Account toAcc = req.getToAccountId() != null
                ? ownership.mustOwnAccount(userId, req.getToAccountId()) : null;
        validateTransfer(req.getType(), req.getFromAccountId(), req.getToAccountId(), fromAcc, toAcc);
        if (req.getCategoryId() != null) {
            ownership.mustOwnCategory(userId, req.getCategoryId(), req.getType());
        }

        Transaction t = Transaction.builder()
                .userId(userId)
                .fromAccountId(req.getFromAccountId())
                .toAccountId(req.getToAccountId())
                .categoryId(req.getCategoryId())
                .type(req.getType())
                .amount(req.getAmount())
                .occurredOn(req.getOccurredOn())
                .note(req.getNote())
                .build();
        transactionRepository.save(t);

        if (fromAcc != null) adjustBalance(fromAcc.getId(), req.getAmount().negate());
        if (toAcc != null) adjustBalance(toAcc.getId(), req.getAmount());
        return t.getId();
    }

    @Transactional
    public void update(String userId, Long id, TransactionDto req) {
        Transaction old = mustOwn(userId, id);

        Account oldFromAcc = old.getFromAccountId() != null
                ? ownership.mustOwnAccount(userId, old.getFromAccountId()) : null;
        Account oldToAcc = old.getToAccountId() != null
                ? ownership.mustOwnAccount(userId, old.getToAccountId()) : null;

        if (oldFromAcc != null) adjustBalance(oldFromAcc.getId(), old.getAmount());
        if (oldToAcc != null) adjustBalance(oldToAcc.getId(), old.getAmount().negate());

        Account newFromAcc = null;
        Account newToAcc = null;
        if (req.getFromAccountId() != null) {
            newFromAcc = (oldFromAcc != null && old.getFromAccountId().equals(req.getFromAccountId()))
                    ? oldFromAcc
                    : ownership.mustOwnAccount(userId, req.getFromAccountId());
        }
        if (req.getToAccountId() != null) {
            newToAcc = (oldToAcc != null && old.getToAccountId().equals(req.getToAccountId()))
                    ? oldToAcc
                    : ownership.mustOwnAccount(userId, req.getToAccountId());
        }
        validateTransfer(req.getType(), req.getFromAccountId(), req.getToAccountId(), newFromAcc, newToAcc);
        if (req.getCategoryId() != null) {
            ownership.mustOwnCategory(userId, req.getCategoryId(), req.getType());
        }

        old.setFromAccountId(req.getFromAccountId());
        old.setToAccountId(req.getToAccountId());
        old.setCategoryId(req.getCategoryId());
        old.setType(req.getType());
        old.setAmount(req.getAmount());
        old.setOccurredOn(req.getOccurredOn());
        old.setNote(req.getNote());
        transactionRepository.save(old);

        if (newFromAcc != null) adjustBalance(newFromAcc.getId(), req.getAmount().negate());
        if (newToAcc != null) adjustBalance(newToAcc.getId(), req.getAmount());
    }

    @Transactional
    public void delete(String userId, Long id) {
        Transaction t = mustOwn(userId, id);
        Long fromId = t.getFromAccountId();
        Long toId = t.getToAccountId();
        BigDecimal amount = t.getAmount();
        transactionRepository.delete(t);
        if (fromId != null) {
            ownership.mustOwnAccount(userId, fromId);
            adjustBalance(fromId, amount);
        }
        if (toId != null) {
            ownership.mustOwnAccount(userId, toId);
            adjustBalance(toId, amount.negate());
        }
    }

    private void validateTransfer(String type, Long fromId, Long toId, Account fromAcc, Account toAcc) {
        if ("TRANSFER".equals(type)) {
            if (fromAcc == null || toAcc == null) {
                throw new IllegalArgumentException("转账需要源账户和目标账户");
            }
            if (fromId.equals(toId)) {
                throw new IllegalArgumentException("源账户和目标账户不能相同");
            }
        }
    }

    private Transaction mustOwn(String userId, Long id) {
        return transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("交易不存在"));
    }

    private void adjustBalance(Long accountId, BigDecimal delta) {
        accountRepository.updateBalance(accountId, delta);
    }

    private TransactionVo toVo(Transaction t) {
        TransactionVo vo = new TransactionVo();
        vo.setId(t.getId());
        vo.setUserId(t.getUserId());
        vo.setFromAccountId(t.getFromAccountId());
        vo.setToAccountId(t.getToAccountId());
        vo.setCategoryId(t.getCategoryId());
        vo.setType(t.getType());
        vo.setAmount(t.getAmount());
        vo.setOccurredOn(t.getOccurredOn());
        vo.setNote(t.getNote());
        vo.setCreatedAt(t.getCreatedAt());
        vo.setUpdatedAt(t.getUpdatedAt());
        return vo;
    }

    private void fillDisplayNames(List<TransactionVo> vos) {
        if (vos == null || vos.isEmpty()) return;
        Set<Long> accountIds = vos.stream()
                .flatMap(t -> Stream.of(t.getFromAccountId(), t.getToAccountId()))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Set<Long> categoryIds = vos.stream()
                .map(TransactionVo::getCategoryId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, String> accountNames = new HashMap<>();
        if (!accountIds.isEmpty()) {
            accountRepository.findAllById(accountIds)
                    .forEach(a -> accountNames.put(a.getId(), a.getName()));
        }
        Map<Long, String> categoryNames = new HashMap<>();
        if (!categoryIds.isEmpty()) {
            categoryRepository.findAllById(categoryIds)
                    .forEach(c -> categoryNames.put(c.getId(), c.getName()));
        }
        for (TransactionVo vo : vos) {
            if (vo.getFromAccountId() != null) vo.setFromAccountName(accountNames.get(vo.getFromAccountId()));
            if (vo.getToAccountId() != null) vo.setToAccountName(accountNames.get(vo.getToAccountId()));
            if (vo.getCategoryId() != null) vo.setCategoryName(categoryNames.get(vo.getCategoryId()));
        }
    }
}
