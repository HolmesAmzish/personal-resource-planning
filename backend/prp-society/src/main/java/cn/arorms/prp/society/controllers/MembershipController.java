package cn.arorms.prp.society.controllers;

import cn.arorms.framework.security.UserPrincipal;
import cn.arorms.prp.society.dtos.MembershipDto;
import cn.arorms.prp.society.dtos.MembershipResponse;
import cn.arorms.prp.society.services.MembershipService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/society/memberships")
public class MembershipController {
    private final MembershipService membershipService;

    @Autowired
    public MembershipController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @GetMapping
    public Page<MembershipResponse> list(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) Long personId,
            @RequestParam(required = false) Long organizationId,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        return membershipService.list(user.getId(), personId, organizationId, q, pageable);
    }

    @GetMapping("/{id}")
    public MembershipResponse get(@AuthenticationPrincipal UserPrincipal user, @PathVariable Long id) {
        return membershipService.get(user.getId(), id);
    }

    @PostMapping
    public MembershipResponse create(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody MembershipDto request
    ) {
        return membershipService.create(user.getId(), request);
    }

    @PutMapping("/{id}")
    public MembershipResponse update(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id,
            @Valid @RequestBody MembershipDto request
    ) {
        return membershipService.update(user.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal user, @PathVariable Long id) {
        membershipService.delete(user.getId(), id);
        return ResponseEntity.ok().build();
    }
}
