export interface Fund {
  id: string;
  name: string;
  type: 'Nội bộ' | 'Tài trợ' | 'Vốn vay' | 'Khác';
  totalCapital: number;
  availableBalance: number;
  status: 'ACTIVE' | 'INACTIVE';
  code: string;
  note: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  date: string;
  fundId: string;
  fundName: string;
  type: 'Cấp vốn' | 'Giải ngân' | 'Chuyển quỹ';
  amount: number;
  description: string;
  status: 'Thành công' | 'Đang xử lý';
}

export interface QuickStats {
  totalCapital: number;
  totalAvailable: number;
  activeCount: number;
  utilizationRate: number;
}
