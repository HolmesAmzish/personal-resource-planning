package cn.arorms.prp.society.services;

import cn.arorms.prp.society.dtos.MembershipDto;
import cn.arorms.prp.society.dtos.MembershipResponse;
import cn.arorms.prp.society.entities.Membership;
import cn.arorms.prp.society.entities.MembershipExtendField;
import cn.arorms.prp.society.entities.Organization;
import cn.arorms.prp.society.entities.Person;
import cn.arorms.prp.society.repositories.MembershipFieldRepository;
import cn.arorms.prp.society.repositories.MembershipRepository;
import cn.arorms.prp.society.repositories.OrganizationRepository;
import cn.arorms.prp.society.repositories.PersonRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MembershipService {
    private final MembershipRepository membershipRepository;
    private final PersonRepository personRepository;
    private final OrganizationRepository organizationRepository;
    private final MembershipFieldRepository membershipFieldRepository;

    public MembershipService(
            MembershipRepository membershipRepository,
            PersonRepository personRepository,
            OrganizationRepository organizationRepository,
            MembershipFieldRepository membershipFieldRepository
    ) {
        this.membershipRepository = membershipRepository;
        this.personRepository = personRepository;
        this.organizationRepository = organizationRepository;
        this.membershipFieldRepository = membershipFieldRepository;
    }

    @Transactional(readOnly = true)
    public Page<MembershipResponse> list(
            String userId,
            Long personId,
            Long organizationId,
            String query,
            Pageable pageable
    ) {
        Pageable sorted = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Order.desc("createdAt")));
        String q = blankToNull(query);
        return membershipRepository.search(userId, personId, organizationId, q, sorted)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public MembershipResponse get(String userId, Long id) {
        return toResponse(mustOwn(userId, id));
    }

    @Transactional
    public MembershipResponse create(String userId, MembershipDto request) {
        Person person = mustOwnPerson(userId, request.getPersonId());
        Organization organization = mustOwnOrganization(userId, request.getOrganizationId());
        Membership membership = new Membership();
        membership.setPerson(person);
        membership.setOrganization(organization);
        membership.setNote(request.getNote());
        membership.setExtendJson(normalizeValues(organization, request.getExtendJson()));
        return toResponse(membershipRepository.save(membership));
    }

    @Transactional
    public MembershipResponse update(String userId, Long id, MembershipDto request) {
        Membership membership = mustOwn(userId, id);
        Person person = mustOwnPerson(userId, request.getPersonId());
        Organization organization = mustOwnOrganization(userId, request.getOrganizationId());
        membership.setPerson(person);
        membership.setOrganization(organization);
        membership.setNote(request.getNote());
        membership.setExtendJson(normalizeValues(organization, request.getExtendJson()));
        return toResponse(membershipRepository.save(membership));
    }

    @Transactional
    public void delete(String userId, Long id) {
        membershipRepository.delete(mustOwn(userId, id));
    }

    private Membership mustOwn(String userId, Long id) {
        Membership membership = membershipRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Membership not found"));
        String personUserId = membership.getPerson().getUserId();
        String organizationUserId = membership.getOrganization().getUserId();
        if (!userId.equals(personUserId) || !userId.equals(organizationUserId)) {
            throw new NoSuchElementException("Membership not found");
        }
        return membership;
    }

    private Person mustOwnPerson(String userId, Long id) {
        return personRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Person not found"));
    }

    private Organization mustOwnOrganization(String userId, Long id) {
        return organizationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Organization not found"));
    }

    private Map<String, Object> normalizeValues(Organization organization, Map<String, Object> values) {
        Map<String, Object> input = values == null ? Map.of() : values;
        List<MembershipExtendField> fields = membershipFieldRepository
                .findByOrganization_IdOrderBySortOrderAscIdAsc(organization.getId());
        Set<String> allowedKeys = fields.stream()
                .map(MembershipExtendField::getFieldKey)
                .collect(Collectors.toSet());
        Map<String, Object> normalized = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : input.entrySet()) {
            if (!allowedKeys.contains(entry.getKey())) {
                throw new IllegalArgumentException("Unknown membership field: " + entry.getKey());
            }
            normalized.put(entry.getKey(), entry.getValue());
        }
        return normalized;
    }

    private MembershipResponse toResponse(Membership membership) {
        return MembershipResponse.builder()
                .id(membership.getId())
                .personId(membership.getPerson().getId())
                .personName(membership.getPerson().getName())
                .organizationId(membership.getOrganization().getId())
                .organizationName(membership.getOrganization().getName())
                .note(membership.getNote())
                .extendJson(membership.getExtendJson())
                .createdAt(membership.getCreatedAt())
                .updatedAt(membership.getUpdatedAt())
                .build();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
