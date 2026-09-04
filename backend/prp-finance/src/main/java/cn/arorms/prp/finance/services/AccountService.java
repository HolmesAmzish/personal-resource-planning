package cn.arorms.prp.finance.services;

import cn.arorms.prp.finance.dtos.AccountDto;
import cn.arorms.prp.finance.entities.Account;
import cn.arorms.prp.finance.repositories.AccountRepository;
import cn.arorms.prp.finance.vos.AccountVo;
import cn.arorms.prp.finance.vos.CurrencyTotalVo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;

/**
 * AccountService — ported from PFM AccountServiceImpl to JPA.
 * Note: update never touches balance (balance only moves via transactions).
 */
@Service
public class AccountService {
    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public Page<AccountVo> list(String userId, Pageable pageable) {
        Pageable sorted = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Order.desc("id")));
        return accountRepository.findByUserId(userId, sorted).map(this::toVo);
    }

    public Long create(String userId, AccountDto req) {
        Account a = Account.builder()
                .userId(userId)
                .name(req.getName())
                .type(req.getType())
                .balance(req.getBalance() == null ? BigDecimal.ZERO : req.getBalance())
                .currency(req.getCurrency())
                .note(req.getNote())
                .build();
        return accountRepository.save(a).getId();
    }

    public void update(String userId, Long id, AccountDto req) {
        Account a = mustOwn(userId, id);
        a.setName(req.getName());
        a.setType(req.getType());
        a.setCurrency(req.getCurrency());
        a.setNote(req.getNote());
        accountRepository.save(a);
    }

    public void delete(String userId, Long id) {
        Account a = mustOwn(userId, id);
        accountRepository.delete(a);
    }

    public List<CurrencyTotalVo> totalBalance(String userId) {
        return accountRepository.sumByCurrency(userId).stream()
                .map(r -> new CurrencyTotalVo(r.currency(), r.total()))
                .toList();
    }

    private Account mustOwn(String userId, Long id) {
        return accountRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Account not found"));
    }

    private AccountVo toVo(Account a) {
        AccountVo vo = new AccountVo();
        vo.setId(a.getId());
        vo.setUserId(a.getUserId());
        vo.setName(a.getName());
        vo.setType(a.getType());
        vo.setBalance(a.getBalance());
        vo.setCurrency(a.getCurrency());
        vo.setNote(a.getNote());
        vo.setCreatedAt(a.getCreatedAt());
        vo.setUpdatedAt(a.getUpdatedAt());
        return vo;
    }
}
