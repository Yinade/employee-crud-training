package com.lms_payment_service.lms_payment_service.services.impl;

import com.lms_payment_service.lms_payment_service.dtos.units.UnitsDto;
import com.lms_payment_service.lms_payment_service.entities.Unit;
import com.lms_payment_service.lms_payment_service.repositories.UnitRepository;
import com.lms_payment_service.lms_payment_service.services.UnitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UnitServiceImpl implements UnitService {

    @Autowired
    private UnitRepository unitRepository;

    public List<UnitsDto> getAllUnits() {
        return unitRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public UnitsDto createUnit(UnitsDto data) {
        Unit entity = new Unit();
        entity.setName(data.getName());
        entity.setDescription(data.getDescription());
        entity.setDescription(data.getDescription());
        Unit saved = unitRepository.save(entity);
        return toDto(saved);
    }

    @Override
    public UnitsDto updateUnit(Long id, UnitsDto data) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Unit not found with id: " + id));
        unit.setName(data.getName());
        unit.setDescription(data.getDescription());
        Unit updated = unitRepository.save(unit);
        return toDto(updated);
    }

    @Override
    public void deleteUnit(Long id) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Unit not found with id: " + id));
        unitRepository.delete(unit);
    }



    private UnitsDto toDto(Unit unit) {
        UnitsDto dto = new UnitsDto();
        dto.setId(unit.getId());
        dto.setName(unit.getName());
        dto.setDescription(unit.getDescription());
        return dto;
    }


}