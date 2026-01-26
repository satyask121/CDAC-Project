package com.restaurant.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemDetailsDto {

    private Long foodItemId;
    private String foodName;
    private Integer quantity;
    private Double unitPrice;
    private Double subTotal;
}
