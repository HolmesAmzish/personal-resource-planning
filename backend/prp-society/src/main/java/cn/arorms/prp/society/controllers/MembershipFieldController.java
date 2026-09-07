package cn.arorms.prp.society.controllers;

import cn.arorms.framework.security.UserPrincipal;
import cn.arorms.prp.society.dtos.MembershipFieldDto;
import cn.arorms.prp.society.dtos.MembershipFieldResponse;
import cn.arorms.prp.society.services.MembershipFieldService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class MembershipFieldController {
    private final MembershipFieldService membershipFieldService;

    @Autowired
    public MembershipFieldController(MembershipFieldService membershipFieldService) {
        this.membershipFieldService = membershipFieldService;
    }

    @GetMapping("/api/society/membership-fields")
    public List<MembershipFieldResponse> listAll(@AuthenticationPrincipal UserPrincipal user) {
        return membershipFieldService.listAll(user.getId());
    }

    @GetMapping("/api/society/organizations/{organizationId}/membership-fields")
    public List<MembershipFieldResponse> list(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long organizationId
    ) {
        return membershipFieldService.list(user.getId(), organizationId);
    }

    @PostMapping("/api/society/organizations/{organizationId}/membership-fields")
    public MembershipFieldResponse create(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long organizationId,
            @Valid @RequestBody MembershipFieldDto request
    ) {
        return membershipFieldService.create(user.getId(), organizationId, request);
    }

    @PutMapping("/api/society/organizations/{organizationId}/membership-fields/{id}")
    public MembershipFieldResponse update(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long organizationId,
            @PathVariable Long id,
            @Valid @RequestBody MembershipFieldDto request
    ) {
        return membershipFieldService.update(user.getId(), organizationId, id, request);
    }

    @DeleteMapping("/api/society/organizations/{organizationId}/membership-fields/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long organizationId,
            @PathVariable Long id
    ) {
        membershipFieldService.delete(user.getId(), organizationId, id);
        return ResponseEntity.ok().build();
    }
}
