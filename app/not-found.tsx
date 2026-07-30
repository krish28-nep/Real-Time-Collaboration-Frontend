import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f8faff] p-6">
      <Card className="w-full max-w-md p-6 text-center">
        <p className="text-sm font-semibold uppercase text-[#77758a]">404</p>
        <h1 className="mt-2 text-2xl font-bold text-[#262538]">Page not found</h1>
        <p className="mt-2 text-sm text-[#77758a]">The page you are looking for does not exist.</p>
        <Link href="/workspaces" className="mt-5 inline-block">
          <Button>Go to workspaces</Button>
        </Link>
      </Card>
    </main>
  );
}
