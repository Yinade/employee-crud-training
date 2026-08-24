package com.lms_payment_service.lms_payment_service.services;


import com.lms_payment_service.lms_payment_service.dtos.units.UnitsDto;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface UnitService {

    public List<UnitsDto> getAllUnits();
    public UnitsDto createUnit(UnitsDto data);

    public UnitsDto updateUnit(Long id, UnitsDto data);
    public void deleteUnit(Long id);

}