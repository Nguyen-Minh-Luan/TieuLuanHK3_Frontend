import { useState, useEffect } from "react";
import { UserPlus, Sparkles, RefreshCw, Check } from "lucide-react";
import type { User, UserRole, UserStatus } from "./types.ts";
import Header from "../../../component/Header.tsx";
import BentoGrid from "./BentoGrid.tsx";
import UserTable from "./UserTable.tsx";
import UserFormModal from "./UserFormModal.tsx";
import { Sidebar } from "../../../component/Sidebar.tsx";
import { useAppDispatch, useAppSelector } from "../../../hooks/useAppDispatch.ts";
import {
  fetchUsers,
  createUser,
  updateUserThunk,
  deleteUserThunk,
  setParams
} from "../../../store/slices/userSlice.ts";
import { mapLabelToRole, mapLabelToStatus, mapRoleToLabel, mapStatusToLabel } from "./apiTypes.ts";

export default function UserManagementPage() {
  // Views navigation
  const [activeView, setActiveView] = useState("settings");

  const dispatch = useAppDispatch();
  const {
    items: users,
    totalElements,
    params,
    status
  } = useAppSelector((state) => state.user);

  // Modals status
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Local state for search input to prevent input lag
  const [localSearch, setLocalSearch] = useState("");

  // Success Notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Sync Redux keyword changes back to localSearch
  useEffect(() => {
    if (params.keyword !== localSearch) {
      setLocalSearch(params.keyword ?? "");
    }
  }, [params.keyword]);

  // Debounce filter keyword search dispatching
  useEffect(() => {
    const handler = setTimeout(() => {
      if ((params.keyword ?? "") !== localSearch) {
        dispatch(setParams({ keyword: localSearch, page: 1 }));
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [localSearch, params.keyword, dispatch]);

  // Fetch users when parameters change or list status is idle
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchUsers(params));
    }
  }, [status, params, dispatch]);

  // Handlers for Add/Edit Form submission
  const handleFormSubmit = async (formData: {
    id?: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    password?: string;
  }) => {
    // Generate normalized username from email
    const username = formData.email.split("@")[0] || formData.name.toLowerCase().replace(/\s+/g, "");
    const roleVal = mapLabelToRole(formData.role);
    const statusVal = mapLabelToStatus(formData.status);

    const requestData = {
      username,
      fullName: formData.name,
      email: formData.email,
      role: roleVal,
      status: statusVal,
      password: formData.password
    };

    if (formData.id) {
      // EDIT mode
      await dispatch(
        updateUserThunk({
          id: Number(formData.id),
          data: requestData
        })
      ).unwrap();
      triggerToast(`Đã cập nhật thông tin thành viên ${formData.name} thành công.`);
    } else {
      // ADD mode
      await dispatch(createUser(requestData)).unwrap();
      triggerToast(`Đã thêm thành viên mới ${formData.name} thành công!`);
    }
  };

  // Edit action
  const handleEditInit = (userToEdit: User) => {
    setUserToEdit(userToEdit);
    setIsFormModalOpen(true);
  };

  // Delete action
  const handleDelete = async (userToDelete: User) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thành viên ${userToDelete.name} khỏi hệ thống?`)) {
      try {
        await dispatch(deleteUserThunk(Number(userToDelete.id))).unwrap();
        triggerToast(`Đã xóa thành viên ${userToDelete.name} khỏi dữ liệu.`);
      } catch (err: any) {
        triggerToast(`Không thể xóa: ${err || "Lỗi hệ thống"}`);
      }
    }
  };

  // Reset filters helper
  const handleResetFilters = () => {
    setLocalSearch("");
    dispatch(
      setParams({
        keyword: "",
        role: undefined,
        status: undefined,
        page: 1
      })
    );
    triggerToast("Bộ lọc tìm kiếm đã được thiết lập lại.");
  };

  // Map Redux params to UI filter values
  const selectedRole = params.role !== undefined ? mapRoleToLabel(params.role) : "";
  const selectedStatus = params.status !== undefined ? mapStatusToLabel(params.status) : "";
  const currentPage = params.page ?? 1;

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
                totalUsersCount={totalElements}
                searchQuery={localSearch}
                onSearchChange={setLocalSearch}
                selectedRole={selectedRole}
                onRoleChange={(roleLabel) => {
                  const roleVal = roleLabel ? mapLabelToRole(roleLabel as UserRole) : undefined;
                  dispatch(setParams({ role: roleVal, page: 1 }));
                }}
                selectedStatus={selectedStatus}
                onStatusChange={(statusLabel) => {
                  const statusVal = statusLabel ? mapLabelToStatus(statusLabel as UserStatus) : undefined;
                  dispatch(setParams({ status: statusVal, page: 1 }));
                }}
                onResetFilters={handleResetFilters}
              />

              {/* Primary User Table Component */}
              <UserTable
                users={users}
                totalFilteredCount={totalElements}
                currentPage={currentPage}
                onPageChange={(page) => dispatch(setParams({ page }))}
                itemsPerPage={params.size ?? 4}
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
