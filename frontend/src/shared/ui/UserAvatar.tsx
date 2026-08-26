import { useEffect, useState } from "react";
import { assetUrl } from "../lib/assetUrl";
import { cn } from "../lib/cn";
import { FolderCover } from "../../domains/folders/components/FolderCover";
import type { CoverType } from "../../domains/folders/types";

const sizeClasses = {
  sm: "h-5 w-5 text-[10px]",
  md: "h-7 w-7 text-[11px]",
  lg: "h-20 w-20 text-xl",
  xl: "h-36 w-36 text-4xl",
} as const;

interface UserAvatarProps {
  nickname: string;
  avatarUrl?: string | null;
  avatarType?: CoverType | null;
  avatarValue?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function UserAvatar({
  nickname,
  avatarUrl,
  avatarType,
  avatarValue,
  size = "md",
  className,
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const initial = nickname.slice(0, 1);
  const imageSrc = avatarType === "IMAGE" ? avatarValue ?? avatarUrl : avatarUrl;
  const styled = avatarType && avatarType !== "IMAGE" && avatarValue;

  useEffect(() => {
    setFailed(false);
  }, [imageSrc]);

  if (styled) {
    return (
      <span className={cn("relative block shrink-0 overflow-hidden rounded-full", sizeClasses[size], className)}>
        <FolderCover coverType={avatarType} coverValue={avatarValue} />
      </span>
    );
  }

  if (imageSrc && !failed) {
    return (
      <img
        src={assetUrl(imageSrc)}
        alt=""
        onError={() => setFailed(true)}
        className={cn("shrink-0 rounded-full object-cover", sizeClasses[size], className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-500/15 font-semibold text-brand-600",
        sizeClasses[size],
        className
      )}
    >
      {initial}
    </span>
  );
}
