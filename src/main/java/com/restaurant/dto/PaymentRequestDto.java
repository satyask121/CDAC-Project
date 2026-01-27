package com.restaurant.dto;

import com.restaurant.entity.PaymentMethod;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRequestDto {

    @NotNull
    private Long orderId;

    @NotNull
    private PaymentMethod paymentMethod;
}
