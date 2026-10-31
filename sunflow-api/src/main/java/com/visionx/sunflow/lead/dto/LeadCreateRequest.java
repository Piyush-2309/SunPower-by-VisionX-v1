package com.visionx.sunflow.lead.dto;

import com.visionx.sunflow.lead.EnquiryChannel;
import com.visionx.sunflow.lead.PropertyType;
import com.visionx.sunflow.lead.SystemType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record LeadCreateRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 200, message = "Full name must not exceed 200 characters")
        String fullName,

        @NotBlank(message = "Phone number is required")
        @Size(max = 20, message = "Phone number must not exceed 20 characters")
        String phone,

        @Email(message = "Invalid email format")
        @Size(max = 255)
        String email,

        @Size(max = 500)
        String address,

        @Size(max = 100)
        String city,

        PropertyType propertyType,

        @Positive(message = "Requested capacity must be positive")
        BigDecimal requestedCapacityKw,

        SystemType systemType,

        @Positive(message = "Monthly bill must be positive")
        BigDecimal monthlyBill,

        @Positive(message = "Roof area must be positive")
        BigDecimal roofAreaSqft,

        @Size(max = 30)
        String preferredLanguage,

        Boolean subsidyInterest,

        EnquiryChannel channel,

        @Size(max = 500)
        String qualificationNotes
) {}
