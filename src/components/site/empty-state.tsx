import { Inbox } from "lucide-react";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <Inbox className="size-10 mx-auto mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
