import type { Fund, Transaction } from './types';

export const INITIAL_FUNDS: Fund[] = [
  {
    id: 'f-1',
    name: 'Quỹ Dự phòng Nội bộ A1',
    type: 'Nội bộ',
    totalCapital: 1500000,
    availableBalance: 300000,
    status: 'HOẠT ĐỘNG',
    code: 'INT-A1-RES',
    note: 'Dự phòng rủi ro thanh khoản nội bộ và dự án khẩn cấp cấp độ 1.',
    updatedAt: '2026-05-28'
  },
  {
    id: 'f-2',
    name: 'Tài trợ Chính phủ - Đổi mới Sáng tạo',
    type: 'Tài trợ',
    totalCapital: 2000000,
    availableBalance: 1500000,
    status: 'HOẠT ĐỘNG',
    code: 'GOV-INNOV-88',
    note: 'Ngân sách hỗ trợ phát triển sản phẩm công nghệ lõi AI.',
    updatedAt: '2026-05-25'
  },
  {
    id: 'f-3',
    name: 'Khoản vay HSBC - Mở rộng Quy mô',
    type: 'Vốn vay',
    totalCapital: 5000000,
    availableBalance: 150000,
    status: 'GẦN GIỚI HẠN',
    code: 'LOAN-HSBC-EXP',
    note: 'Nguồn vốn tín dụng lãi suất ưu đãi giải ngân cho văn phòng mới.',
    updatedAt: '2026-05-29'
  },
  {
    id: 'f-4',
    name: 'Quỹ Đối tác Chiến lược 2024',
    type: 'Tài trợ',
    totalCapital: 800000,
    availableBalance: 800000,
    status: 'CHỜ KÍCH HOẠT',
    code: 'PARTNER-24-STR',
    note: 'Góp vốn liên danh phát triển thị trường Đông Nam Á.',
    updatedAt: '2026-05-12'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    date: '2026-05-29T08:30:00Z',
    fundId: 'f-3',
    fundName: 'Khoản vay HSBC - Mở rộng Quy mô',
    type: 'Giải ngân',
    amount: 1200000,
    description: 'Thanh toán đợt 2 nhà thầu xây dựng văn phòng Innovation Hub',
    status: 'Thành công'
  },
  {
    id: 'tx-102',
    date: '2026-05-28T14:15:00Z',
    fundId: 'f-1',
    fundName: 'Quỹ Dự phòng Nội bộ A1',
    type: 'Cấp vốn',
    amount: 500000,
    description: 'Bổ sung quỹ dự phòng cuối quý 2',
    status: 'Thành công'
  },
  {
    id: 'tx-103',
    date: '2026-05-27T09:00:00Z',
    fundId: 'f-2',
    fundName: 'Tài trợ Chính phủ - Đổi mới Sáng tạo',
    type: 'Giải ngân',
    amount: 500000,
    description: 'Chi phí mua sắm hạ tầng đám mây và GPU Server',
    status: 'Thành công'
  },
  {
    id: 'tx-104',
    date: '2026-05-26T11:45:00Z',
    fundId: 'f-3',
    fundName: 'Khoản vay HSBC - Mở rộng Quy mô',
    type: 'Giải ngân',
    amount: 3650000,
    description: 'Giải ngân tiền mua trang thiết bị máy móc thí nghiệm và R&D',
    status: 'Thành công'
  },
  {
    id: 'tx-105',
    date: '2026-05-25T16:00:00Z',
    fundId: 'f-2',
    fundName: 'Tài trợ Chính phủ - Đổi mới Sáng tạo',
    type: 'Cấp vốn',
    amount: 2000000,
    description: 'Tiếp nhận khoản tài trợ chính phủ cho đề án Chuyển đổi số quốc gia',
    status: 'Thành công'
  },
  {
    id: 'tx-106',
    date: '2026-05-20T10:10:00Z',
    fundId: 'f-1',
    fundName: 'Quỹ Dự phòng Nội bộ A1',
    type: 'Giải ngân',
    amount: 250000,
    description: 'Bù đắp tài chính tạm thời cho sự gián đoạn kênh thanh toán quốc tế',
    status: 'Thành công'
  },
  {
    id: 'tx-107',
    date: '2026-05-15T15:20:00Z',
    fundId: 'f-4',
    fundName: 'Quỹ Đối tác Chiến lược 2024',
    type: 'Cấp vốn',
    amount: 800000,
    description: 'Nhận góp vốn từ đối tác chiến lược Châu Á - Thái Bình Dương',
    status: 'Thành công'
  }
];
