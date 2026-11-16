"use client";

import { Modal, Typography } from "antd";
import { useVehiclesStore } from "@/store/vehicles-store";
import type { Vehicle } from "@/types/motor";

interface VehicleDeleteModalProps {
  open: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}

export function VehicleDeleteModal({ open, onClose, vehicle }: VehicleDeleteModalProps) {
  const { isMutating, deleteVehicle, fetchVehicles } = useVehiclesStore();

  const handleConfirm = async () => {
    if (!vehicle) return;
    await deleteVehicle(vehicle.id);
    await fetchVehicles();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleConfirm}
      okText="Delete"
      okButtonProps={{ danger: true, loading: isMutating }}
      title="Delete Vehicle"
      destroyOnHidden
    >
      <Typography.Text>
        Are you sure you want to delete vehicle{" "}
        <Typography.Text strong>{vehicle?.registration_no}</Typography.Text>? This action cannot be undone.
      </Typography.Text>
    </Modal>
  );
}
