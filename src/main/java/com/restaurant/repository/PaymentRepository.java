package com.restaurant.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.restaurant.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment,Long> {

	 // To prevent duplicate payment for same order
    Optional<Payment> findByOrderId(Long orderId);
}
