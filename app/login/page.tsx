import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mt-8"></h1>
      <AuthForm mode="login" />
    </div>
  );
} 