package com.restaurant.dto;

import java.time.LocalDateTime;

import com.restaurant.entity.PaymentMethod;
import com.restaurant.entity.PaymentStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentResponseDto {

    private Long paymentId;
    private Long orderId;
    private Double amount;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private String transactionReference;
    private LocalDateTime paidAt;
}
