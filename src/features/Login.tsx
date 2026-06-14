import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { loginAsync, clearError } from "../store/slices/authSlice";

export function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, token } = useAppSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Nếu đã có token (đã login) → redirect thẳng về /home
  useEffect(() => {
    if (token) navigate("/home", { replace: true });
  }, [token, navigate]);

  // Xóa lỗi cũ khi user bắt đầu gõ lại
  useEffect(() => {
    if (error) dispatch(clearError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(loginAsync({ username, password }));
    // Khi fulfilled → token vào store → useEffect trên tự redirect
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
        {/* Header Section */}
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
                architecture
              </span>
            </div>
          </div>
          <h1 className="font-display font-extrabold text-4xl tracking-tighter text-primary">
            Architectural Ledger
          </h1>
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-outline mt-2 font-semibold">
            Enterprise Resource Planning
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-surface-container-lowest rounded-[24px] monolith-shadow p-10 border border-outline-variant"
        >
          <div className="mb-10">
            <h2 className="font-display font-bold text-2xl text-[#191c1e] mb-2 tracking-tight">
              Secure Gateway
            </h2>
            <p className="text-outline text-sm leading-relaxed">
              Please authenticate using your corporate credentials to access the
              ledger management systems.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username field */}
            <div className="space-y-2">
              <label
                className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1"
                htmlFor="username"
              >
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                  <span className="material-symbols-outlined text-outline group-focus-within:text-primary text-xl">
                    person
                  </span>
                </div>
                <input
                  id="username"
                  type="text"
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-[#191c1e] placeholder:text-outline/50 focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label
                className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1"
                htmlFor="password"
              >
                Security Key
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                  <span className="material-symbols-outlined text-outline group-focus-within:text-primary text-xl">
                    lock
                  </span>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-12 text-[#191c1e] placeholder:text-outline/50 focus:ring-2 focus:ring-primary/10 transition-all outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <div className="flex justify-end pr-1">
                <a
                  href="#"
                  className="text-xs font-semibold text-secondary hover:text-primary-container transition-colors"
                >
                  Forgot Password? (Quên mật khẩu?)
                </a>
              </div>
            </div>

            {/* Server error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm text-center bg-red-50 rounded-lg py-2 px-3 border border-red-100"
              >
                {error}
              </motion.p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full precise-gradient text-white font-display font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center space-x-3 mt-4 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {status === "loading" ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-xl">login</span>
                </>
              )}
            </button>
          </form>

          {/* Footer separator */}
          <div className="mt-12 flex items-center justify-center space-x-4 opacity-30">
            <div className="h-[1px] flex-1 bg-outline" />
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline whitespace-nowrap">
              Authorized Personnel Only
            </div>
            <div className="h-[1px] flex-1 bg-outline" />
          </div>
        </motion.div>

        {/* Triple Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 hidden lg:block"
        >
          <div className="flex items-center space-x-12">
            <div className="flex flex-col items-center">
              <span className="text-6xl font-display font-black text-outline/5 leading-none">
                01
              </span>
              <span className="text-[10px] font-bold text-outline/60 tracking-[0.4em] uppercase mt-1">
                Verification
              </span>
            </div>
            <div className="w-16 h-[1px] bg-outline-variant" />
            <div className="flex flex-col items-center">
              <span className="text-6xl font-display font-black text-outline/5 leading-none">
                02
              </span>
              <span className="text-[10px] font-bold text-outline/60 tracking-[0.4em] uppercase mt-1">
                Architecture
              </span>
            </div>
            <div className="w-16 h-[1px] bg-outline-variant" />
            <div className="flex flex-col items-center">
              <span className="text-6xl font-display font-black text-outline/5 leading-none">
                03
              </span>
              <span className="text-[10px] font-bold text-outline/60 tracking-[0.4em] uppercase mt-1">
                Immutable
              </span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Extreme Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-primary/10 flex">
        <div className="h-full bg-primary w-1/4" />
        <div className="h-full bg-secondary w-1/12" />
        <div className="h-full bg-primary-container flex-1" />
      </div>
    </div>
  );
}
