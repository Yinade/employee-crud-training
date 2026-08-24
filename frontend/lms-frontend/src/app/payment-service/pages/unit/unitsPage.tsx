import React, { useState } from "react";
import { UnitsTable } from "../../modules/unit/unitsTable";
import UnitsFormModal from "../../modules/unit/unitsFormModal";
import { Unit } from "../../models/unit.model";
const UnitsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | undefined>(undefined);

  const handleAdd = () => {
    setSelectedUnit(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUnit(undefined);
  };

  return (
    <div className="container-fluid">
      <UnitsTable
        className="mb-5 mb-xl-8"
        onAdd={handleAdd}
        onEdit={handleEdit}
        errorMessage={null}
      />
      <UnitsFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        unitData={selectedUnit}
      />
    </div>
  );
};

export default UnitsPage;
