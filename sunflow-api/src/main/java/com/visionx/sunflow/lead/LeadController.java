package com.visionx.sunflow.lead;

import com.visionx.sunflow.lead.dto.LeadCreateRequest;
import com.visionx.sunflow.lead.dto.LeadResponse;
import com.visionx.sunflow.lead.dto.LeadStatusUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/leads")
@Tag(name = "Leads", description = "Lead management endpoints")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @PostMapping
    @Operation(summary = "Create a new lead from an enquiry")
    public ResponseEntity<LeadResponse> createLead(@Valid @RequestBody LeadCreateRequest request) {
        LeadResponse response = leadService.createLead(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "List leads with optional filters and pagination")
    public ResponseEntity<Page<LeadResponse>> getLeads(
            @RequestParam(required = false) LeadStatus status,
            @RequestParam(required = false) EnquiryChannel channel,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        Page<LeadResponse> leads = leadService.getLeads(status, channel, search, pageable);
        return ResponseEntity.ok(leads);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a lead by ID")
    public ResponseEntity<LeadResponse> getLeadById(@PathVariable UUID id) {
        LeadResponse response = leadService.getLeadById(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update a lead's status")
    public ResponseEntity<LeadResponse> updateLeadStatus(
            @PathVariable UUID id,
            @Valid @RequestBody LeadStatusUpdateRequest request) {
        LeadResponse response = leadService.updateLeadStatus(id, request);
        return ResponseEntity.ok(response);
    }
}
