package com.restaurant.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "food_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FoodItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String name;

	
	private String description;

	private Double price;

	@Column(nullable = false)
	private Boolean isVeg;

	@Column(nullable = false)
	private Boolean isAvailable;

	@Column(nullable = false)
	private String imageUrl;

	@ManyToOne
	@JoinColumn(name = "category_id")
	private FoodCategory category;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

}
