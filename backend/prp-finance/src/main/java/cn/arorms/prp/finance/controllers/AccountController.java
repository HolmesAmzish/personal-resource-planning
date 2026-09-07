package cn.arorms.prp.finance.controllers;

import cn.arorms.framework.common.domain.PageResponse;
import cn.arorms.framework.security.UserPrincipal;
import cn.arorms.prp.finance.dtos.AccountDto;
import cn.arorms.prp.finance.services.AccountService;
import cn.arorms.prp.finance.vos.AccountVo;
import cn.arorms.prp.finance.vos.CurrencyTotalVo;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AccountController — GET /api/accounts paged with Spring Page (arlist style,
 * page 0-based; PFM used 1-based PageResult).
 */
@RestController
@RequestMapping("/api/accounts")
public class AccountController {
    private final AccountService accountService;

    @Autowired
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public PageResponse<AccountVo> list(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal user) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        return PageResponse.fromPage(accountService.list(user.getId(), pageable));
    }

    @PostMapping
    public ResponseEntity<Long> create(@AuthenticationPrincipal UserPrincipal user,
                                       @Valid @RequestBody AccountDto req) {
        return ResponseEntity.ok(accountService.create(user.getId(), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@AuthenticationPrincipal UserPrincipal user,
                                       @PathVariable Long id,
                                       @Valid @RequestBody AccountDto req) {
        accountService.update(user.getId(), id, req);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal user,
                                       @PathVariable Long id) {
        accountService.delete(user.getId(), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/total-balance")
    public ResponseEntity<List<CurrencyTotalVo>> totalBalance(
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(accountService.totalBalance(user.getId()));
    }
}
