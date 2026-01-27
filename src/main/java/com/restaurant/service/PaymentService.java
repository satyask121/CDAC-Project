package com.restaurant.service;

import com.restaurant.dto.PaymentRequestDto;
import com.restaurant.dto.PaymentResponseDto;

public interface PaymentService {

    PaymentResponseDto makePayment(PaymentRequestDto dto);

    PaymentResponseDto getPaymentByOrderId(Long orderId);
}
