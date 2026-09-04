package cn.arorms.prp.finance.shared;

import cn.arorms.prp.finance.entities.Account;
import cn.arorms.prp.finance.entities.Category;
import cn.arorms.prp.finance.repositories.AccountRepository;
import cn.arorms.prp.finance.repositories.CategoryRepository;
import org.springframework.stereotype.Component;

/**
 * Shared ownership / validation rules for transaction-related services.
 * Ported from PFM TransactionOwnershipChecker (MyBatis-Plus) to JPA.
 */
@Component
public class TransactionOwnershipChecker {
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;

    public TransactionOwnershipChecker(AccountRepository accountRepository,
                                       CategoryRepository categoryRepository) {
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
    }

    public Account mustOwnAccount(String userId, Long accountId) {
        Account a = accountRepository.findById(accountId).orElse(null);
        if (a == null || !userId.equals(a.getUserId())) {
            throw new IllegalArgumentException("Invalid account");
        }
        return a;
    }

    public void mustOwnCategory(String userId, Long categoryId, String type) {
        Category c = categoryRepository.findById(categoryId).orElse(null);
        if (c == null) {
            throw new IllegalArgumentException("Invalid category");
        }
        if (c.getUserId() != null && !userId.equals(c.getUserId())) {
            throw new IllegalArgumentException("Invalid category");
        }
        if ("TRANSFER".equals(type)) return;
        if (!type.equals(c.getType())) {
            throw new IllegalArgumentException("Category type mismatch");
        }
    }
}
