"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Flex,
  Input,
  Segmented,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  AppstoreOutlined,
  BarsOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { BaseTable } from "@/components/base-table";
import { VehicleFormModal } from "@/components/motor/vehicles/vehicle-form-modal";
import { VehicleDeleteModal } from "@/components/motor/vehicles/vehicle-delete-modal";
import { useVehiclesStore } from "@/store/vehicles-store";
import type { Vehicle } from "@/types/motor";

const { Title, Text } = Typography;
const { Search } = Input;

export default function VehiclesPage() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const { vehicles, isLoadingVehicles, fetchVehicles } = useVehiclesStore();

  useEffect(() => {
    fetchVehicles(search ? { search } : undefined);
  }, [search, fetchVehicles]);

  const openCreate = () => {
    setSelectedVehicle(null);
    setFormOpen(true);
  };

  const openEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormOpen(true);
  };

  const openDelete = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDeleteOpen(true);
  };

  const columns: ColumnsType<Vehicle> = [
    {
      title: "Registration No",
      dataIndex: "registration_no",
      key: "registration_no",
      render: (val: string) => <Text strong>{val}</Text>,
    },
    {
      title: "Make / Model",
      key: "model",
      render: (_, record) => {
        const make = record.vehicle_model?.vehicle_make?.name;
        const model = record.vehicle_model?.name;
        if (!make && !model) return <Text type="secondary">—</Text>;
        return (
          <span>
            {make && <Text type="secondary">{make} / </Text>}
            <Text>{model}</Text>
          </span>
        );
      },
    },
    {
      title: "Year",
      dataIndex: "year_of_manufacture",
      key: "year_of_manufacture",
      width: 80,
    },
    {
      title: "Class",
      key: "vehicle_class",
      render: (_, record) =>
        record.vehicle_class ? (
          <Tag>{record.vehicle_class.name}</Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Colour",
      dataIndex: "colour",
      key: "colour",
      render: (val: string | null) => val ?? <Text type="secondary">—</Text>,
    },
    {
      title: "Seats",
      dataIndex: "seats",
      key: "seats",
      width: 70,
      render: (val: number | null) => val ?? <Text type="secondary">—</Text>,
    },
    {
      title: "Tracker",
      dataIndex: "has_tracker",
      key: "has_tracker",
      width: 80,
      render: (val: boolean) =>
        val ? <Tag color="green">Yes</Tag> : <Tag color="default">No</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => openDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rows = vehicles?.results ?? [];

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Vehicles
          </Title>
          <Text type="secondary">Manage all registered vehicles.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Add Vehicle
        </Button>
      </div>

      <Flex justify="space-between" align="center" gap={12}>
        <Search
          placeholder="Search by registration, chassis or engine number…"
          allowClear
          onSearch={setSearch}
          onChange={(e) => {
            if (!e.target.value) setSearch("");
          }}
          style={{ maxWidth: 420 }}
        />
        <Segmented
          value={viewMode}
          onChange={(val) => setViewMode(val as "cards" | "table")}
          options={[
            { value: "cards", icon: <AppstoreOutlined /> },
            { value: "table", icon: <BarsOutlined /> },
          ]}
        />
      </Flex>

      {viewMode === "cards" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {rows.map((vehicle) => {
            const make = vehicle.vehicle_model?.vehicle_make?.name;
            const model = vehicle.vehicle_model?.name;
            const makeModel =
              make && model
                ? `${make} / ${model}`
                : make || model || null;

            return (
              <Card
                key={vehicle.id}
                size="small"
                title={
                  <Flex align="center" gap={8}>
                    <Text strong>{vehicle.registration_no}</Text>
                    {vehicle.vehicle_class && (
                      <Tag>{vehicle.vehicle_class.name}</Tag>
                    )}
                  </Flex>
                }
                actions={[
                  <Tooltip key="edit" title="Edit">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => openEdit(vehicle)}
                    />
                  </Tooltip>,
                  <Tooltip key="delete" title="Delete">
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => openDelete(vehicle)}
                    />
                  </Tooltip>,
                ]}
              >
                <Space direction="vertical" size={4} style={{ width: "100%" }}>
                  <Flex justify="space-between">
                    <Text type="secondary">Make / Model</Text>
                    <Text>{makeModel ?? "—"}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text type="secondary">Year</Text>
                    <Text>
                      {vehicle.year_of_manufacture ?? (
                        <Text type="secondary">—</Text>
                      )}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text type="secondary">Colour</Text>
                    <Text>
                      {vehicle.colour ?? <Text type="secondary">—</Text>}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text type="secondary">Seats</Text>
                    <Text>
                      {vehicle.seats ?? <Text type="secondary">—</Text>}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text type="secondary">Engine CC</Text>
                    <Text>
                      {vehicle.engine_cc ?? <Text type="secondary">—</Text>}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text type="secondary">Tracker</Text>
                    {vehicle.has_tracker ? (
                      <Tag color="green">Yes</Tag>
                    ) : (
                      <Tag color="default">No</Tag>
                    )}
                  </Flex>
                </Space>
              </Card>
            );
          })}
        </div>
      ) : (
        <BaseTable<Vehicle>
          rowKey="id"
          dataSource={vehicles?.results}
          columns={columns}
          loading={isLoadingVehicles}
          pagination={{ total: vehicles?.count, pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      )}

      <VehicleFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        vehicle={selectedVehicle}
      />

      <VehicleDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        vehicle={selectedVehicle}
      />
    </Space>
  );
}
