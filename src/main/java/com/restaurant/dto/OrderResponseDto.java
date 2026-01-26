package com.restaurant.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.restaurant.entity.OrderStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderResponseDto {

    private Long orderId;
    private OrderStatus status;
    private Double totalAmount;
    private LocalDateTime createdAt;
    private List<OrderItemDetailsDto> items;
}
