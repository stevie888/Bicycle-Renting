"use client";
import { useAuth } from "@/components/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Mail, Smartphone, ArrowLeft, Coins } from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile, logout, loading, changePassword } = useAuth();
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
  });
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  // Sync profile state with user when user changes (not on edit)
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
      });
    }
  }, [user]);

  // Redirect to login if user is not present
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const success = await updateProfile(profile);
      if (success) {
        setEdit(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = () => {
    setEdit(true);
    setError("");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setPwMsg("Please fill in both fields.");
      return;
    }
    if (await changePassword(oldPassword, newPassword)) {
      setPwMsg("Password changed successfully!");
    } else {
      setPwMsg("Old password incorrect.");
    }
    setOldPassword("");
    setNewPassword("");
  };

  if (loading || !user) return null;

  // Only use initials or fallback icon for avatar
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '';

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-0 rounded-2xl shadow-xl flex flex-col gap-0 animate-fade-in">
      {/* Header with back button and avatar */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-t-2xl px-6 py-5 flex flex-col items-center relative">
        <div className="w-16 h-16 rounded-full bg-yellow-100 shadow-lg flex items-center justify-center mb-1 border-4 border-yellow-300 overflow-hidden">
          {initials ? (
            <span className="text-2xl font-bold text-yellow-600">{initials}</span>
          ) : (
            <UserIcon className="w-8 h-8 text-yellow-400" />
          )}
        </div>
        {/* Removed name from header */}
      </div>
      <div className="p-8 flex flex-col gap-8">
        {showSuccess && (
          <div className="mb-2 p-2 rounded bg-green-100 text-green-800 text-center border border-green-300">
            Profile updated successfully!
          </div>
        )}
        {error && (
          <div className="mb-2 p-2 rounded bg-red-100 text-red-800 text-center border border-red-300">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700 flex items-center gap-2"><UserIcon className="w-4 h-4 text-blue-400" /> Name</label>
            <input
              className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              readOnly={!edit}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700 flex items-center gap-2"><Mail className="w-4 h-4 text-blue-400" /> Email</label>
            <input
              className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              readOnly={!edit}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700 flex items-center gap-2"><Smartphone className="w-4 h-4 text-blue-400" /> Mobile</label>
            <input
              className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              value={profile.mobile}
              onChange={e => setProfile({ ...profile, mobile: e.target.value })}
              readOnly={!edit}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700 flex items-center gap-2"><Coins className="w-4 h-4 text-yellow-500" /> Credits</label>
            <div className="border px-3 py-2 rounded-lg bg-gray-50 flex justify-between items-center">
              <span className="text-gray-700">{user.credits || 0} credits</span>
              <span className="text-sm text-gray-500">({Math.floor((user.credits || 0) / 50)} rentals available)</span>
            </div>
          </div>
          {edit ? (
            <button
              onClick={handleSave}
              className="w-full mt-2 bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          ) : (
            <button
              type="button"
              className="w-full mt-2 bg-gray-200 text-gray-800 rounded-lg py-2 font-semibold hover:bg-gray-300 transition"
              onClick={handleEditClick}
            >
              Edit
            </button>
          )}
        </div>
        <div className="border-t pt-6 mt-2 flex flex-col gap-4">
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <label className="font-semibold text-gray-700">Change Password</label>
            <Input
              type="password"
              placeholder="Old password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="rounded-lg"
            />
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="rounded-lg"
            />
            <Button type="submit" className="w-full mt-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400" disabled={!oldPassword || !newPassword}>Change Password</Button>
            {pwMsg && <div className="text-center text-sm text-green-600">{pwMsg}</div>}
          </form>
        </div>
        <div className="flex justify-end mt-2">
          <Button className="w-32" variant="ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
