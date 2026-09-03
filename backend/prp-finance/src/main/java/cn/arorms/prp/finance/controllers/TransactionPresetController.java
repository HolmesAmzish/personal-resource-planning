package cn.arorms.prp.finance.controllers;

import cn.arorms.framework.security.UserPrincipal;
import cn.arorms.prp.finance.dtos.PresetDto;
import cn.arorms.prp.finance.services.TransactionPresetService;
import cn.arorms.prp.finance.vos.PresetVo;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transaction-presets")
public class TransactionPresetController {
    private final TransactionPresetService presetService;

    @Autowired
    public TransactionPresetController(TransactionPresetService presetService) {
        this.presetService = presetService;
    }

    @GetMapping
    public ResponseEntity<List<PresetVo>> list(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(presetService.list(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Long> create(@AuthenticationPrincipal UserPrincipal user,
                                       @Valid @RequestBody PresetDto req) {
        return ResponseEntity.ok(presetService.create(user.getId(), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@AuthenticationPrincipal UserPrincipal user,
                                       @PathVariable Long id,
                                       @Valid @RequestBody PresetDto req) {
        presetService.update(user.getId(), id, req);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal user,
                                       @PathVariable Long id) {
        presetService.delete(user.getId(), id);
        return ResponseEntity.ok().build();
    }
}
