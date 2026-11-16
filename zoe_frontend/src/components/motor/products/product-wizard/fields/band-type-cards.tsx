"use client";

import { Col, Radio, Row, Typography, theme } from "antd";
import type { BandType } from "@/types/motor";
import { BAND_TYPE_OPTIONS } from "../constants";

const { Text } = Typography;

interface Props {
  value?: BandType;
  onChange?: (value: BandType) => void;
}

/** Radio group rendered as three descriptive cards. */
export function BandTypeCards({ value, onChange }: Props) {
  const { token } = theme.useToken();

  return (
    <Radio.Group
      value={value}
      onChange={(e) => onChange?.(e.target.value as BandType)}
      style={{ width: "100%" }}
    >
      <Row gutter={[12, 12]}>
        {BAND_TYPE_OPTIONS.map((option) => {
          const selected = option.value === value;
          return (
            <Col xs={24} sm={8} key={option.value}>
              <Radio
                value={option.value}
                style={{
                  width: "100%",
                  height: "100%",
                  margin: 0,
                  padding: 12,
                  alignItems: "flex-start",
                  borderRadius: token.borderRadius,
                  border: `1px solid ${selected ? token.colorPrimary : token.colorBorder}`,
                  background: selected ? token.colorPrimaryBg : undefined,
                }}
              >
                <Text strong>{option.label}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {option.description}
                </Text>
              </Radio>
            </Col>
          );
        })}
      </Row>
    </Radio.Group>
  );
}
