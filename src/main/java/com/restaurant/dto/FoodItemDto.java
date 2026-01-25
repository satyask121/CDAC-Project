package com.restaurant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FoodItemDto {

    private Long id;

    @NotBlank(message = "Food name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Price is required")
    private Double price;

    @NotNull(message = "Veg/Non-veg info is required")
    private Boolean isVeg;

    private Boolean isAvailable;

    @NotBlank(message = "Image URL is required")
    private String imageurl;

    @NotNull(message = "Category ID is required")
    private Long categoryId;
}
