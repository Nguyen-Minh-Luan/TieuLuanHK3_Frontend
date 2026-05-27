/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Settings,
  Shield,
  Bell,
  HelpCircle,
  HardDrive,
  User,
  CheckCircle,
} from "lucide-react";

interface SettingsViewProps {
  companyName: string;
  setCompanyName: (name: string) => void;
}

export default function SettingsView({
  companyName,
  setCompanyName,
}: SettingsViewProps) {
  const [notify, setNotify] = useState(true);
  const [mfa, setMfa] = useState(true);
  const [currency, setCurrency] = useState("USD");
  const [saved, setSaved] = useState(false);

  const triggerSaveNotification = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h3 className="text-3xl font-extrabold text-blue-900 font-headline tracking-tight">
          System Preferences
        </h3>
        <p className="text-slate-500 mt-1 font-body text-sm">
          Modify enterprise configurations, metadata parameters, and access
          controls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Preference Form Panel */}
        <form
          onSubmit={triggerSaveNotification}
          className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/50 shadow-xs space-y-6"
        >
          <h4 className="text-md font-bold text-slate-800 font-headline pb-3 border-b border-slate-100 flex items-center gap-1.5 select-none">
            <Settings className="h-5 w-5 text-slate-500" /> General Company
            Context
          </h4>

          {/* Input blocks */}
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 font-headline block mb-1.5">
                Tên công ty / Tập đoàn (Company Name)
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 font-headline block mb-1.5">
                  Đồng tiền mặc định (Base Currency)
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-sm font-semibold focus:outline-hidden text-slate-700 cursor-pointer"
                >
                  <option value="USD">USD (United States Dollar)</option>
                  <option value="EUR">EUR (Euro Currency)</option>
                  <option value="VND">VND (Việt Nam Đồng)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 font-headline block mb-1.5">
                  Cấp tài khoản (Identity Tier)
                </label>
                <input
                  type="text"
                  value="Enterprise Tier • Gold License"
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Secure & Security toggles */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Security & Diagnostics
            </h4>

            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm font-bold text-slate-800 block">
                  Hai yếu tố bảo mật MFA (Multi-Factor Auth)
                </span>
                <p className="text-xs text-slate-400 font-body">
                  Bảo bọc truy cập bằng mã OTP điện thoại trước khi duyệt chi
                  lớn
                </p>
              </div>
              <input
                type="checkbox"
                checked={mfa}
                onChange={(e) => setMfa(e.target.checked)}
                className="w-4 h-4 text-primary focus:ring-primary rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-t border-slate-100/50">
              <div>
                <span className="text-sm font-bold text-slate-800 block">
                  Cảnh báo tức thời (Audit Alerts)
                </span>
                <p className="text-xs text-slate-400 font-body">
                  Nhận tin báo khẩn khi chi tiêu vượt quá mức Critical ($10k)
                </p>
              </div>
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
                className="w-4 h-4 text-primary focus:ring-primary rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Save button indicators */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {saved && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 py-1.5 px-3 rounded-lg animate-fade-in">
                <CheckCircle className="h-4 w-4" /> Đã cập nhật cấu hình hệ
                thống!
              </span>
            )}
            <div className="ml-auto flex gap-2">
              <button
                type="submit"
                className="py-2.5 px-5 bg-primary text-white rounded-xl text-xs font-extrabold hover:bg-primary-container shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                Cập nhật Preferences
              </button>
            </div>
          </div>
        </form>

        {/* Sidebar Information Cards */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 space-y-3.5">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Shield className="h-4.5 w-4.5 text-blue-800" /> Ledger
              Verification
            </span>
            <div className="text-slate-600 text-xs font-bold leading-normal">
              Bản quyền Ledger Pro Enterprise được cấp phép cho địa chỉ Email
              thiết lập ban đầu:
              <span className="block mt-1 font-mono text-primary font-bold">
                luatdell3537@gmail.com
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 space-y-3">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <HardDrive className="h-4.5 w-4.5 text-slate-600" /> Database
              Engine Status
            </span>
            <div className="divide-y divide-slate-200/50 text-xs">
              <div className="flex justify-between py-1.5 text-slate-600">
                <span>Database Client:</span>
                <span className="font-bold text-slate-700">
                  Client-Side State Storage
                </span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-600">
                <span>Local Capacity:</span>
                <span className="font-bold text-slate-700">Unlimited</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-600 font-semibold text-emerald-600">
                <span>Core Nodes:</span>
                <span>Active &amp; Normal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
