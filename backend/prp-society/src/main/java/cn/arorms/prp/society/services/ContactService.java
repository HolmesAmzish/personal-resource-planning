package cn.arorms.prp.society.services;

import cn.arorms.prp.society.dtos.ContactDto;
import cn.arorms.prp.society.dtos.ContactResponse;
import cn.arorms.prp.society.entities.Contact;
import cn.arorms.prp.society.entities.Party;
import cn.arorms.prp.society.entities.Person;
import cn.arorms.prp.society.enums.ContactType;
import cn.arorms.prp.society.repositories.ContactRepository;
import cn.arorms.prp.society.repositories.PartyRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
public class ContactService {
    private final ContactRepository contactRepository;
    private final PartyRepository partyRepository;

    public ContactService(ContactRepository contactRepository, PartyRepository partyRepository) {
        this.contactRepository = contactRepository;
        this.partyRepository = partyRepository;
    }

    @Transactional(readOnly = true)
    public Page<ContactResponse> list(String userId, Long partyId, ContactType contactType, String query, Pageable pageable) {
        Pageable sorted = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Order.desc("createdAt")));
        String q = blankToNull(query);
        return contactRepository.search(userId, partyId, contactType, q, sorted).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ContactResponse get(String userId, Long id) {
        return toResponse(mustOwn(userId, id));
    }

    @Transactional
    public ContactResponse create(String userId, ContactDto request) {
        Party party = mustOwnParty(userId, request.getPartyId());
        Contact contact = new Contact();
        contact.setParty(party);
        contact.setContactType(request.getContactType());
        contact.setContent(request.getContent());
        return toResponse(contactRepository.save(contact));
    }

    @Transactional
    public ContactResponse update(String userId, Long id, ContactDto request) {
        Contact contact = mustOwn(userId, id);
        Party party = mustOwnParty(userId, request.getPartyId());
        contact.setParty(party);
        contact.setContactType(request.getContactType());
        contact.setContent(request.getContent());
        return toResponse(contactRepository.save(contact));
    }

    @Transactional
    public void delete(String userId, Long id) {
        contactRepository.delete(mustOwn(userId, id));
    }

    private Contact mustOwn(String userId, Long id) {
        return contactRepository.findByIdAndParty_UserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Contact not found"));
    }

    private Party mustOwnParty(String userId, Long id) {
        return partyRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Party not found"));
    }

    private ContactResponse toResponse(Contact contact) {
        Party party = contact.getParty();
        return ContactResponse.builder()
                .id(contact.getId())
                .partyId(party.getId())
                .partyName(party.getName())
                .partyType(party instanceof Person ? cn.arorms.prp.society.enums.PartyType.PERSON : cn.arorms.prp.society.enums.PartyType.ORGANIZATION)
                .contactType(contact.getContactType())
                .content(contact.getContent())
                .createdAt(contact.getCreatedAt())
                .updatedAt(contact.getUpdatedAt())
                .build();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
