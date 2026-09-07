package cn.arorms.prp.society.services;

import cn.arorms.prp.society.dtos.MembershipFieldDto;
import cn.arorms.prp.society.dtos.MembershipFieldResponse;
import cn.arorms.prp.society.entities.MembershipExtendField;
import cn.arorms.prp.society.entities.Organization;
import cn.arorms.prp.society.repositories.MembershipFieldRepository;
import cn.arorms.prp.society.repositories.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class MembershipFieldService {
    private final MembershipFieldRepository membershipFieldRepository;
    private final OrganizationRepository organizationRepository;

    public MembershipFieldService(
            MembershipFieldRepository membershipFieldRepository,
            OrganizationRepository organizationRepository
    ) {
        this.membershipFieldRepository = membershipFieldRepository;
        this.organizationRepository = organizationRepository;
    }

    @Transactional(readOnly = true)
    public List<MembershipFieldResponse> list(String userId, Long organizationId) {
        return membershipFieldRepository
                .findByOrganization_IdOrderBySortOrderAscIdAsc(mustOwnOrganization(userId, organizationId).getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MembershipFieldResponse> listAll(String userId) {
        return membershipFieldRepository
                .findByOrganization_UserIdOrderByOrganization_NameAscSortOrderAscIdAsc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MembershipFieldResponse create(String userId, Long organizationId, MembershipFieldDto request) {
        Organization organization = mustOwnOrganization(userId, organizationId);
        if (membershipFieldRepository.existsByOrganizationAndFieldKeyIgnoreCase(organization, request.getFieldKey())) {
            throw new IllegalArgumentException("Field key already exists for this organization");
        }
        MembershipExtendField field = new MembershipExtendField();
        field.setOrganization(organization);
        applyValues(field, request);
        return toResponse(membershipFieldRepository.save(field));
    }

    @Transactional
    public MembershipFieldResponse update(String userId, Long organizationId, Long id, MembershipFieldDto request) {
        Organization organization = mustOwnOrganization(userId, organizationId);
        MembershipExtendField field = membershipFieldRepository.findByIdAndOrganization_UserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Membership field not found"));
        if (!field.getOrganization().getId().equals(organization.getId())) {
            throw new NoSuchElementException("Membership field not found");
        }
        if (membershipFieldRepository
                .existsByOrganizationAndFieldKeyIgnoreCaseAndIdNot(organization, request.getFieldKey(), id)) {
            throw new IllegalArgumentException("Field key already exists for this organization");
        }
        applyValues(field, request);
        return toResponse(membershipFieldRepository.save(field));
    }

    @Transactional
    public void delete(String userId, Long organizationId, Long id) {
        mustOwnOrganization(userId, organizationId);
        MembershipExtendField field = membershipFieldRepository.findByIdAndOrganization_UserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Membership field not found"));
        membershipFieldRepository.delete(field);
    }

    private Organization mustOwnOrganization(String userId, Long id) {
        return organizationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NoSuchElementException("Organization not found"));
    }

    private void applyValues(MembershipExtendField field, MembershipFieldDto request) {
        field.setFieldKey(request.getFieldKey());
        field.setFieldName(request.getFieldName());
        field.setFieldValue(request.getFieldValue());
        field.setSortOrder(request.getSortOrder() == null ? 0 : request.getSortOrder());
    }

    private MembershipFieldResponse toResponse(MembershipExtendField field) {
        return MembershipFieldResponse.builder()
                .id(field.getId())
                .organizationId(field.getOrganization().getId())
                .organizationName(field.getOrganization().getName())
                .fieldKey(field.getFieldKey())
                .fieldName(field.getFieldName())
                .fieldValue(field.getFieldValue())
                .sortOrder(field.getSortOrder())
                .createdAt(field.getCreatedAt())
                .updatedAt(field.getUpdatedAt())
                .build();
    }
}
