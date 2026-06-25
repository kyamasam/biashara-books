export type SystemLoan = {
  id: string;
  institutionName: string;
  institutionType: string;
  institutionLogoUrl: string | null;
  loanBalance: number;
  monthlyRepaymentAmount: number;
  endDate: string;
  userId: string;
  businessId: string;
  createdAt: string;
  updatedAt: string;
};

export type SystemLoansResponse = {
  success: boolean;
  message: string;
  data: SystemLoan[];
};

export type SystemLoanResponse = {
  success: boolean;
  message: string;
  data: SystemLoan;
};

export const formatKes = (value: number) =>
  `KES ${value.toLocaleString('en-KE')}`;

export function formatEndDate(endDate: string): string {
  const date = new Date(endDate);
  return date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' });
}
