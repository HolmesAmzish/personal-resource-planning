package cn.arorms.prp.finance.controllers;

import cn.arorms.framework.security.UserPrincipal;
import cn.arorms.prp.finance.dtos.TransactionDto;
import cn.arorms.prp.finance.services.TransactionService;
import cn.arorms.prp.finance.vos.TransactionVo;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionService transactionService;

    @Autowired
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public Page<TransactionVo> list(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(name = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(name = "accountId", required = false) Long accountId,
            @RequestParam(name = "categoryId", required = false) Long categoryId,
            @RequestParam(name = "type", required = false) String type,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        return transactionService.list(user.getId(), from, to, accountId, categoryId, type, pageable);
    }

    @PostMapping
    public ResponseEntity<Long> create(@AuthenticationPrincipal UserPrincipal user,
                                       @Valid @RequestBody TransactionDto req) {
        return ResponseEntity.ok(transactionService.create(user.getId(), req));
    }

    @PostMapping("/transfer")
    public ResponseEntity<Long> transfer(@AuthenticationPrincipal UserPrincipal user,
                                         @Valid @RequestBody TransactionDto req) {
        if (!"TRANSFER".equals(req.getType())) {
            req.setType("TRANSFER");
        }
        return ResponseEntity.ok(transactionService.create(user.getId(), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@AuthenticationPrincipal UserPrincipal user,
                                       @PathVariable Long id,
                                       @Valid @RequestBody TransactionDto req) {
        transactionService.update(user.getId(), id, req);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal user,
                                       @PathVariable Long id) {
        transactionService.delete(user.getId(), id);
        return ResponseEntity.ok().build();
    }
}
