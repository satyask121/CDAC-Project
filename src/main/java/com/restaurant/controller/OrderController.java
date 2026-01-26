package com.restaurant.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.dto.OrderRequestDto;
import com.restaurant.entity.OrderStatus;
import com.restaurant.service.OrderService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@AllArgsConstructor

public class OrderController {

	private final OrderService orderService;

	//add order
	@PostMapping
	public ResponseEntity<?> createOrder(@Valid @RequestBody OrderRequestDto dto) {
		return new ResponseEntity<>(orderService.createOrder(dto), HttpStatus.CREATED);
	}
	
	// get order by id
	 @GetMapping("/{orderId}")
	
		
	public ResponseEntity<?> getOrderById(@PathVariable Long orderId) {
		return ResponseEntity.ok(orderService.getOrderById(orderId));
	}
	 
	 //get orders by user
	 @GetMapping("/user/{userId}")
	 public ResponseEntity<?> getOrdersByUser(@PathVariable Long userId){
		 return ResponseEntity.ok(orderService.getOrdersByUser(userId));
	 }
	
	//update order status
 @PutMapping("/{orderId}/status")
 public ResponseEntity<?> updateOrderStatus (@PathVariable Long orderId , @RequestParam OrderStatus status ){
	 return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
 }
}
