import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#eff4ff] p-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#3525cd]">Next Chat</h1>
          <p className="mt-1 text-sm text-[#464555]">Login to continue to your workspace.</p>
        </div>

        <LoginForm />

        <p className="mt-4 text-center text-sm">
          No account?{" "}
          <Link className="font-semibold text-[#3525cd]" href="/register">
            Register
          </Link>
        </p>
      </Card>
    </main>
  );
}
