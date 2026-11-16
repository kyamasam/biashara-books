"use client";

import { useEffect } from "react";
import {
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
} from "antd";
import { useVehiclesStore } from "@/store/vehicles-store";
import type { Vehicle } from "@/types/motor";

interface VehicleFormModalProps {
  open: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
}

export function VehicleFormModal({ open, onClose, vehicle }: VehicleFormModalProps) {
  const [form] = Form.useForm();
  const selectedMakeId = Form.useWatch("vehicle_make_id", form);

  const {
    vehicleClasses,
    vehicleMakes,
    vehicleModels,
    isMutating,
    fetchVehicleClasses,
    fetchVehicleMakes,
    fetchVehicleModels,
    createVehicle,
    updateVehicle,
    fetchVehicles,
  } = useVehiclesStore();

  const isEdit = !!vehicle;

  useEffect(() => {
    if (!open) return;
    fetchVehicleClasses();
    fetchVehicleMakes();
  }, [open, fetchVehicleClasses, fetchVehicleMakes]);

  useEffect(() => {
    if (open) fetchVehicleModels(selectedMakeId ?? null);
  }, [open, selectedMakeId, fetchVehicleModels]);

  useEffect(() => {
    if (!open) return;
    if (vehicle) {
      form.setFieldsValue({
        registration_no: vehicle.registration_no,
        chassis_no: vehicle.chassis_no,
        engine_no: vehicle.engine_no,
        year_of_manufacture: vehicle.year_of_manufacture,
        engine_cc: vehicle.engine_cc,
        seats: vehicle.seats,
        tonnage: vehicle.tonnage ? Number(vehicle.tonnage) : null,
        has_tracker: vehicle.has_tracker,
        colour: vehicle.colour,
        vehicle_make_id: vehicle.vehicle_model?.vehicle_make?.id,
        vehicle_model_id: vehicle.vehicle_model?.id,
        vehicle_class_id: vehicle.vehicle_class?.id,
      });
    } else {
      form.resetFields();
    }
  }, [open, vehicle, form]);

  const handleMakeChange = () => {
    form.setFieldValue("vehicle_model_id", undefined);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const { vehicle_make_id: _make, ...payload } = values;

    if (isEdit) {
      await updateVehicle(vehicle.id, payload);
    } else {
      await createVehicle(payload);
    }
    await fetchVehicles();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={isEdit ? "Save Changes" : "Add Vehicle"}
      confirmLoading={isMutating}
      title={isEdit ? "Edit Vehicle" : "Add Vehicle"}
      width={700}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="registration_no"
              label="Registration No"
              rules={[{ required: true, message: "Registration number is required" }]}
            >
              <Input placeholder="e.g. KAA 123A" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="year_of_manufacture"
              label="Year of Manufacture"
              rules={[{ required: true, message: "Year is required" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="e.g. 2020"
                min={1900}
                max={new Date().getFullYear() + 1}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="vehicle_make_id" label="Make">
              <Select
                placeholder="Select make"
                allowClear
                showSearch
                optionFilterProp="label"
                onChange={handleMakeChange}
                options={vehicleMakes.map((m) => ({ value: m.id, label: m.name }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="vehicle_model_id" label="Model">
              <Select
                placeholder={selectedMakeId ? "Select model" : "Select a make first"}
                allowClear
                showSearch
                optionFilterProp="label"
                disabled={!selectedMakeId}
                options={vehicleModels.map((m) => ({ value: m.id, label: m.name }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="vehicle_class_id" label="Vehicle Class">
              <Select
                placeholder="Select class"
                allowClear
                showSearch
                optionFilterProp="label"
                options={vehicleClasses.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="colour" label="Colour">
              <Input placeholder="e.g. White" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="chassis_no" label="Chassis No">
              <Input placeholder="Chassis number" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="engine_no" label="Engine No">
              <Input placeholder="Engine number" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="engine_cc" label="Engine CC">
              <InputNumber style={{ width: "100%" }} placeholder="e.g. 1500" min={0} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="seats" label="Seats">
              <InputNumber style={{ width: "100%" }} placeholder="e.g. 5" min={1} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="tonnage" label="Tonnage">
              <InputNumber style={{ width: "100%" }} placeholder="e.g. 1.5" min={0} step={0.1} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="has_tracker" valuePropName="checked">
              <Checkbox>Vehicle has tracker</Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
