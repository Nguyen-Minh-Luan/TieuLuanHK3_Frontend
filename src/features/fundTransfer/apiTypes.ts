export interface FundTransferRequest {
  fromFundId: number;
  toFundId: number;
  amount: number;
  reason: string;
  note?: string;
}

export interface FundTransferDTO {
  id: number;
  transferCode: string;
  fromFundId: number;
  fromFundName: string;
  toFundId: number;
  toFundName: string;
  amount: number;
  amountInWord: string;
  reason: string;
  note?: string;
  status: string;
  createdById: number;
  createdByName: string;
  createdAt: string;
  fromFundBalanceAfter: number;
  toFundBalanceAfter: number;
}
