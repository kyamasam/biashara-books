export interface InsuranceProvider {
  id: number;
  name: string;
  logo: string | null;
  /** Days a vehicle valuation remains valid; null = no limit. */
  valuation_validity_days: number | null;
}

export interface InsuranceProviderPayload {
  name: string;
  logo?: File | null;
  valuation_validity_days?: number | null;
}

export interface InsuranceProviderListParams {
  page?: number;
  search?: string;
}
