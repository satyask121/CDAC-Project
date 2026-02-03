package com.restaurant.service;

import java.util.List;

import com.restaurant.dto.OrderRequestDto;
import com.restaurant.dto.OrderResponseDto;
import com.restaurant.entity.OrderStatus;

public interface OrderService {

	OrderResponseDto createOrder(OrderRequestDto orderRequestDto);

	OrderResponseDto getOrderById(Long orderId);
	
	List<OrderResponseDto> getOrdersByUser(Long userId);
	
	OrderResponseDto updateOrderStatus(Long orderId , OrderStatus status);
	
	List<OrderResponseDto> getAllOrders();
	
}
