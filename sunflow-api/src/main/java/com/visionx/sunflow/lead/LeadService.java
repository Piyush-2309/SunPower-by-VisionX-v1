package com.visionx.sunflow.lead;

import com.visionx.sunflow.common.exception.ResourceNotFoundException;
import com.visionx.sunflow.lead.dto.LeadCreateRequest;
import com.visionx.sunflow.lead.dto.LeadResponse;
import com.visionx.sunflow.lead.dto.LeadStatusUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class LeadService {

    private final LeadRepository leadRepository;

    public LeadService(LeadRepository leadRepository) {
        this.leadRepository = leadRepository;
    }

    @Transactional
    public LeadResponse createLead(LeadCreateRequest request) {
        Lead lead = new Lead();
        lead.setFullName(request.fullName().trim());
        lead.setPhone(request.phone().trim());
        lead.setEmail(request.email());
        lead.setAddress(request.address());
        lead.setCity(request.city());
        lead.setPropertyType(request.propertyType() != null ? request.propertyType() : PropertyType.RESIDENTIAL);
        lead.setRequestedCapacityKw(request.requestedCapacityKw());
        lead.setSystemType(request.systemType());
        lead.setMonthlyBill(request.monthlyBill());
        lead.setRoofAreaSqft(request.roofAreaSqft());
        lead.setPreferredLanguage(request.preferredLanguage());
        lead.setSubsidyInterest(request.subsidyInterest() != null ? request.subsidyInterest() : false);
        lead.setChannel(request.channel() != null ? request.channel() : EnquiryChannel.WEB_FORM);
        lead.setStatus(LeadStatus.NEW);
        lead.setQualificationNotes(request.qualificationNotes());

        Lead saved = leadRepository.save(lead);
        return LeadResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<LeadResponse> getLeads(LeadStatus status, EnquiryChannel channel,
                                       String search, Pageable pageable) {
        Page<Lead> leads;

        if (search != null && !search.isBlank()) {
            leads = leadRepository.searchByNameOrPhone(search.trim(), pageable);
        } else if (status != null && channel != null) {
            leads = leadRepository.findByStatusAndChannel(status, channel, pageable);
        } else if (status != null) {
            leads = leadRepository.findByStatus(status, pageable);
        } else if (channel != null) {
            leads = leadRepository.findByChannel(channel, pageable);
        } else {
            leads = leadRepository.findAll(pageable);
        }

        return leads.map(LeadResponse::from);
    }

    @Transactional(readOnly = true)
    public LeadResponse getLeadById(UUID id) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead", id));
        return LeadResponse.from(lead);
    }

    @Transactional
    public LeadResponse updateLeadStatus(UUID id, LeadStatusUpdateRequest request) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead", id));

        lead.setStatus(request.status());
        Lead updated = leadRepository.save(lead);
        return LeadResponse.from(updated);
    }
}
