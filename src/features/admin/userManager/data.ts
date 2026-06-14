import { type User, UserRole, UserStatus } from "./types.ts";

export const INITIAL_USERS: User[] = [
  {
    id: "AL-9402",
    name: "Nguyễn Văn Dũng",
    email: "dung.nguyen@ledger.vn",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    avatarInitials: "ND",
    avatarBg: "primary-gradient"
  },
  {
    id: "AL-8312",
    name: "Trần Thị Phương",
    email: "phuong.tran@ledger.vn",
    role: UserRole.ACCOUNTANT,
    status: UserStatus.ACTIVE,
    avatarInitials: "TP",
    avatarBg: "bg-amber-800 text-amber-100"
  },
  {
    id: "AL-2291",
    name: "Lê Minh Hải",
    email: "hai.le@ledger.vn",
    role: UserRole.VIEWER,
    status: UserStatus.INACTIVE,
    avatarInitials: "LH",
    avatarBg: "bg-gray-300 text-gray-700"
  },
  {
    id: "AL-7703",
    name: "Hoàng Anh Tú",
    email: "tu.hoang@ledger.vn",
    role: UserRole.ACCOUNTANT,
    status: UserStatus.ACTIVE,
    avatarInitials: "HT",
    avatarBg: "bg-blue-200 text-blue-900"
  },
  {
    id: "AL-4102",
    name: "Phạm Hà My",
    email: "my.pham@ledger.vn",
    role: UserRole.VIEWER,
    status: UserStatus.ACTIVE,
    avatarInitials: "HM",
    avatarBg: "bg-pink-200 text-pink-900"
  },
  {
    id: "AL-1904",
    name: "Vũ Quốc Bảo",
    email: "bao.vu@ledger.vn",
    role: UserRole.ACCOUNTANT,
    status: UserStatus.ACTIVE,
    avatarInitials: "QB",
    avatarBg: "bg-teal-200 text-teal-950"
  },
  {
    id: "AL-3829",
    name: "Đỗ Thùy Linh",
    email: "linh.do@ledger.vn",
    role: UserRole.VIEWER,
    status: UserStatus.INACTIVE,
    avatarInitials: "TL",
    avatarBg: "bg-rose-200 text-rose-950"
  },
  {
    id: "AL-5591",
    name: "Nguyễn Minh Triết",
    email: "triet.nguyen@ledger.vn",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    avatarInitials: "MT",
    avatarBg: "bg-indigo-200 text-indigo-950"
  },
  {
    id: "AL-8302",
    name: "Bùi Hoàng Nam",
    email: "nam.bui@ledger.vn",
    role: UserRole.ACCOUNTANT,
    status: UserStatus.ACTIVE,
    avatarInitials: "HN",
    avatarBg: "bg-emerald-200 text-emerald-950"
  },
  {
    id: "AL-1102",
    name: "Trịnh Công Sơn",
    email: "son.trinh@ledger.vn",
    role: UserRole.VIEWER,
    status: UserStatus.ACTIVE,
    avatarInitials: "CS",
    avatarBg: "bg-violet-200 text-violet-950"
  },
  {
    id: "AL-6611",
    name: "Lương Thế Thành",
    email: "thanh.luong@ledger.vn",
    role: UserRole.VIEWER,
    status: UserStatus.ACTIVE,
    avatarInitials: "TT",
    avatarBg: "bg-orange-200 text-orange-950"
  },
  {
    id: "AL-5512",
    name: "Phùng Khánh Linh",
    email: "linh.phung@ledger.vn",
    role: UserRole.ACCOUNTANT,
    status: UserStatus.INACTIVE,
    avatarInitials: "KL",
    avatarBg: "bg-purple-200 text-purple-950"
  }
];
