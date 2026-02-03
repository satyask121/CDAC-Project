package com.restaurant.controller;

import java.util.List;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.restaurant.dto.FoodItemDto;
import com.restaurant.service.FoodItemService;

@RestController
@RequestMapping("/api/food-items")
@AllArgsConstructor
public class FoodItemController {

    private final FoodItemService foodItemService;

    
    // Add food item
    @PostMapping
    public ResponseEntity<FoodItemDto> addFoodItem(
            @Valid @RequestBody FoodItemDto foodItemDto) {

        return new ResponseEntity<>(
                foodItemService.addFoodItem(foodItemDto),
                HttpStatus.CREATED
        );
    }

    // Get food item by id
    @GetMapping("/{id}")
    public ResponseEntity<FoodItemDto> getFoodItemById(@PathVariable Long id) {
        return ResponseEntity.ok(foodItemService.getFoodItemById(id));
    }

    // Get all food items
    @GetMapping
    public ResponseEntity<List<FoodItemDto>> getAllFoodItems() {
        return ResponseEntity.ok(foodItemService.getAllFoodItems());
    }

    // Get food items by category
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<FoodItemDto>> getFoodItemsByCategory(
            @PathVariable Long categoryId) {

        return ResponseEntity.ok(
                foodItemService.getFoodItemsByCategory(categoryId)
        );
    }

    // Get veg food items
    @GetMapping("/veg")
    public ResponseEntity<List<FoodItemDto>> getVegFoodItems() {
        return ResponseEntity.ok(foodItemService.getVegFoodItems());
    }

    // Update food item
    @PutMapping("/{id}")
    public ResponseEntity<FoodItemDto> updateFoodItem(
            @PathVariable Long id,
            @Valid @RequestBody FoodItemDto foodItemDto) {

        return ResponseEntity.ok(
                foodItemService.updateFoodItem(id, foodItemDto)
        );
    }

    // Delete food item
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoodItem(@PathVariable Long id) {
        foodItemService.deleteFoodItem(id);
        return ResponseEntity.noContent().build();
    }
}
