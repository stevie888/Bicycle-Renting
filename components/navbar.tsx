"use client";

import NextLink from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthContext";

export const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // More robust role checking
  const isAdmin = user && user.role === 'admin';
  const isAdminPage = pathname?.startsWith('/admin');





  return (
         <nav className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100 shadow-soft w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          {/* Logo Section */}
          <div className="flex flex-col items-center">
            <NextLink className="flex flex-col items-center gap-1 pt-2 group" href="/">
                             <div className="relative">
                 <Logo size={60} />
                 <div className="absolute inset-0 bg-blue-500/10 rounded-full scale-110 group-hover:scale-125 transition-transform duration-300"></div>
               </div>
               <div className="flex flex-col items-center -mt-2">
                 <p className="font-bold text-blue-700 freestyle-script text-xl group-hover:text-blue-800 transition-colors">
                   
                 </p>
               </div>
            </NextLink>
                         {!loading && user && (
               <div className="mt-1">
                 <span className={`text-sm font-medium tracking-wide ${
                   isAdminPage ? 'text-blue-600' : 'text-primary-600'
                 }`}>
                   Welcome, {user.name}
                 </span>
               </div>
             )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {!loading && !user && (
              <>
                <NextLink href="/login">
                                     <button 
                     className="relative group px-3 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-white via-gray-50 to-gray-100 hover:from-gray-50 hover:via-white hover:to-gray-50 text-blue-600 hover:text-blue-700 border border-gray-200 hover:border-blue-300 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 font-medium shadow-sm hover:shadow-md overflow-hidden text-sm sm:text-base min-w-fit"
                   >
                    <span className="relative z-10">Login</span>
                                         <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                  </button>
                </NextLink>
                <NextLink href="/signup">
                                     <button 
                     className="relative group px-3 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-700 hover:via-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl border-0 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 font-semibold overflow-hidden text-sm sm:text-base min-w-fit"
                   >
                    <span className="relative z-10">Sign Up</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                  </button>
                </NextLink>
              </>
            )}
            {!loading && user && (
              <>
                {isAdmin && (
                  <NextLink href="/admin">
                                         <Button 
                       variant="ghost" 
                       className="bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 transition-colors"
                     >
                       👨‍💼 Admin
                     </Button>
                  </NextLink>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
