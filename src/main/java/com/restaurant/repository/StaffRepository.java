package com.restaurant.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.restaurant.entity.Staff;

public interface StaffRepository extends JpaRepository<Staff, Long> {

}
