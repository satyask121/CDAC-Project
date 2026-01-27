package com.restaurant.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurant.dto.PaymentRequestDto;
import com.restaurant.dto.PaymentResponseDto;
import com.restaurant.entity.Order;
import com.restaurant.entity.Payment;
import com.restaurant.entity.PaymentStatus;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.OrderRepository;
import com.restaurant.repository.PaymentRepository;

import lombok.AllArgsConstructor;

@Service
@Transactional
@AllArgsConstructor
public class PaymentServiceImpl implements PaymentService {

	private final PaymentRepository paymentRepository;
	private final OrderRepository orderRepository;

	@Override
	public PaymentResponseDto makePayment(PaymentRequestDto dto) {

		Order order = orderRepository.findById(dto.getOrderId())
				.orElseThrow(() -> new ResourceNotFoundException("Order not found with id : " + dto.getOrderId()));

		// Prevent duplicate payment
		paymentRepository.findByOrderId(order.getId()).ifPresent(p -> {
			throw new IllegalStateException("Payment already done for this order");
		});

		Payment payment = new Payment();
		payment.setOrder(order);
		payment.setAmount(order.getTotalAmount());
		payment.setPaymentMethod(dto.getPaymentMethod());
		payment.setStatus(PaymentStatus.SUCCESS); // simplified
		payment.setTransactionReference(UUID.randomUUID().toString());

		Payment saved = paymentRepository.save(payment);

		return mapToResponse(saved);
	}

	@Override
	public PaymentResponseDto getPaymentByOrderId(Long orderId) {

		Payment payment = paymentRepository.findByOrderId(orderId)
				.orElseThrow(() -> new ResourceNotFoundException("Payment not found for order id : " + orderId));

		return mapToResponse(payment);
	}

	// Simple manual mapper (clear & readable)
	private PaymentResponseDto mapToResponse(Payment payment) {
		PaymentResponseDto dto = new PaymentResponseDto();
		dto.setPaymentId(payment.getId());
		dto.setOrderId(payment.getOrder().getId());
		dto.setAmount(payment.getAmount());
		dto.setPaymentMethod(payment.getPaymentMethod());
		dto.setStatus(payment.getStatus());
		dto.setTransactionReference(payment.getTransactionReference());
		dto.setPaidAt(payment.getPaidAt());
		return dto;
	}
}
