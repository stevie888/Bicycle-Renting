import { AxiosError } from "axios";

export function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    return (err.response?.data as any)?.message || err.message || "An unknown error occurred";
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "An unknown error occurred";
}
