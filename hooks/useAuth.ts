import { useState } from "react";
import { TokenData } from "@/types/api";
import { LoginCredentials } from "@/types/auth";
import { saveTokensToStorage } from "@/utils/token";
import { apiCall } from "@/lib/useFetch";
import  {toast} from "react-hot-toast";
import { getErrorMessage } from "@/utils/axios-error";

export const useAuth = () => {
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const {data:result} = await apiCall<TokenData>("POST", "/auth/login", { body: credentials });
      if(result){
        saveTokensToStorage({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        });
        toast.success("Login successful");
      }
      setData(result);
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    login,
  };
};
