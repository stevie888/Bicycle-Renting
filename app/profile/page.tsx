"use client";
import { useAuth } from "@/components/AuthContext";
import { useLanguage } from "@/components/LanguageContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Mail, Smartphone, ArrowLeft, Coins, Edit3, Save, Lock, Home, Wallet, Plus, History } from "lucide-react";

type TabType = 'personal' | 'password' | 'wallet';

export default function ProfilePage() {
  const { user, updateProfile, logout, loading, changePassword } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
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
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletAmount, setWalletAmount] = useState(1000); // Mock wallet balance

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
        setError(t('profile.updateFailed'));
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setError(t('profile.updateError'));
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
      setPwMsg(t('profile.fillBothFields'));
      return;
    }
    if (await changePassword(oldPassword, newPassword)) {
      setPwMsg(t('profile.passwordChanged'));
    } else {
      setPwMsg(t('profile.oldPasswordIncorrect'));
    }
    setOldPassword("");
    setNewPassword("");
  };

  const handleWalletClick = () => {
    setShowWalletModal(true);
  };

  const handleAddMoney = () => {
    alert('Payment integration required for production. This feature will be implemented with actual payment gateways (e.g., Stripe, PayPal) for real transactions.');
  };

  if (loading || !user) return null;

  // Only use initials or fallback icon for avatar
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600 text-sm">Manage your account settings</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all duration-200"
            >
              <Home className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
          {initials ? (
                  <span className="text-xl font-bold text-white">{initials}</span>
          ) : (
                  <UserIcon className="w-8 h-8 text-white" />
          )}
        </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                <p className="text-gray-500 text-sm">{t('profile.activeUser')}</p>
                <div className="flex items-center mt-1">
                  <Coins className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-gray-600">{user.credits || 0} {t('profile.credits')}</span>
                </div>
              </div>
            </div>
      </div>

          {/* Success/Error Messages */}
        {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {t('profile.updateSuccess')}
          </div>
        )}
        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('personal')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'personal'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <UserIcon className="w-4 h-4" />
                  <span>{t('profile.personalInformation')}</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'password'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>{t('profile.changePassword')}</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'wallet'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Wallet className="w-4 h-4" />
                  <span>{t('profile.digitalWallet')}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('profile.personalInformation')}</h3>
                  {!edit && (
                    <button
                      type="button"
                      className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1"
                      onClick={handleEditClick}
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>{t('common.edit')}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.name')}</label>
            <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              readOnly={!edit}
            />
          </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.email')}</label>
            <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              readOnly={!edit}
            />
          </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.mobile')}</label>
            <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={profile.mobile}
              onChange={e => setProfile({ ...profile, mobile: e.target.value })}
              readOnly={!edit}
            />
          </div>
            </div>

                {edit && (
                  <div className="mt-6 flex space-x-3">
            <button
              onClick={handleSave}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 flex items-center space-x-2"
              disabled={isSubmitting}
            >
                      <Save className="w-4 h-4" />
                      <span>{isSubmitting ? t('common.saving') : t('common.save')}</span>
            </button>
            <button
              type="button"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                      onClick={() => setEdit(false)}
            >
                      {t('common.cancel')}
            </button>
                  </div>
          )}
        </div>
            )}

            {/* Change Password Tab */}
            {activeTab === 'password' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('profile.changePassword')}</h3>
                
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.oldPassword')}</label>
            <Input
              type="password"
                        placeholder={t('profile.oldPassword')}
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
                        className="w-full"
            />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.newPassword')}</label>
            <Input
              type="password"
                        placeholder={t('profile.newPassword')}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
                        className="w-full"
            />
                    </div>
                  </div>
                  
            <button
              type="submit"
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 disabled:bg-gray-400 disabled:text-gray-300 flex items-center space-x-2"
              disabled={!oldPassword || !newPassword}
            >
                    <Lock className="w-4 h-4" />
                    <span>{t('profile.changePassword')}</span>
            </button>
                  
                  {pwMsg && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                      {pwMsg}
                    </div>
                  )}
          </form>
        </div>
            )}

            {/* Wallet Tab */}
            {activeTab === 'wallet' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('profile.digitalWallet')}</h3>
          <button
            type="button"
                    className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1"
                    onClick={handleWalletClick}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{t('profile.manageWallet')}</span>
                  </button>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl p-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-green-600 mb-1">{t('profile.availableBalance')}</div>
                    <div className="text-3xl font-bold text-green-700">रू{walletAmount}</div>
                  </div>
                </div>

                {/* Demo Notice */}
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium mb-1">Demo Wallet</p>
                      <p className="text-xs">This is a demonstration wallet. Real payment integration will be required for production use.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('profile.digitalWallet')}</h3>
              <p className="text-gray-600">{t('footer.managePaymentMethods')}</p>
            </div>
            
            {/* Wallet Balance */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="text-center">
                <div className="text-sm text-green-600 mb-1">{t('profile.availableBalance')}</div>
                <div className="text-3xl font-bold text-green-700">रू{walletAmount}</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3 mb-6">
              <button
                onClick={handleAddMoney}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('footer.addMoney')}
              </button>
              <button
                onClick={() => alert('Transaction history will be available once payment integration is complete.')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <History className="w-4 h-4" />
                {t('footer.transactionHistory')}
              </button>
            </div>

            {/* Development Note */}
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Development Mode</p>
                  <p className="text-xs">This wallet is currently in demo mode. For production, integrate with payment gateways like Stripe, PayPal, or local payment providers.</p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowWalletModal(false)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium"
            >
              {t('common.close')}
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
