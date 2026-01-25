package com.restaurant.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.restaurant.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment,Long> {

}
