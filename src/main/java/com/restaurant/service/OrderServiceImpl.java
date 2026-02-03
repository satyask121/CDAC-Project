package com.restaurant.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurant.dto.OrderItemDetailsDto;
import com.restaurant.dto.OrderItemDto;
import com.restaurant.dto.OrderRequestDto;
import com.restaurant.dto.OrderResponseDto;
import com.restaurant.entity.FoodItem;
import com.restaurant.entity.Order;
import com.restaurant.entity.OrderItem;
import com.restaurant.entity.OrderStatus;
import com.restaurant.entity.User;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.FoodItemRepository;
import com.restaurant.repository.OrderItemRepository;
import com.restaurant.repository.OrderRepository;
import com.restaurant.repository.UserRepository;

import lombok.AllArgsConstructor;

@Service
@Transactional
@AllArgsConstructor
public class OrderServiceImpl implements OrderService {



	private final OrderRepository orderRepository;
	private final OrderItemRepository orderItemRepository;
	private final UserRepository userRepository;
	private final FoodItemRepository foodItemRepository;
	

	@Override
	public OrderResponseDto createOrder(OrderRequestDto dto) {

		User user = userRepository.findById(dto.getUserId())
				.orElseThrow(() -> new ResourceNotFoundException("User not found with id : " + dto.getUserId()));

		Order order = new Order();
		order.setOrderType(dto.getOrderType());
		order.setTableNumber(dto.getTableNumber());
		order.setStatus(OrderStatus.RECEIVED);
		//order.setCreatedAt(LocalDateTime.now());
		order.setUser(user);
		Order savedOrder = orderRepository.save(order);

		double totalAmount = 0;

		for (OrderItemDto itemDto : dto.getItems()) {

			FoodItem foodItem = foodItemRepository.findById(itemDto.getFoodItemId()).orElseThrow(
					() -> new ResourceNotFoundException("Food item not found with id : " + itemDto.getFoodItemId()));

			OrderItem orderItem = new OrderItem();
			orderItem.setOrder(savedOrder);
			orderItem.setFoodItem(foodItem);
			orderItem.setQuantity(itemDto.getQuantity());
			orderItem.setUnitPrice(foodItem.getPrice());

			double subTotal = foodItem.getPrice() * itemDto.getQuantity();
			orderItem.setSubTotal(subTotal);

			totalAmount += subTotal;
			orderItemRepository.save(orderItem);
		}

		savedOrder.setTotalAmount(totalAmount);
		orderRepository.save(savedOrder);

		return getOrderById(savedOrder.getId());
	}

	@Override
	public OrderResponseDto getOrderById(Long orderId) {
		Order order = orderRepository.findById(orderId)
				.orElseThrow(() -> new ResourceNotFoundException("Order Not Found with id :" + orderId));

		List<OrderItemDetailsDto> items = order.getId() == null ? List.of()
				: orderItemRepository.findAll().stream().filter(o -> o.getOrder().getId().equals(orderId)).map(oi -> {
					OrderItemDetailsDto dto = new OrderItemDetailsDto();
					dto.setFoodItemId(oi.getFoodItem().getId());
					dto.setFoodName(oi.getFoodItem().getName());
					dto.setQuantity(oi.getQuantity());
					dto.setUnitPrice(oi.getUnitPrice());
					dto.setSubTotal(oi.getSubTotal());
					return dto;
				}).collect(Collectors.toList());

		OrderResponseDto response = new OrderResponseDto();
		response.setOrderId(order.getId());
		response.setStatus(order.getStatus());
		response.setTotalAmount(order.getTotalAmount());
		response.setCreatedAt(order.getCreatedAt());
		response.setItems(items);
		return response;
	}

	@Override
	public List<OrderResponseDto> getOrdersByUser(Long userId) {

		return orderRepository.findByUserId(userId).stream().map(order -> getOrderById(order.getId()))
				.collect(Collectors.toList());
	}
	
	@Override
	public List<OrderResponseDto> getAllOrders() {
		// Reuse getOrderById to build full response with items
		return orderRepository.findAll().stream()
				.map(order -> getOrderById(order.getId()))
				.collect(Collectors.toList());
	}

	@Override
	public OrderResponseDto updateOrderStatus(Long orderId, OrderStatus status) {
		Order order = orderRepository.findById(orderId)
				.orElseThrow(() -> new ResourceNotFoundException("Order not found with id :" + orderId));

		order.setStatus(status);
		orderRepository.save(order);

		return getOrderById(orderId);
	}
	
}
