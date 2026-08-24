package com.lms_payment_service.lms_payment_service.entities;
import jakarta.persistence.*; @Entity @Table(name = "units")
public class Unit {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; @Column(nullable = false, length = 50)
    private String name; @Column(nullable = true, length = 255)
    private String description; public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; } }