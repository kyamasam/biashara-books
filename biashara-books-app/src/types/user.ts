export interface Business {
  id: string;
  name: string;
  userId: string;
  shortCode: string;
  shortCodeType: string;
  shortcodeBalance: number;
  shortcodeLoanLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  phoneCode: string;
  phoneNumber: string;
  currentBusinessId: string;
  currentBusiness: Business | null;
  createdAt: string;
  updatedAt: string;
}
