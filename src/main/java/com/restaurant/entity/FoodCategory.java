package com.restaurant.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "food_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FoodCategory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

	 @Column(nullable = false)
private String name ;

	 @Column(nullable = false)
private String description;

	 
private Integer displayOrder;

private Boolean isActive;

}
