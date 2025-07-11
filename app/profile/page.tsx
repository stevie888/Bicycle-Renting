"use client";
import { useAuth } from "@/components/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">My Profile</h1>
      
      {showSuccess && (
        <div className="mb-4 p-2 rounded bg-green-100 text-green-800 text-center border border-green-300">
          Profile updated successfully!
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-2 rounded bg-red-100 text-red-800 text-center border border-red-300">
          {error}
        </div>
      )}
      
      <div className="flex flex-col gap-4">
        <label className="font-semibold">Name</label>
        <input
          className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={profile.name}
          onChange={e => setProfile({ ...profile, name: e.target.value })}
          readOnly={!edit}
        />
        
        <label className="font-semibold">Email</label>
        <input
          className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={profile.email}
          onChange={e => setProfile({ ...profile, email: e.target.value })}
          readOnly={!edit}
        />
        
        <label className="font-semibold">Mobile</label>
        <input
          className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={profile.mobile}
          onChange={e => setProfile({ ...profile, mobile: e.target.value })}
          readOnly={!edit}
        />
        
        {edit ? (
          <button 
            onClick={handleSave} 
            className="w-full mt-2 bg-blue-500 text-white rounded py-2 hover:bg-blue-600 disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        ) : (
          <button 
            type="button" 
            className="w-full mt-2 bg-gray-300 text-black rounded py-2 hover:bg-gray-400" 
            onClick={handleEditClick}
          >
            Edit
          </button>
        )}
      </div>
      <hr className="my-6" />
      <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
        <label className="font-semibold">Change Password</label>
        <Input
          type="password"
          placeholder="Old password"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
        />
        <Input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />
        <Button type="submit" className="w-full mt-2" disabled={!oldPassword || !newPassword}>Change Password</Button>
        {pwMsg && <div className="text-center text-sm text-green-600">{pwMsg}</div>}
      </form>
      <div className="flex justify-end mt-8">
        <Button className="w-32" variant="ghost" onClick={logout}>Logout</Button>
      </div>
    </div>
  );
}
