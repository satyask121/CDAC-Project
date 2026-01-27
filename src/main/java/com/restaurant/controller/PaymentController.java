package com.restaurant.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.restaurant.dto.PaymentRequestDto;
import com.restaurant.service.PaymentService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@AllArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // Make payment for an order
    @PostMapping
    public ResponseEntity<?> makePayment(@Valid @RequestBody PaymentRequestDto dto) {
        return new ResponseEntity<>(paymentService.makePayment(dto), HttpStatus.CREATED);
    }

    // Get payment details by order id
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getPaymentByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId));
    }
}
