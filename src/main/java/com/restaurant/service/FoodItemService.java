package com.restaurant.service;

import java.util.List;

import com.restaurant.dto.FoodItemDto;

public interface FoodItemService {
	FoodItemDto addFoodItem(FoodItemDto foodItemDto);

	FoodItemDto getFoodItemById(Long id);

	List<FoodItemDto> getAllFoodItems();

	List<FoodItemDto> getFoodItemsByCategory(Long categoryId);

	List<FoodItemDto> getVegFoodItems();

	FoodItemDto updateFoodItem(Long id, FoodItemDto foodItemDto);

	void deleteFoodItem(Long id);
}
