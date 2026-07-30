import { Card } from "@/components/ui/card";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return <p className="text-sm text-[#77758a]">{label}</p>;
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Card className="max-w-full p-4 text-sm text-[#cc2f4a] [overflow-wrap:anywhere]">
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
    <Card className="w-full max-w-full p-6 text-center max-sm:p-4">
      <h2 className="text-xl font-bold text-[#262538] max-sm:text-lg">{title}</h2>
      <p className="mx-auto mt-2 max-w-full text-sm text-[#77758a] max-sm:text-xs">{description}</p>
    </Card>
  );
}
