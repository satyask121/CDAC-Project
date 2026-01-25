package com.restaurant.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.restaurant.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

}
