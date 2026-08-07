import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { resetPasswordAsync } from "../store/slices/authSlice";

export function ResetPassword() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Guard against React StrictMode double rendering
  const isCalled = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Không tìm thấy mã xác thực trong đường dẫn.");
      return;
    }

    if (isCalled.current) return;
    isCalled.current = true;

    const performReset = async () => {
      try {
        const generatedPassword = await dispatch(resetPasswordAsync(token)).unwrap();
        setNewPassword(generatedPassword);
        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err || "Link không hợp lệ hoặc đã hết hạn");
      }
    };

    performReset();
  }, [token, dispatch]);

  const copyToClipboard = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="relative min-h-screen z-10 font-sans overflow-hidden">
      {/* Background Layers */}
      <div className="fixed inset-0 -z-10 bg-surface">
        <div className="absolute inset-0 architectural-grid" />
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[80%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] bg-secondary/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply"></div>
      </div>

      <main className="flex flex-col items-center justify-center min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 precise-gradient rounded-xl flex items-center justify-center shadow-lg">
              <span
                className="material-symbols-outlined text-white text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                key
              </span>
            </div>
          </div>
          <h1 className="font-display font-extrabold text-4xl tracking-tighter text-primary">
            Khôi phục mật khẩu
          </h1>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-surface-container-lowest rounded-[24px] monolith-shadow p-10 border border-outline-variant"
        >
          {status === "loading" && (
            <div className="text-center py-12">
              <svg className="animate-spin h-10 w-10 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <h2 className="font-display font-bold text-xl text-[#191c1e]">Đang xử lý yêu cầu...</h2>
              <p className="text-outline text-sm mt-2">Vui lòng chờ trong giây lát.</p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                <span className="material-symbols-outlined text-3xl">error</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-[#191c1e] mb-4">Lỗi khôi phục</h2>
              <p className="text-red-600 text-sm leading-relaxed mb-8 bg-red-50 py-3 px-4 rounded-lg border border-red-100">
                {errorMessage}
              </p>
              
              <Link
                to="/forgot-password"
                className="w-full precise-gradient text-white font-display font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center space-x-3"
              >
                Yêu cầu khôi phục lại
              </Link>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-[#191c1e] mb-2">Thành công!</h2>
              <p className="text-outline text-sm leading-relaxed mb-6">
                Mật khẩu mới của bạn đã được tạo. Vui lòng sao chép lại trước khi rời khỏi trang này. Mật khẩu này <strong>chỉ hiển thị một lần duy nhất</strong>.
              </p>

              <div className="relative group mb-8">
                <input
                  type="text"
                  readOnly
                  value={newPassword}
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-4 pr-14 text-center text-xl font-bold font-mono text-primary outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute inset-y-0 right-2 my-auto h-10 w-10 flex items-center justify-center text-outline hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  title="Sao chép"
                >
                  <span className="material-symbols-outlined">
                    {copied ? "check" : "content_copy"}
                  </span>
                </button>
              </div>

              {copied && (
                <p className="text-green-600 text-sm font-semibold mb-6">
                  Đã sao chép mật khẩu!
                </p>
              )}

              <Link
                to="/login"
                className="w-full bg-[#191c1e] text-white font-display font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center space-x-3"
              >
                <span>Đến trang Đăng Nhập</span>
                <span className="material-symbols-outlined text-[18px]">login</span>
              </Link>
            </div>
          )}

        </motion.div>
      </main>
    </div>
  );
}
