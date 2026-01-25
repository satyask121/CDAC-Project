package com.restaurant.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.restaurant.dto.FoodCategoryDto;
import com.restaurant.service.FoodCategoryService;

@RestController
@RequestMapping("/api/categories")
public class FoodCategoryController {

    private final FoodCategoryService categoryService;

    public FoodCategoryController(FoodCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Create category
    @PostMapping
    public ResponseEntity<FoodCategoryDto> createCategory(
            @Valid @RequestBody FoodCategoryDto categoryDto) {

        FoodCategoryDto savedCategory =
                categoryService.createCategory(categoryDto);

        return new ResponseEntity<>(savedCategory, HttpStatus.CREATED);
    }

    // Get category by id
    @GetMapping("/{id}")
    public ResponseEntity<FoodCategoryDto> getCategoryById(
            @PathVariable Long id) {

        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    // Get all categories
    @GetMapping
    public ResponseEntity<List<FoodCategoryDto>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    // Update category
    @PutMapping("/{id}")
    public ResponseEntity<FoodCategoryDto> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody FoodCategoryDto categoryDto) {

        return ResponseEntity.ok(
                categoryService.updateCategory(id, categoryDto));
    }

    // Delete category
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
