"use client";

import { Card, Col, Descriptions, Row, Space, Typography } from "antd";
import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { formatUserType, getUserDisplayName } from "@/lib/utils";

const { Title, Text } = Typography;

export default function DashboardOverviewPage() {
  const { data: user } = useCurrentUser();

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <div>
        <Title level={3} style={{ margin: 0 }}>
          Welcome, {user?.first_name || getUserDisplayName(user)}
        </Title>
        <Text type="secondary">Here&apos;s an overview of your account.</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Account">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Name">{getUserDisplayName(user)}</Descriptions.Item>
              <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">
                {user?.phone_number ? `${user.phone_code ?? ""} ${user.phone_number}`.trim() : "Not set"}
              </Descriptions.Item>
              <Descriptions.Item label="Account type">{formatUserType(user?.user_type)}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
