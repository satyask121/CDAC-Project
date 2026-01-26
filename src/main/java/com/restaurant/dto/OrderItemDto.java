package com.restaurant.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemDto {

    @NotNull
    private Long foodItemId;

    @NotNull
    private Integer quantity;
}
