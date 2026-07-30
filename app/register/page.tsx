import Link from "next/link";
import { RegisterForm } from "@/components/forms/register-form";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#eff4ff] p-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#3525cd]">Create account</h1>
          <p className="mt-1 text-sm text-[#464555]">Join your collaboration workspace.</p>
        </div>

        <RegisterForm />

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link className="font-semibold text-[#3525cd]" href="/login">
            Login
          </Link>
        </p>
      </Card>
    </main>
  );
}
