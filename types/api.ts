export interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
}
