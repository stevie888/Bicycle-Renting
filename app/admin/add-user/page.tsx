"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useLanguage } from "@/components/LanguageContext";
import { 
  ArrowLeftIcon,
  UserPlusIcon,
  UsersIcon,
  MailIcon,
  LockIcon,
  PhoneIcon,
  UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddUserPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    mobile: '',
    role: 'user'
  });

  // Check if user is admin, if not redirect to home
  if (user && user.role !== 'admin') {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get existing users
      const users = JSON.parse(localStorage.getItem('pedalnepal_users') || '[]');
      
      // Check if mobile number already exists
      const existingUser = users.find((user: any) => user.mobile === formData.mobile);
      if (existingUser) {
        alert(t('admin.mobileExists'));
        return;
      }
      
      // Create new user
      const newUser = {
        id: (users.length + 1).toString(),
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        role: formData.role,
        initialCredits: 250, // Starting credits
        credits: 250, // Current credits (will be calculated dynamically)
        profileImage: null,
        createdAt: new Date().toISOString(),
      };
      
      // Add to localStorage
      users.push(newUser);
      localStorage.setItem('pedalnepal_users', JSON.stringify(users));
      
      alert(t('admin.userCreated'));
      router.push('/admin');
    } catch (error) {
      console.error('Error creating user:', error);
      alert(t('admin.createUserFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-600 transition-all duration-200 border border-primary-200 hover:border-primary-300"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t('admin.addNewUser')}
                </h1>
                <p className="text-gray-600 text-sm">{t('admin.createNewUserAccount')}</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <UserPlusIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <UsersIcon className="w-6 h-6 mr-3" />
              {t('admin.userInformation')}
            </h2>
            <p className="text-blue-100 mt-2">{t('admin.fillUserDetails')}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <UserIcon className="w-4 h-4 mr-2" />
                  {t('admin.username')}
                </label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder={t('admin.enterUsername')}
                  required
                  className="w-full"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <MailIcon className="w-4 h-4 mr-2" />
                  {t('auth.email')}
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('admin.enterEmail')}
                  required
                  className="w-full"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <LockIcon className="w-4 h-4 mr-2" />
                  {t('auth.password')}
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t('admin.enterPassword')}
                  required
                  className="w-full"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  {t('auth.mobile')}
                </label>
                <Input
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder={t('admin.enterMobile')}
                  required
                  className="w-full"
                />
              </div>

              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <UserIcon className="w-4 h-4 mr-2" />
                  {t('admin.fullName')}
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('admin.enterFullName')}
                  required
                  className="w-full"
                />
              </div>

              {/* Role */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('users.role')}
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                >
                  <option value="user">{t('admin.regularUser')}</option>
                  <option value="admin">{t('admin.administrator')}</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={() => router.push('/admin')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {loading ? t('admin.creating') : t('admin.createUser')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
