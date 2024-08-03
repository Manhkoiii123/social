import avatarPlaholder from "@/assets/avatar-placeholder.png";
import { cn } from "@/lib/utils";
import Image from "next/image";
interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  size?: number;
  className?: string;
}
export default function UserAvatar({
  avatarUrl,
  size,
  className,
}: UserAvatarProps) {
  return (
    <Image
      src={avatarUrl || avatarPlaholder}
      alt="User"
      width={size ?? 48}
      height={size ?? 48}
      className={cn(
        "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
        className,
      )}
    />
  );
}