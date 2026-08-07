import { motion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { forgotPasswordAsync } from "../store/slices/authSlice";

export function ForgotPassword() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Dispatch action 
    // We ignore success/error because we always show the same message
    try {
      await dispatch(forgotPasswordAsync(email)).unwrap();
    } catch (err) {
      // ignore
    } finally {
      setIsLoading(false);
      setSubmitted(true);
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
                lock_reset
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
          {!submitted ? (
            <>
              <div className="mb-10">
                <h2 className="font-display font-bold text-2xl text-[#191c1e] mb-2 tracking-tight">
                  Quên mật khẩu?
                </h2>
                <p className="text-outline text-sm leading-relaxed">
                  Nhập địa chỉ email của bạn, chúng tôi sẽ gửi liên kết khôi phục mật khẩu nếu email hợp lệ.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                      <span className="material-symbols-outlined text-outline group-focus-within:text-primary text-xl">
                        mail
                      </span>
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="Địa chỉ email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-[#191c1e] placeholder:text-outline/50 focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full precise-gradient text-white font-display font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center space-x-3 mt-4 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <span>Gửi yêu cầu</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-[#191c1e] mb-4">Đã gửi yêu cầu</h2>
              <p className="text-outline text-sm leading-relaxed mb-8">
                Nếu email <strong>{email}</strong> tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn khôi phục mật khẩu. Vui lòng kiểm tra hộp thư đến.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
             <Link
                to="/login"
                className="text-xs font-semibold text-secondary hover:text-primary-container transition-colors inline-flex items-center space-x-1"
             >
                <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                <span>Quay lại trang đăng nhập</span>
             </Link>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-4 opacity-30">
            <div className="h-[1px] flex-1 bg-outline" />
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline whitespace-nowrap">
              Secure Gateway
            </div>
            <div className="h-[1px] flex-1 bg-outline" />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
