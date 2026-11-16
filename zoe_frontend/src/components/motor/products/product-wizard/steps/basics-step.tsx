"use client";

import { Col, Form, Input, Row, Switch } from "antd";
import { BandTypeCards } from "../fields/band-type-cards";
import { CoverTypeSelect } from "../fields/cover-type-select";
import { InsurerSelect } from "../fields/insurer-select";
import { VehicleClassSelect } from "../fields/vehicle-class-select";

export function BasicsStep() {
  return (
    <>
      <Form.Item
        label="Product name"
        name="name"
        rules={[
          { required: true, whitespace: true, message: "Enter a product name" },
          { max: 255, message: "Keep it under 255 characters" },
        ]}
      >
        <Input size="large" placeholder="Private comprehensive" />
      </Form.Item>
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item label="Insurer" name="insurer" rules={[{ required: true, message: "Select an insurer" }]}>
            <InsurerSelect />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="Vehicle class"
            name="vehicle_class"
            rules={[{ required: true, message: "Select a vehicle class" }]}
          >
            <VehicleClassSelect />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="Cover type"
            name="cover_type"
            rules={[{ required: true, message: "Select a cover type" }]}
          >
            <CoverTypeSelect />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        label="Price bands by"
        name="band_type"
        rules={[{ required: true, message: "Choose how bands are measured" }]}
      >
        <BandTypeCards />
      </Form.Item>
      <Form.Item label="Active" name="is_active" valuePropName="checked">
        <Switch />
      </Form.Item>
    </>
  );
}
