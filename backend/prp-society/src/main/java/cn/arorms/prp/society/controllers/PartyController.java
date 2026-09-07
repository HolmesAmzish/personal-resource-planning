package cn.arorms.prp.society.controllers;

import cn.arorms.framework.security.UserPrincipal;
import cn.arorms.prp.society.dtos.PartyDto;
import cn.arorms.prp.society.dtos.PartyResponse;
import cn.arorms.prp.society.enums.PartyType;
import cn.arorms.prp.society.services.PartyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/society/parties")
public class PartyController {
    private final PartyService partyService;

    @Autowired
    public PartyController(PartyService partyService) {
        this.partyService = partyService;
    }

    @GetMapping
    public Page<PartyResponse> list(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) PartyType partyType,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        return partyService.list(user.getId(), partyType, q, pageable);
    }

    @GetMapping("/{id}")
    public PartyResponse get(@AuthenticationPrincipal UserPrincipal user, @PathVariable Long id) {
        return partyService.get(user.getId(), id);
    }

    @PostMapping
    public PartyResponse create(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody PartyDto request
    ) {
        return partyService.create(user.getId(), request);
    }

    @PutMapping("/{id}")
    public PartyResponse update(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id,
            @Valid @RequestBody PartyDto request
    ) {
        return partyService.update(user.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal user, @PathVariable Long id) {
        partyService.delete(user.getId(), id);
        return ResponseEntity.ok().build();
    }
}
