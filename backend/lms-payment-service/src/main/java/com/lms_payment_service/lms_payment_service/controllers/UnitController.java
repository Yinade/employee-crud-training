package com.lms_payment_service.lms_payment_service.controllers;


import com.lms_payment_service.lms_payment_service.dtos.units.UnitsDto;
import com.lms_payment_service.lms_payment_service.services.UnitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/Api/v1/payment-service/units")
@CrossOrigin(origins = "http://localhost:5173")
public class UnitController {

    @Autowired
    private UnitService unitService;

    @GetMapping
    public ResponseEntity<List<UnitsDto>> getAllUnits() {
        return ResponseEntity.ok(unitService.getAllUnits());
    }

    @PostMapping
    public ResponseEntity<UnitsDto> createUnit(@RequestBody UnitsDto unitsDto) {
        return ResponseEntity.ok(unitService.createUnit(unitsDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UnitsDto> updateUnit(@PathVariable Long id, @RequestBody UnitsDto unitsDto) {
        return ResponseEntity.ok(unitService.updateUnit(id, unitsDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUnit(@PathVariable Long id) {
        unitService.deleteUnit(id);
        return ResponseEntity.noContent().build();
    }


}
