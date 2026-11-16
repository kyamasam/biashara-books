"use client";

import { Button, Card, Col, Form, Row } from "antd";
import { Trash2 } from "lucide-react";
import type { ExtraChargeCode } from "@/types/motor";
import { CHARGE_TYPE_OPTIONS, EXTRA_CHARGE_CODE_OPTIONS } from "../constants";
import { DateInput } from "../fields/date-input";
import { EnumSelect } from "../fields/enum-select";
import { RateInput } from "../fields/rate-input";
import type { ProductFormValues } from "../types";

interface Props {
  /** Row index within the `extra_charges` Form.List. */
  name: number;
  /** Codes used by other rows; disabled here. */
  usedCodes: ExtraChargeCode[];
  onRemove: () => void;
}

export function ExtraChargeRow({ name, usedCodes, onRemove }: Props) {
  const form = Form.useFormInstance<ProductFormValues>();
  const method = Form.useWatch(["extra_charges", name, "method"], form);
  const effectiveFrom = Form.useWatch(["extra_charges", name, "effective_from"], form);

  return (
    <Card size="small">
      <Row gutter={16} align="top">
        <Col xs={24} md={8}>
          <Form.Item
            label="Levy"
            name={[name, "code"]}
            rules={[{ required: true, message: "Select a levy" }]}
          >
            <EnumSelect
              options={EXTRA_CHARGE_CODE_OPTIONS}
              disabledValues={usedCodes}
              placeholder="Select levy"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="Method"
            name={[name, "method"]}
            rules={[{ required: true, message: "Select a method" }]}
          >
            <EnumSelect options={CHARGE_TYPE_OPTIONS} />
          </Form.Item>
        </Col>
        <Col xs={20} md={7}>
          <Form.Item
            label="Rate"
            name={[name, "rate_value"]}
            rules={[{ required: true, message: "Enter a rate" }]}
          >
            <RateInput method={method} />
          </Form.Item>
        </Col>
        <Col xs={4} md={1} style={{ paddingTop: 30 }}>
          <Button
            type="text"
            danger
            aria-label="Remove levy"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={onRemove}
          />
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="Effective from"
            name={[name, "effective_from"]}
            rules={[{ required: true, message: "Pick a start date" }]}
          >
            <DateInput />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="Effective to"
            name={[name, "effective_to"]}
            dependencies={[["extra_charges", name, "effective_from"]]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, to?: string | null) {
                  const from = getFieldValue(["extra_charges", name, "effective_from"]) as string | undefined;
                  if (!to || !from || to >= from) return Promise.resolve();
                  return Promise.reject(new Error("Must be on or after the start date"));
                },
              }),
            ]}
          >
            <DateInput allowClear placeholder="Open-ended" minDate={effectiveFrom} />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
}
