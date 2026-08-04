import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { getInitials, getRoleLabel, getAvatarColor } from "../../utils/userDisplay";
import { User, Mail, Calendar, CheckCircle, Shield, Loader2, Save } from "lucide-react";
import userService from "../../services/userService";
import { updateProfile } from "../../store/slices/authSlice";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Data from backend
  const [profile, setProfile] = useState<any>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getMe();
      setProfile(data);
      setFullName(data.fullName || "");
      setEmail(data.email || "");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      await userService.update(profile.id, {
        fullName,
        email
      });
      
      // Cập nhật redux auth state
      dispatch(updateProfile({ fullName, email }));
      
      setSuccess("Cập nhật thông tin thành công");
      // Cập nhật lại state profile
      setProfile({ ...profile, fullName, email });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Lỗi khi cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 min-h-screen flex items-center justify-center flex-col gap-4">
        <p>Không tìm thấy thông tin cá nhân.</p>
        <button onClick={fetchProfile} className="text-primary font-bold hover:underline">Thử lại</button>
      </div>
    );
  }

  const displayName = profile.fullName || profile.username || "Người dùng";
  const initials = getInitials(displayName);
  const avatarBg = getAvatarColor(profile.id);
  const roleLabel = getRoleLabel(profile.role);
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Chưa cập nhật";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="flex-1 font-sans bg-slate-50/50 min-h-screen p-8">
      {/* Header section */}
      <div className="max-w-4xl mx-auto mb-8">
        <h2 className="font-headline text-3xl font-extrabold text-[#003178] tracking-tight">
          Hồ sơ cá nhân
        </h2>
        <p className="text-slate-500 mt-2 text-sm">
          Quản lý thông tin tài khoản và cài đặt định danh cá nhân của bạn.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-xs flex flex-col items-center text-center">
            <div className={`w-32 h-32 rounded-full ${avatarBg} text-white flex items-center justify-center text-4xl font-bold font-headline mb-4 shadow-md`}>
              {initials}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{displayName}</h3>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold mt-2 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              {roleLabel}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-xs space-y-4">
            <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-widest mb-4">
              Thông tin hệ thống
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Tên đăng nhập</p>
                  <p className="text-sm font-semibold text-slate-700">{profile.username}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Trạng thái tài khoản</p>
                  <p className="text-sm font-semibold text-emerald-600">{profile.status}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Ngày tạo tài khoản</p>
                  <p className="text-sm font-semibold text-slate-700">{formatDate(profile.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSave} className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-xs">
            <h3 className="text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100 font-headline">
              Chỉnh sửa thông tin
            </h3>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-semibold border border-rose-100 flex items-center gap-2">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-semibold border border-emerald-100 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {success}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 block mb-2">
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    placeholder="Nhập họ và tên..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 block mb-2">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    placeholder="Nhập địa chỉ email..."
                    required
                  />
                </div>
              </div>
              
              {/* Note about uneditable fields */}
              <div className="pt-2">
                <p className="text-xs text-slate-400 italic">
                  * Tên đăng nhập và vai trò không thể thay đổi. Vui lòng liên hệ Quản trị viên nếu bạn cần hỗ trợ.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-xs hover:bg-primary-container hover:shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
