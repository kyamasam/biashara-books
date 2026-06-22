export type LoanPayment = {
  id: string;
  date: string;
  amount: number;
  method: string;
  reference: string;
  status: 'Paid' | 'Processing';
};

export type Loan = {
  id: string;
  provider: string;
  channel: string;
  monthlyPayment: number;
  paid: number;
  total: number;
  due: string;
  status: 'On Track' | 'Defaulted' | 'Poor Perfoming';
  logo: number;
  rate: string;
  account: string;
  paybill: {
    number: string;
    account: string;
  };
  payments: LoanPayment[];
};

export const LOANS: Loan[] = [
  {
    id: 'kcb-mpesa',
    provider: 'KCB M-Pesa',
    channel: 'Mobile',
    monthlyPayment: 2000,
    paid: 800000,
    total: 1200000,
    due: 'Apr 28',
    status: 'On Track',
    logo: require('@/assets/bank-logos/kcb-logo.png'),
    rate: '12.4% APR',
    account: 'Loan 4921',
    paybill: {
      number: '522522',
      account: 'KCB-4921',
    },
    payments: [
      {
        id: 'kcb-003',
        date: 'Apr 01, 2026',
        amount: 2000,
        method: 'M-Pesa',
        reference: 'RCP-44019',
        status: 'Paid',
      },
      {
        id: 'kcb-002',
        date: 'Mar 01, 2026',
        amount: 2000,
        method: 'M-Pesa',
        reference: 'RCP-43112',
        status: 'Paid',
      },
      {
        id: 'kcb-001',
        date: 'Feb 01, 2026',
        amount: 2000,
        method: 'Bank transfer',
        reference: 'RCP-42088',
        status: 'Paid',
      },
    ],
  },
  {
    id: 'equity-mpesa',
    provider: 'Equity M-Pesa',
    channel: 'Mobile',
    monthlyPayment: 2000,
    paid: 1000,
    total: 12000,
    due: 'May 04',
    status: 'Poor Perfoming',
    logo: require('@/assets/bank-logos/equity-logo.png'),
    rate: '10.8% APR',
    account: 'Loan 1088',
    paybill: {
      number: '247247',
      account: 'EQT-1088',
    },
    payments: [
      {
        id: 'eq-003',
        date: 'Apr 04, 2026',
        amount: 2000,
        method: 'Autopay',
        reference: 'EQT-77102',
        status: 'Paid',
      },
      {
        id: 'eq-002',
        date: 'Mar 04, 2026',
        amount: 2000,
        method: 'M-Pesa',
        reference: 'EQT-76319',
        status: 'Paid',
      },
      {
        id: 'eq-001',
        date: 'Feb 04, 2026',
        amount: 2000,
        method: 'M-Pesa',
        reference: 'EQT-75440',
        status: 'Paid',
      },
    ],
  },
  {
    id: 'inm-bank',
    provider: 'I&M Bank',
    channel: 'Bank',
    monthlyPayment: 3500,
    paid: 42000,
    total: 90000,
    due: 'May 12',
    status: 'On Track',
    logo: require('@/assets/bank-logos/inm-bank-logo.png'),
    rate: '11.2% APR',
    account: 'Loan 7305',
    paybill: {
      number: '542542',
      account: 'IMB-7305',
    },
    payments: [
      {
        id: 'inm-003',
        date: 'Apr 12, 2026',
        amount: 3500,
        method: 'Bank transfer',
        reference: 'IMB-31984',
        status: 'Paid',
      },
      {
        id: 'inm-002',
        date: 'Mar 12, 2026',
        amount: 3500,
        method: 'Bank transfer',
        reference: 'IMB-30241',
        status: 'Paid',
      },
      {
        id: 'inm-001',
        date: 'Feb 12, 2026',
        amount: 3500,
        method: 'M-Pesa',
        reference: 'IMB-29817',
        status: 'Paid',
      },
    ],
  },
];

export const formatKes = (value: number) => `KES ${value.toLocaleString('en-KE')}`;

export function getLoanById(id: string | string[] | undefined) {
  const loanId = Array.isArray(id) ? id[0] : id;

  return LOANS.find((loan) => loan.id === loanId);
}
