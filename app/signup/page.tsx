import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mt-8"></h1>
      <AuthForm mode="signup" />
    </div>
  );
} 