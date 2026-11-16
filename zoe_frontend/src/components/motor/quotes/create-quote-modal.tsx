"use client";

import { axiosInstance } from "@/hooks/use-api";
import { useQuotesStore } from "@/store/quotes-store";
import { useVehiclesStore } from "@/store/vehicles-store";
import type { Paginated } from "@/types/common";
import type { CreateQuotePayload, ProductBenefit, Vehicle } from "@/types/motor";
import {
  AutoComplete,
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Steps,
  Tag,
  Typography,
} from "antd";
import { useEffect, useRef, useState } from "react";

interface CustomerResult {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  customer_type: string;
  national_identifier: string;
  national_identifier_type: string;
  kra_pin: string;
}

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
}

const STEPS = ["Customer", "Vehicle", "Policy & Benefits"];

const COVER_PERIODS = [
  { label: "1 Month", months: 1 },
  { label: "3 Months", months: 3 },
  { label: "6 Months", months: 6 },
  { label: "1 Year", months: 12 },
];

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function CreateQuoteModal({ open, onClose }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [customerForm] = Form.useForm();
  const [vehicleForm] = Form.useForm();
  const [policyForm] = Form.useForm();

  const selectedMakeId = Form.useWatch("vehicle_make_id", vehicleForm);
  const selectedProductId = Form.useWatch("motor_insurance_product_id", policyForm);

  // Customer search state
  const [customerSearchResults, setCustomerSearchResults] = useState<CustomerResult[]>([]);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResult | null>(null);
  const customerSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Vehicle search state
  const [vehicleSearchResults, setVehicleSearchResults] = useState<Vehicle[]>([]);
  const [vehicleSearchLoading, setVehicleSearchLoading] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cover date helpers
  const [coverPeriod, setCoverPeriod] = useState<number | null>(null);

  const { products, isLoadingProducts, isMutating, fetchProducts, createQuote, fetchQuotes } =
    useQuotesStore();
  const {
    vehicleClasses,
    vehicleMakes,
    vehicleModels,
    isLoadingClasses,
    isLoadingMakes,
    isLoadingModels,
    fetchVehicleClasses,
    fetchVehicleMakes,
    fetchVehicleModels,
  } = useVehiclesStore();

  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? null;
  const productBenefits: ProductBenefit[] = selectedProduct?.product_benefits ?? [];

  useEffect(() => {
    if (!open) return;
    fetchProducts();
    fetchVehicleClasses();
    fetchVehicleMakes();
  }, [open, fetchProducts, fetchVehicleClasses, fetchVehicleMakes]);

  useEffect(() => {
    if (open) fetchVehicleModels(selectedMakeId ?? null);
  }, [open, selectedMakeId, fetchVehicleModels]);

  const searchCustomers = (query: string) => {
    if (customerSearchDebounceRef.current) clearTimeout(customerSearchDebounceRef.current);
    if (!query) {
      setCustomerSearchResults([]);
      return;
    }
    customerSearchDebounceRef.current = setTimeout(async () => {
      setCustomerSearchLoading(true);
      try {
        const { data } = await axiosInstance.get<Paginated<CustomerResult>>("/customers/", {
          params: { search: query },
        });
        setCustomerSearchResults(data.results);
      } finally {
        setCustomerSearchLoading(false);
      }
    }, 400);
  };

  const searchVehicles = (query: string) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!query) {
      setVehicleSearchResults([]);
      return;
    }
    searchDebounceRef.current = setTimeout(async () => {
      setVehicleSearchLoading(true);
      try {
        const { data } = await axiosInstance.get<Paginated<Vehicle>>("/motor/vehicles/", {
          params: { search: query },
        });
        setVehicleSearchResults(data.results);
      } finally {
        setVehicleSearchLoading(false);
      }
    }, 400);
  };

  const handleClose = () => {
    setCurrentStep(0);
    customerForm.resetFields();
    vehicleForm.resetFields();
    policyForm.resetFields();
    setSelectedCustomer(null);
    setCustomerSearchResults([]);
    setSelectedVehicleId(null);
    setVehicleSearchResults([]);
    setCoverPeriod(null);
    onClose();
  };

  const goNext = async () => {
    if (currentStep === 0) await customerForm.validateFields();
    if (currentStep === 1) await vehicleForm.validateFields();
    setCurrentStep((s) => s + 1);
  };

  const goBack = () => setCurrentStep((s) => s - 1);

  const handleSubmit = async () => {
    await policyForm.validateFields();

    const customerValues = customerForm.getFieldsValue();
    const vehicleValues = vehicleForm.getFieldsValue();
    const policyValues = policyForm.getFieldsValue();

    const payload: CreateQuotePayload = {
      motor_insurance_product_id: policyValues.motor_insurance_product_id,
      sum_insured: String(policyValues.sum_insured),
      cover_start: policyValues.cover_start,
      cover_end: policyValues.cover_end,
      valid_until: policyValues.valid_until || undefined,
    };

    if (selectedCustomer) {
      payload.customer_id = selectedCustomer.id;
    } else {
      payload.customer = {
        full_name: customerValues.full_name,
        national_identifier: customerValues.national_identifier,
        national_identifier_type: customerValues.national_identifier_type,
        customer_type: customerValues.customer_type,
        phone: customerValues.phone || undefined,
        email: customerValues.email || undefined,
        kra_pin: customerValues.kra_pin || undefined,
      };
    }

    if (selectedVehicleId) {
      payload.vehicle_id = selectedVehicleId;
    } else {
      const { vehicle_make_id: _make, ...vehicleFields } = vehicleValues;
      payload.vehicle = {
        ...vehicleFields,
        tonnage: vehicleFields.tonnage != null ? String(vehicleFields.tonnage) : undefined,
        year_of_manufacture: Number(vehicleFields.year_of_manufacture),
      };
    }

    const selectedBenefits: CreateQuotePayload["selected_benefits"] = [];
    for (const benefit of productBenefits) {
      const checked = policyValues[`benefit_${benefit.id}`];
      if (checked) {
        const extraLimit = policyValues[`extra_limit_${benefit.id}`];
        selectedBenefits.push({
          product_benefit_id: benefit.id,
          extra_limit: extraLimit != null ? String(extraLimit) : undefined,
        });
      }
    }
    if (selectedBenefits.length > 0) payload.selected_benefits = selectedBenefits;

    await createQuote(payload);
    await fetchQuotes();
    handleClose();
  };

  const footer = (
    <Space>
      <Button onClick={handleClose}>Cancel</Button>
      {currentStep > 0 && <Button onClick={goBack}>Back</Button>}
      {currentStep < 2 && (
        <Button type="primary" onClick={goNext}>
          Next
        </Button>
      )}
      {currentStep === 2 && (
        <Button type="primary" loading={isMutating} onClick={handleSubmit}>
          Create Quote
        </Button>
      )}
    </Space>
  );

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title="Create Quote"
      width={720}
      footer={footer}
      destroyOnHidden
    >
      <Steps
        current={currentStep}
        items={STEPS.map((title) => ({ title }))}
        style={{ margin: "20px 0 28px" }}
        size="small"
      />

      {/* ── Step 1: Customer ── */}
      <Form
        form={customerForm}
        layout="vertical"
        initialValues={{ customer_type: "INDIVIDUAL", national_identifier_type: "ID" }}
        style={{ display: currentStep === 0 ? "block" : "none" }}
      >
        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item name="phone" label="Phone">
              <AutoComplete
                options={customerSearchResults.map((c) => ({
                  value: c.phone,
                  label: (
                    <span>
                      <strong>{c.full_name}</strong>
                      {" · "}
                      {c.phone}
                    </span>
                  ),
                  customer: c,
                }))}
                onSearch={(val) => {
                  setSelectedCustomer(null);
                  searchCustomers(val);
                }}
                onSelect={(_val: string, option: { customer: CustomerResult }) => {
                  const c = option.customer;
                  setSelectedCustomer(c);
                  customerForm.setFieldsValue({
                    phone: c.phone,
                    full_name: c.full_name,
                    customer_type: c.customer_type,
                    national_identifier_type: c.national_identifier_type,
                    national_identifier: c.national_identifier,
                    email: c.email || undefined,
                    kra_pin: c.kra_pin || undefined,
                  });
                }}
                onClear={() => {
                  setSelectedCustomer(null);
                  setCustomerSearchResults([]);
                }}
                notFoundContent={customerSearchLoading ? <Spin size="small" /> : null}
                placeholder="e.g. +254712345678 — search as you type"
                allowClear
                style={{ width: "100%" }}
              />
            </Form.Item>
            {selectedCustomer && (
              <div style={{ marginTop: -16, marginBottom: 16 }}>
                <Tag color="green">Linked: {selectedCustomer.full_name}</Tag>
              </div>
            )}
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="full_name"
              label="Full Name"
              rules={[{ required: !selectedCustomer, message: "Full name is required" }]}
            >
              <Input placeholder="e.g. John Doe" disabled={!!selectedCustomer} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="customer_type"
              label="Customer Type"
              rules={[{ required: !selectedCustomer }]}
            >
              <Select
                disabled={!!selectedCustomer}
                options={[
                  { value: "INDIVIDUAL", label: "Individual" },
                  { value: "BUSINESS", label: "Business" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="national_identifier_type"
              label="ID Type"
              rules={[{ required: !selectedCustomer }]}
            >
              <Select
                disabled={!!selectedCustomer}
                options={[
                  { value: "ID", label: "National ID" },
                  { value: "PASSPORT", label: "Passport" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="national_identifier"
              label="ID / Passport Number"
              rules={[{ required: !selectedCustomer, message: "ID number is required" }]}
            >
              <Input placeholder="e.g. 12345678" disabled={!!selectedCustomer} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: "email", message: "Enter a valid email" }]}
            >
              <Input placeholder="e.g. john@example.com" disabled={!!selectedCustomer} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="kra_pin" label="KRA PIN">
              <Input placeholder="e.g. A001234567B" disabled={!!selectedCustomer} />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {/* ── Step 2: Vehicle ── */}
      <Form
        form={vehicleForm}
        layout="vertical"
        initialValues={{ has_tracker: false }}
        style={{ display: currentStep === 1 ? "block" : "none" }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="registration_no"
              label="Registration No"
              rules={[{ required: true, message: "Registration number is required" }]}
            >
              <AutoComplete
                options={vehicleSearchResults.map((v) => ({
                  value: v.registration_no,
                  label: (
                    <span>
                      <strong>{v.registration_no}</strong>
                      {" — "}
                      {v.vehicle_model?.vehicle_make?.name ?? ""}{" "}
                      {v.vehicle_model?.name ?? ""}{" "}
                      {v.year_of_manufacture ? `(${v.year_of_manufacture})` : ""}
                    </span>
                  ),
                  vehicle: v,
                }))}
                onSearch={(val) => {
                  setSelectedVehicleId(null);
                  searchVehicles(val);
                }}
                onSelect={(_val: string, option: { vehicle: Vehicle }) => {
                  const v = option.vehicle;
                  setSelectedVehicleId(v.id);
                  vehicleForm.setFieldsValue({
                    registration_no: v.registration_no,
                    year_of_manufacture: v.year_of_manufacture,
                    vehicle_make_id: v.vehicle_model?.vehicle_make?.id,
                    vehicle_model_id: v.vehicle_model?.id,
                    vehicle_class_id: v.vehicle_class?.id,
                    colour: v.colour ?? undefined,
                    engine_cc: v.engine_cc ?? undefined,
                    seats: v.seats ?? undefined,
                    tonnage: v.tonnage ? Number(v.tonnage) : undefined,
                    has_tracker: v.has_tracker,
                  });
                  if (v.vehicle_model?.vehicle_make?.id) {
                    fetchVehicleModels(v.vehicle_model.vehicle_make.id);
                  }
                }}
                onClear={() => {
                  setSelectedVehicleId(null);
                  setVehicleSearchResults([]);
                }}
                notFoundContent={vehicleSearchLoading ? <Spin size="small" /> : null}
                placeholder="e.g. KAA 123A — search as you type"
                allowClear
                style={{ width: "100%" }}
              />
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
                loading={isLoadingMakes}
                onChange={() => vehicleForm.setFieldValue("vehicle_model_id", undefined)}
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
                loading={isLoadingModels}
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
                loading={isLoadingClasses}
                options={vehicleClasses.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="colour" label="Colour">
              <Input placeholder="e.g. White" />
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
            <Form.Item name="tonnage" label="Tonnage (T)">
              <InputNumber
                style={{ width: "100%" }}
                placeholder="e.g. 1.5"
                min={0}
                step={0.1}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="has_tracker" valuePropName="checked">
              <Checkbox>Vehicle has tracker</Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {/* ── Step 3: Policy & Benefits ── */}
      <Form
        form={policyForm}
        layout="vertical"
        style={{ display: currentStep === 2 ? "block" : "none" }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="motor_insurance_product_id"
              label="Insurance Product"
              rules={[{ required: true, message: "Select a product" }]}
            >
              <Select
                placeholder="Select product"
                showSearch
                optionFilterProp="label"
                loading={isLoadingProducts}
                options={products.map((p) => ({ value: p.id, label: (p.name + ' - ' + p?.cover_type?.name + ' - by ' + p?.insurer?.name) }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="sum_insured"
              label="Sum Insured (KES)"
              rules={[{ required: true, message: "Sum insured is required" }]}
            >
              <InputNumber<number>
                style={{ width: "100%" }}
                placeholder="e.g. 1500000"
                min={1}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(v) => v?.replace(/,/g, "") as unknown as number}
              />
            </Form.Item>
          </Col>

          {/* Cover Start with Today shortcut + Period auto-fill */}
          <Col xs={24} md={8}>
            <Form.Item
              name="cover_start"
              label={
                <Space size={8}>
                  <span>Cover Start</span>
                  <Checkbox
                    onChange={(e) => {
                      if (e.target.checked) {
                        const today = toDateStr(new Date());
                        policyForm.setFieldValue("cover_start", today);
                        if (coverPeriod) {
                          policyForm.setFieldValue("cover_end", addMonths(today, coverPeriod));
                        }
                      }
                    }}
                  >
                    Today
                  </Checkbox>
                </Space>
              }
              rules={[{ required: true, message: "Cover start is required" }]}
            >
              <Input
                type="date"
                onChange={(e) => {
                  if (coverPeriod && e.target.value) {
                    policyForm.setFieldValue("cover_end", addMonths(e.target.value, coverPeriod));
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={4}>
            <Form.Item label="Period">
              <Select
                placeholder="Period"
                allowClear
                value={coverPeriod}
                onChange={(months: number | null) => {
                  setCoverPeriod(months);
                  if (months) {
                    const start = policyForm.getFieldValue("cover_start");
                    if (start) {
                      policyForm.setFieldValue("cover_end", addMonths(start, months));
                    }
                  }
                }}
                options={COVER_PERIODS.map((p) => ({ value: p.months, label: p.label }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="cover_end"
              label="Cover End"
              rules={[{ required: true, message: "Cover end is required" }]}
            >
              <Input type="date" />
            </Form.Item>
          </Col>
          <Col xs={24} md={4}>
            <Form.Item name="valid_until" label="Valid Until">
              <Input type="date" />
            </Form.Item>
          </Col>
        </Row>

        {productBenefits.length > 0 && (
          <>
            <Divider orientation="left" style={{ fontSize: 13 }}>
              Optional Benefits
            </Divider>
            {productBenefits.map((benefit) => {
              const needsLimit =
                benefit.charge_type_for_extra === "PERCENT_OF_EXTRA_LIMIT";
              const checked = policyForm.getFieldValue(`benefit_${benefit.id}`);
              return (
                <Row key={benefit.id} gutter={16} align="middle" style={{ marginBottom: 8 }}>
                  <Col xs={24} md={needsLimit ? 12 : 24}>
                    <Form.Item
                      name={`benefit_${benefit.id}`}
                      valuePropName="checked"
                      style={{ marginBottom: 0 }}
                    >
                      <Checkbox>
                        <Text>{benefit.benefit.name}</Text>
                        {benefit.is_included && (
                          <Tag color="green" style={{ marginLeft: 8 }}>
                            Included
                          </Tag>
                        )}
                        {benefit.charge_value && !benefit.is_included && (
                          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                            {benefit.charge_type_for_extra === "FIXED_AMOUNT"
                              ? `KES ${benefit.charge_value}`
                              : `${benefit.charge_value}%`}
                          </Text>
                        )}
                      </Checkbox>
                    </Form.Item>
                  </Col>
                  {needsLimit && checked && (
                    <Col xs={24} md={12}>
                      <Form.Item
                        name={`extra_limit_${benefit.id}`}
                        label="Extra Limit (KES)"
                        rules={[{ required: true, message: "Extra limit is required" }]}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber<number>
                          style={{ width: "100%" }}
                          placeholder="e.g. 50000"
                          min={0}
                          formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          parser={(v) => v?.replace(/,/g, "") as unknown as number}
                        />
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              );
            })}
          </>
        )}
      </Form>
    </Modal>
  );
}
