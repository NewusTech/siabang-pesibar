import { type User } from "@prisma/client"
import { type AvatarProps } from "@radix-ui/react-avatar"

import { Avatar, AvatarFallback } from "~/components/ui/avatar"

import { User as UserIcon } from "lucide-react"

interface UserAvatarProps extends AvatarProps {
  user: Pick<User, "name">
}

export function UserAvatar({ user, ...props }: UserAvatarProps) {
  return (
    <Avatar {...props}>
      <AvatarFallback>
        <span className="sr-only">{user.name}</span>
        <UserIcon className="h-4 w-4" />
      </AvatarFallback>

    </Avatar>
  )
}