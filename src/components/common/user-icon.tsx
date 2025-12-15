import { User } from "@/type/fastapi/user";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UserIcon({ user }: { user: User }) {
  return (
    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-mygray flex items-center justify-center text-muted-foreground flex-shrink-0 overflow-hidden">
      <span className="text-sm md:text-base font-semibold">
        {getInitials(user.username)}
      </span>
    </div>
  );
}
