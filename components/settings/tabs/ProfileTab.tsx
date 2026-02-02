"use client";

import { Camera } from "lucide-react";
import { SettingsSection } from "../ui/SettingsSection";

interface ProfileTabProps {
  user: {
    name: string;
    email: string;
    plan: string;
    avatarInitial: string;
  };
}

export function ProfileTab({ user }: ProfileTabProps) {
  return (
    <div>
      <SettingsSection title="Account">
        {/* Avatar */}
        <div className="flex items-center gap-4 py-3 px-4 rounded-lg border border-slate-200 bg-white">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-semibold shadow-lg">
              {user.avatarInitial}
            </div>
            <button
              className="absolute inset-0 w-16 h-16 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              aria-label="Change avatar"
            >
              <Camera size={20} className="text-white" />
            </button>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <button className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-150 cursor-pointer">
            Change photo
          </button>
        </div>

        {/* Name */}
        <div className="py-3 px-4 rounded-lg border border-slate-200 bg-white">
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Display Name
          </label>
          <input
            type="text"
            defaultValue={user.name}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors duration-150"
            placeholder="Your name"
          />
        </div>

        {/* Email */}
        <div className="py-3 px-4 rounded-lg border border-slate-200 bg-white">
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Email
          </label>
          <input
            type="email"
            defaultValue={user.email}
            disabled
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
          />
          <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
        </div>
      </SettingsSection>

      <SettingsSection title="Subscription">
        <div className="py-4 px-4 rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-900">
                  Current Plan
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
                  {user.plan}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {user.plan === "Pro"
                  ? "Unlimited notes, cloud sync, and more"
                  : "5GB storage, basic features"}
              </p>
            </div>
            {user.plan !== "Pro" && (
              <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg">
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Danger Zone">
        <div className="py-4 px-4 rounded-lg border border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-red-900">
                Delete Account
              </span>
              <p className="text-xs text-red-600 mt-1">
                Permanently delete your account and all data
              </p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-100 transition-colors duration-150 cursor-pointer">
              Delete Account
            </button>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
