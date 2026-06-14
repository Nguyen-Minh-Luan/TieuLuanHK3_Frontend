import { useState, useMemo } from "react";
import { UserPlus, UserMinus, Plus, Building2, HelpCircle, Check, Sparkles, RefreshCw } from "lucide-react";
import { INITIAL_USERS } from "./data.ts";
import type { User, UserRole, UserStatus } from "./types.ts";
import Header from "../../../component/Header.tsx";
import BentoGrid from "./BentoGrid.tsx";
import UserTable from "./UserTable.tsx";
import UserFormModal from "./UserFormModal.tsx";
import { Sidebar } from "../../../component/Sidebar.tsx";

const ITEMS_PER_PAGE = 4;

export default function UserManagement() {
  // Views navigation
  const [activeView, setActiveView] = useState("settings");

  // State for user table database
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Page state
  const [currentPage, setCurrentPage] = useState(1);

  // Modals status
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Success Notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Generate unique ID in the style of AL-XXXX
  const generateUniqueId = () => {
    let newId = "";
    let isUnique = false;
    while (!isUnique) {
      const randNum = Math.floor(1000 + Math.random() * 9000);
      newId = `AL-${randNum}`;
      isUnique = !users.some((u) => u.id === newId);
    }
    return newId;
  };

  // Get initials for Name avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      const first = parts[0]?.charAt(0) || "";
      const last = parts[parts.length - 1]?.charAt(0) || "";
      return `${first}${last}`.toUpperCase();
    }
    return (name.slice(0, 2) || "U").toUpperCase();
  };

  // Handlers for Add/Edit Form submission
  const handleFormSubmit = (formData: {
    id?: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
  }) => {
    if (formData.id) {
      // EDIT mode
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.id === formData.id) {
            const initials = getInitials(formData.name);
            return {
              ...u,
              name: formData.name,
              email: formData.email,
              role: formData.role,
              status: formData.status,
              avatarInitials: initials
            };
          }
          return u;
        })
      );
      triggerToast(`Đã cập nhật thông tin thành viên ${formData.name} successfully.`);
    } else {
      // ADD mode
      const newId = generateUniqueId();
      const initials = getInitials(formData.name);

      // Preset color classes
      const bgColors = [
        "bg-[#003178] text-white",
        "bg-amber-800 text-amber-100",
        "bg-teal-700 text-teal-100",
        "bg-purple-700 text-purple-100",
        "bg-indigo-700 text-indigo-100",
        "bg-rose-700 text-rose-100"
      ];
      const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];

      const newUser: User = {
        id: newId,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        avatarInitials: initials,
        avatarBg: randomBg!
      };

      setUsers((prevUsers) => [newUser, ...prevUsers]);
      setCurrentPage(1); // take them to first page to see the added member
      triggerToast(`Đã thêm thành viên mới ${formData.name} thành công!`);
    }
  };

  // Edit action
  const handleEditInit = (userToEdit: User) => {
    setUserToEdit(userToEdit);
    setIsFormModalOpen(true);
  };

  // Delete action
  const handleDelete = (userToDelete: User) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thành viên ${userToDelete.name} khỏi hệ thống?`)) {
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userToDelete.id));
      triggerToast(`Đã xóa thành viên ${userToDelete.name} khỏi dữ liệu.`);
    }
  };

  // Reset filters helper
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedRole("");
    setSelectedStatus("");
    setCurrentPage(1);
    triggerToast("Bộ lọc tìm kiếm đã được thiết lập lại.");
  };

  // Filter users lists based on status, role, query search
  const filteredUsers = useMemo(() => {
    setCurrentPage(1); // automatically reset to page 1 on filter trigger
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRole = selectedRole ? u.role === selectedRole : true;
      const matchStatus = selectedStatus ? u.status === selectedStatus : true;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, selectedRole, selectedStatus]);

  // Adjust active pagination slice
  // Since we reset page upon filter changes inside actual view, we retrieve current page or falls back beautifully
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, safeCurrentPage]);

  // Total global statistics (e.g. 1248 + newly added list sizing delta)
  const simulatedTotalUsers = 1248 + (users.length - INITIAL_USERS.length);

  return (
    <div className="flex h-screen w-full bg-surface text-on-surface-custom font-body select-none overflow-hidden">

      {/* Dynamic Action Toast Notify */}
      {toastMessage && (
        <div id="toast-notification" className="fixed top-6 right-6 z-[120] bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce transition-all">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check size={14} className="stroke-[3]" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* SideNavBar Panel */}
      <Sidebar />

      {/* Main Container Frame */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* Top Navbar Header */}
        <Header />

        {/* Dynamic Content Switching */}
        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">

          {activeView === "settings" || activeView === "users" ? (
            <div id="settings-view-panel">
              {/* Cover Title Section */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                  <h2 id="view-title-h2" className="font-display text-3xl font-extrabold text-[#191c1e] tracking-tight mb-2">
                    Quản lý Người dùng
                  </h2>
                  <p id="view-desc-p" className="text-on-surface-variant-custom text-base max-w-2xl font-medium opacity-90">
                    Quản lý danh sách thành viên và phân quyền hệ thống cho doanh nghiệp của bạn.
                  </p>
                </div>
                <button
                  id="btn-add-new-user-trigger"
                  onClick={() => {
                    setUserToEdit(null);
                    setIsFormModalOpen(true);
                  }}
                  className="primary-gradient text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary-custom/15 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <UserPlus size={18} className="stroke-[2.5]" />
                  Thêm Người dùng mới
                </button>
              </div>

              {/* Stats and Search Filter Row */}
              <BentoGrid
                totalUsersCount={simulatedTotalUsers}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedRole={selectedRole}
                onRoleChange={setSelectedRole}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                onResetFilters={handleResetFilters}
              />

              {/* Primary User Table Component */}
              <UserTable
                users={paginatedUsers}
                totalFilteredCount={filteredUsers.length}
                currentPage={safeCurrentPage}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                onEdit={handleEditInit}
                onDelete={handleDelete}
              />
            </div>
          ) : (
            // Fallback for other sidebar items to make the app feel exceptionally authentic and immersive
            <div id="fallback-tabs-view" className="h-[75vh] flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto">
              <div className="w-16 h-16 bg-primary-custom/5 text-primary-custom rounded-2xl flex items-center justify-center mb-6">
                <Sparkles size={32} className="text-primary-custom" />
              </div>
              <h3 className="text-xl font-display font-extrabold text-[#191c1e] mb-2">
                Màn hình {activeView.toUpperCase()}
              </h3>
              <p className="text-sm text-on-surface-variant-custom leading-relaxed mb-6">
                Màn hình này đang liên kết với hệ thống máy chủ tổng bộ <b>Architectural Ledger</b>. Vui lòng bấm vào thẻ <b>Settings</b> ở menu bên trái để mở bảng quản trị nhân sự "Quản lý Người dùng" chính xác nhất.
              </p>
              <button
                id="btn-switch-back-to-settings"
                onClick={() => setActiveView("settings")}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary-custom text-white hover:bg-primary-custom/90 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw size={14} className="animate-spin" />
                Về quản lý Người dùng
              </button>
            </div>
          )}

        </div>

        {/* Fixed Mobile Floating Add Button */}
        <button
          id="mobile-floating-add-btn"
          onClick={() => {
            setUserToEdit(null);
            setIsFormModalOpen(true);
          }}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full primary-gradient text-white shadow-2xl flex items-center justify-center z-50 cursor-pointer hover:scale-105 active:scale-95 transition-all"
          title="Thêm Người dùng mới"
        >
          <UserPlus size={22} className="stroke-[2.5]" />
        </button>

      </main>

      {/* Adding & Editing Modal Dialog overlay */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setUserToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        userToEdit={userToEdit}
      />

    </div>
  );
}
