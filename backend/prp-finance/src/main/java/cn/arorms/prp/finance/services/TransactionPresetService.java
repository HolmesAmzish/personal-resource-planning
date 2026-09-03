package cn.arorms.prp.finance.services;

import cn.arorms.prp.finance.dtos.PresetDto;
import cn.arorms.prp.finance.entities.Account;
import cn.arorms.prp.finance.entities.TransactionPreset;
import cn.arorms.prp.finance.repositories.AccountRepository;
import cn.arorms.prp.finance.repositories.CategoryRepository;
import cn.arorms.prp.finance.repositories.TransactionPresetRepository;
import cn.arorms.prp.finance.shared.TransactionOwnershipChecker;
import cn.arorms.prp.finance.vos.PresetVo;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * TransactionPresetService — ported from PFM to JPA.
 * Presets never move balances and carry no date.
 */
@Service
public class TransactionPresetService {
    private final TransactionPresetRepository presetRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionOwnershipChecker ownership;

    public TransactionPresetService(TransactionPresetRepository presetRepository,
                                    AccountRepository accountRepository,
                                    CategoryRepository categoryRepository,
                                    TransactionOwnershipChecker ownership) {
        this.presetRepository = presetRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.ownership = ownership;
    }

    public List<PresetVo> list(String userId) {
        List<PresetVo> vos = presetRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toVo).toList();
        fillDisplayNames(vos);
        return vos;
    }

    public Long create(String userId, PresetDto req) {
        validateAccounts(userId, req);
        validateCategory(userId, req);
        TransactionPreset p = TransactionPreset.builder()
                .userId(userId)
                .type(req.getType())
                .amount(req.getAmount())
                .fromAccountId(req.getFromAccountId())
                .toAccountId(req.getToAccountId())
                .categoryId(req.getCategoryId())
                .note(req.getNote())
                .build();
        return presetRepository.save(p).getId();
    }

    public void update(String userId, Long id, PresetDto req) {
        TransactionPreset p = mustOwn(userId, id);
        validateAccounts(userId, req);
        validateCategory(userId, req);
        p.setType(req.getType());
        p.setAmount(req.getAmount());
        p.setFromAccountId(req.getFromAccountId());
        p.setToAccountId(req.getToAccountId());
        p.setCategoryId(req.getCategoryId());
        p.setNote(req.getNote());
        presetRepository.save(p);
    }

    public void delete(String userId, Long id) {
        TransactionPreset p = mustOwn(userId, id);
        presetRepository.delete(p);
    }

    private TransactionPreset mustOwn(String userId, Long id) {
        return presetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("卡片不存在"));
    }

    private void validateAccounts(String userId, PresetDto req) {
        Account from = req.getFromAccountId() != null
                ? ownership.mustOwnAccount(userId, req.getFromAccountId()) : null;
        Account to = req.getToAccountId() != null
                ? ownership.mustOwnAccount(userId, req.getToAccountId()) : null;
        if ("TRANSFER".equals(req.getType())) {
            if (from == null || to == null) {
                throw new IllegalArgumentException("转账需要源账户和目标账户");
            }
            if (req.getFromAccountId().equals(req.getToAccountId())) {
                throw new IllegalArgumentException("源账户和目标账户不能相同");
            }
        }
    }

    private void validateCategory(String userId, PresetDto req) {
        if (req.getCategoryId() != null) {
            ownership.mustOwnCategory(userId, req.getCategoryId(), req.getType());
        }
    }

    private PresetVo toVo(TransactionPreset p) {
        PresetVo vo = new PresetVo();
        vo.setId(p.getId());
        vo.setUserId(p.getUserId());
        vo.setType(p.getType());
        vo.setAmount(p.getAmount());
        vo.setFromAccountId(p.getFromAccountId());
        vo.setToAccountId(p.getToAccountId());
        vo.setCategoryId(p.getCategoryId());
        vo.setNote(p.getNote());
        vo.setCreatedAt(p.getCreatedAt());
        vo.setUpdatedAt(p.getUpdatedAt());
        return vo;
    }

    private void fillDisplayNames(List<PresetVo> vos) {
        if (vos == null || vos.isEmpty()) return;
        Set<Long> accountIds = vos.stream()
                .flatMap(v -> Stream.of(v.getFromAccountId(), v.getToAccountId()))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Set<Long> categoryIds = vos.stream()
                .map(PresetVo::getCategoryId)
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
        for (PresetVo vo : vos) {
            if (vo.getFromAccountId() != null) vo.setFromAccountName(accountNames.get(vo.getFromAccountId()));
            if (vo.getToAccountId() != null) vo.setToAccountName(accountNames.get(vo.getToAccountId()));
            if (vo.getCategoryId() != null) vo.setCategoryName(categoryNames.get(vo.getCategoryId()));
        }
    }
}
