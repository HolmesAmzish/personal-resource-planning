package cn.arorms.prp.society.controllers;

import cn.arorms.framework.security.UserPrincipal;
import cn.arorms.prp.society.dtos.ContactDto;
import cn.arorms.prp.society.dtos.ContactResponse;
import cn.arorms.prp.society.enums.ContactType;
import cn.arorms.prp.society.services.ContactService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/society/contacts")
public class ContactController {
    private final ContactService contactService;

    @Autowired
    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping
    public Page<ContactResponse> list(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) ContactType contactType,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        return contactService.list(user.getId(), partyId, contactType, q, pageable);
    }

    @GetMapping("/{id}")
    public ContactResponse get(@AuthenticationPrincipal UserPrincipal user, @PathVariable Long id) {
        return contactService.get(user.getId(), id);
    }

    @PostMapping
    public ContactResponse create(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody ContactDto request
    ) {
        return contactService.create(user.getId(), request);
    }

    @PutMapping("/{id}")
    public ContactResponse update(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id,
            @Valid @RequestBody ContactDto request
    ) {
        return contactService.update(user.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal user, @PathVariable Long id) {
        contactService.delete(user.getId(), id);
        return ResponseEntity.ok().build();
    }
}
