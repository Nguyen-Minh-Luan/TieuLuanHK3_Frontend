/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Transaction } from './types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN-92834710-X",
    type: "PHIẾU CHI",
    status: "ACTIVE",
    riskStatus: "FINE (Ổn định)",
    sourceOfFunds: "Standard Chartered Business Core",
    category: "Logistics & Supply",
    amount: 128450.00,
    currency: "VND",
    limitFluctuations: [30, 45, 40, 65, 100, 55, 70],
    counterparty: {
      name: "Vietnam Express Logistics JSC",
      mst: "0102934812",
      logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCarLOAg3EkuH43wJlr8pMyohmHalXZl72sO7wOFUNiybFppD6Oa7NY6LR2yxYMY9KVdCjRJk1V9cGbFvKSYmHTTjw8y7t0554h3cu6zy6HlalsrUOfe05TOlOU3SRkL1BfaQk77cnl28fFyoRYPSTHrHvx5obuIXOQ3x2utjfo5W2FjHXUBnLuQv2614PRshm_E91wtZSO0qPptSDcTWdksnD9k8CefyZGX4R5BSOfcZOQqGz39Pfi-tJYJrKGqb4H49cXmH3XjREK"
    },
    creator: {
      name: "Alex Nguyễn",
      role: "Phó phòng Kế toán",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5zZOCmeehm3cNPdj0r6Dj0JczJqKhbTzgvLBozHRPjy44F1XKVgwN0zMEbys_kz7lYtrZpwVAUS-kwmAJaG-wNlc9t1Qw2VhLjR5FdT50hRTrJ0jnS1CXWqNxmaD0gKyLlx06pEEp0dFJ4L4VSjEqXe1CfvbZjBNplhMpZY0qqxD8x1z8gAuXTPuwRyek4qXm0AQBHgelhkw8FHIzVG8GHdIzMjB6WJuXmN0rflBNrsu4DWF5PH2s7Tw5TGVOTJLo2WQfFygWs2a9"
    },
    date: "24/05/2024",
    createdAt: "14:32:05 - GMT+7",
    notes: "Thanh toán đợt 2 cho hợp đồng vận chuyển nguyên vật liệu sản xuất quý II. Đã bao gồm thuế VAT 8%. Chứng từ gốc đính kèm trong thư mục ERP-928. Yêu cầu bộ phận kho xác nhận nhận hàng trước khi tất toán."
  },
  {
    id: "TXN-88231049-A",
    type: "PHIẾU THU",
    status: "ACTIVE",
    riskStatus: "FINE (Ổn định)",
    sourceOfFunds: "VPBank Cash Management",
    category: "Customer Offering",
    amount: 450000.00,
    currency: "VND",
    limitFluctuations: [20, 30, 45, 40, 50, 75, 90],
    counterparty: {
      name: "VNG Corporation",
      mst: "0304381395",
      logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=100&q=80"
    },
    creator: {
      name: "Alex Nguyễn",
      role: "Phó phòng Kế toán",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5zZOCmeehm3cNPdj0r6Dj0JczJqKhbTzgvLBozHRPjy44F1XKVgwN0zMEbys_kz7lYtrZpwVAUS-kwmAJaG-wNlc9t1Qw2VhLjR5FdT50hRTrJ0jnS1CXWqNxmaD0gKyLlx06pEEp0dFJ4L4VSjEqXe1CfvbZjBNplhMpZY0qqxD8x1z8gAuXTPuwRyek4qXm0AQBHgelhkw8FHIzVG8GHdIzMjB6WJuXmN0rflBNrsu4DWF5PH2s7Tw5TGVOTJLo2WQfFygWs2a9"
    },
    date: "25/05/2024",
    createdAt: "09:15:30 - GMT+7",
    notes: "Thu tiền thanh toán dịch vụ hạ tầng đám mây cho quy mô quý I và II năm tài chính hiện tại. Hóa đơn điện tử số phát hành HD-2024-9182."
  },
  {
    id: "TXN-38291032-K",
    type: "PHIẾU CHI",
    status: "ACTIVE",
    riskStatus: "WARNING (Chú ý)",
    sourceOfFunds: "Vietcombank Operational Account",
    category: "Marketing & Growth",
    amount: 85200.00,
    currency: "VND",
    limitFluctuations: [90, 85, 95, 110, 80, 95, 120],
    counterparty: {
      name: "Grab Vietnam Ltd",
      mst: "0312650392",
      logoUrl: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=100&q=80"
    },
    creator: {
      name: "Alex Nguyễn",
      role: "Phó phòng Kế toán",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5zZOCmeehm3cNPdj0r6Dj0JczJqKhbTzgvLBozHRPjy44F1XKVgwN0zMEbys_kz7lYtrZpwVAUS-kwmAJaG-wNlc9t1Qw2VhLjR5FdT50hRTrJ0jnS1CXWqNxmaD0gKyLlx06pEEp0dFJ4L4VSjEqXe1CfvbZjBNplhMpZY0qqxD8x1z8gAuXTPuwRyek4qXm0AQBHgelhkw8FHIzVG8GHdIzMjB6WJuXmN0rflBNrsu4DWF5PH2s7Tw5TGVOTJLo2WQfFygWs2a9"
    },
    date: "26/05/2024",
    createdAt: "11:40:00 - GMT+7",
    notes: "Chi bồi hoàn kinh phí quảng cáo kỹ thuật số và phân phối lưu lượng của dự án kích cầu tài trợ tháng 5. Đã đối khớp số liệu với phòng Marketing."
  },
  {
    id: "TXN-10294711-W",
    type: "PHIẾU CHI",
    status: "CANCELLED",
    riskStatus: "RISK (Cảnh báo)",
    sourceOfFunds: "Eximbank Operating Capital",
    category: "Human Resource",
    amount: 32040.50,
    currency: "VND",
    limitFluctuations: [40, 50, 45, 60, 40, 35, 30],
    counterparty: {
      name: "YOLO Agency Services",
      mst: "0103951283",
      logoUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=100&q=80"
    },
    creator: {
      name: "Alex Nguyễn",
      role: "Phó phòng Kế toán",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5zZOCmeehm3cNPdj0r6Dj0JczJqKhbTzgvLBozHRPjy44F1XKVgwN0zMEbys_kz7lYtrZpwVAUS-kwmAJaG-wNlc9t1Qw2VhLjR5FdT50hRTrJ0jnS1CXWqNxmaD0gKyLlx06pEEp0dFJ4L4VSjEqXe1CfvbZjBNplhMpZY0qqxD8x1z8gAuXTPuwRyek4qXm0AQBHgelhkw8FHIzVG8GHdIzMjB6WJuXmN0rflBNrsu4DWF5PH2s7Tw5TGVOTJLo2WQfFygWs2a9"
    },
    date: "22/05/2024",
    createdAt: "16:10:12 - GMT+7",
    notes: "Chi phí tổ chức team building hè, duyệt nhầm định mức ngân sách. Giao dịch đã bị từ chối và thu hồi bởi CFO Office, chờ lập phiếu bồi hoàn mới có kích thước thấp hơn."
  }
];
