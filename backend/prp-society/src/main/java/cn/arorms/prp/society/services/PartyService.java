package cn.arorms.prp.society.services;

import cn.arorms.prp.society.dtos.ContactDto;
import cn.arorms.prp.society.dtos.ContactResponse;
import cn.arorms.prp.society.dtos.MembershipSummaryResponse;
import cn.arorms.prp.society.dtos.PartyDto;
import cn.arorms.prp.society.dtos.PartyResponse;
import cn.arorms.prp.society.entities.Contact;
import cn.arorms.prp.society.entities.Organization;
import cn.arorms.prp.society.entities.Party;
import cn.arorms.prp.society.entities.Person;
import cn.arorms.prp.society.enums.PartyType;
import cn.arorms.prp.society.repositories.ContactRepository;
import cn.arorms.prp.society.repositories.MembershipRepository;
import cn.arorms.prp.society.repositories.PartyRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class PartyService {
    private final PartyRepository partyRepository;
    private final ContactRepository contactRepository;
    private final MembershipRepository membershipRepository;
    private final cn.arorms.prp.society.repositories.MembershipFieldRepository membershipFieldRepository;

    public PartyService(
            PartyRepository partyRepository,
            ContactRepository contactRepository,
            MembershipRepository membershipRepository,
            cn.arorms.prp.society.repositories.MembershipFieldRepository membershipFieldRepository
    ) {
        this.partyRepository = partyRepository;
        this.contactRepository = contactRepository;
        this.membershipRepository = membershipRepository;
        this.membershipFieldRepository = membershipFieldRepository;
    }

    @Transactional(readOnly = true)
    public Page<PartyResponse> list(String userId, PartyType partyType, String query, Pageable pageable) {
        Pageable sorted = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Order.desc("createdAt")));
        String q = blankToNull(query);
        boolean includePerson = partyType == null || partyType == PartyType.PERSON;
        boolean includeOrganization = partyType == null || partyType == PartyType.ORGANIZATION;
        return partyRepository.search(userId, q, includePerson, includeOrganization, sorted)
                .map(this::toResponse);
    }

    public PartyResponse get(String userId, Long id) {
        return toDetail(mustOwn(userId, id));
    }

    @Transactional
    public PartyResponse create(String userId, PartyDto request) {
        Party party = switch (request.getPartyType()) {
            case PERSON -> new Person();
            case ORGANIZATION -> new Organization();
        };
        party.setUserId(userId);
        applyValues(party, request);
        Party saved = partyRepository.save(party);
        replaceContacts(saved, request.getContacts());
        return toDetail(partyRepository.save(saved));
    }

    @Transactional
    public PartyResponse update(String userId, Long id, PartyDto request) {
        Party party = mustOwn(userId, id);
        PartyType currentType = party instanceof Person ? PartyType.PERSON : PartyType.ORGANIZATION;
        if (currentType != request.getPartyType()) {
            throw new IllegalArgumentException("Party type cannot be changed");
        }
        applyValues(party, request);
        if (request.getContacts() != null) {
            replaceContacts(party, request.getContacts());
        }
        return toDetail(partyRepository.save(party));
    }

    @Transactional
    public void delete(String userId, Long id) {
        Party party = mustOwn(userId, id);
        if (party instanceof Person) {
            membershipRepository.deleteAllByPerson_Id(party.getId());
        } else if (party instanceof Organization) {
            membershipFieldRepository.deleteAllByOrganization_Id(party.getId());
            membershipRepository.deleteAllByOrganization_Id(party.getId());
        }
        partyRepository.delete(party);
    }

    private Party mustOwn(String userId, Long id) {
        return partyRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Party not found"));
    }

    private void applyValues(Party party, PartyDto request) {
        party.setName(request.getName());
        party.setIdentityCode(request.getIdentityCode());
        party.setAddress(request.getAddress());
        if (party instanceof Person person) {
            person.setGender(request.getGender());
            person.setBirthDate(request.getBirthDate());
        } else if (party instanceof Organization organization) {
            organization.setWebsite(request.getWebsite());
        }
    }

    private void replaceContacts(Party party, List<ContactDto> requests) {
        party.getContacts().clear();
        if (requests == null) {
            return;
        }
        for (ContactDto request : requests) {
            Contact contact = new Contact();
            contact.setParty(party);
            contact.setContactType(request.getContactType());
            contact.setContent(request.getContent());
            party.getContacts().add(contact);
        }
    }

    private PartyResponse toResponse(Party party) {
        return PartyResponse.builder()
                .id(party.getId())
                .partyType(party instanceof Person ? PartyType.PERSON : PartyType.ORGANIZATION)
                .name(party.getName())
                .identityCode(party.getIdentityCode())
                .address(party.getAddress())
                .gender(party instanceof Person person ? person.getGender() : null)
                .birthDate(party instanceof Person person ? person.getBirthDate() : null)
                .website(party instanceof Organization organization ? organization.getWebsite() : null)
                .contacts(toContactResponses(party))
                .createdAt(party.getCreatedAt())
                .updatedAt(party.getUpdatedAt())
                .build();
    }

    private PartyResponse toDetail(Party party) {
        PartyResponse response = toResponse(party);
        Long personId = party instanceof Person ? party.getId() : null;
        Long organizationId = party instanceof Organization ? party.getId() : null;
        List<MembershipSummaryResponse> memberships = membershipRepository
                .search(party.getUserId(), personId, organizationId, null, Pageable.unpaged())
                .map(this::toMembershipSummary)
                .getContent();
        response.setMemberships(memberships);
        return response;
    }

    private List<ContactResponse> toContactResponses(Party party) {
        return party.getContacts().stream()
                .map(this::toContactResponse)
                .toList();
    }

    private ContactResponse toContactResponse(Contact contact) {
        Party party = contact.getParty();
        return ContactResponse.builder()
                .id(contact.getId())
                .partyId(party.getId())
                .partyName(party.getName())
                .partyType(party instanceof Person ? PartyType.PERSON : PartyType.ORGANIZATION)
                .contactType(contact.getContactType())
                .content(contact.getContent())
                .createdAt(contact.getCreatedAt())
                .build();
    }

    private MembershipSummaryResponse toMembershipSummary(cn.arorms.prp.society.entities.Membership membership) {
        return MembershipSummaryResponse.builder()
                .id(membership.getId())
                .personId(membership.getPerson().getId())
                .personName(membership.getPerson().getName())
                .organizationId(membership.getOrganization().getId())
                .organizationName(membership.getOrganization().getName())
                .note(membership.getNote())
                .createdAt(membership.getCreatedAt())
                .build();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
