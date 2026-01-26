package com.restaurant.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderRequestDto {

    @NotNull
    private Long userId;

    private String orderType;   // DINE_IN / TAKEAWAY

    private String tableNumber;

    @NotEmpty
    private List<OrderItemDto> items;
}
