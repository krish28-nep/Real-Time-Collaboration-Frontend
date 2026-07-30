import { Card } from "@/components/ui/card";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return <p className="text-sm text-[#77758a]">{label}</p>;
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Card className="p-4 text-sm text-[#cc2f4a]">
      {message}
    </Card>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="p-6 text-center">
      <h2 className="text-xl font-bold text-[#262538]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#77758a]">{description}</p>
    </Card>
  );
}
