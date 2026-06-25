export interface ApiTransaction {
  id: string;
  transactionType: 'credit' | 'debit';
  transactionMethod: string;
  transactionPurpose: string;
  transactionPurposeDetail: string;
  confirmationCode: string;
  transactionAmount: number;
  paymentChannel: string;
  receiverNumber: string;
  receiverName: string;
  receiverAccount: string;
  transactionStatus: 'initiated' | 'success' | 'failed';
  transactionStatusDetails: string;
  senderNumber: string;
  senderName: string;
  reconciliationId: string;
  callbackResp: Record<string, unknown>;
  userId: string;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionPage {
  content: ApiTransaction[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
