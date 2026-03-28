"use client";

import { Badge } from "@/components/ui/badge";
import type { UserResponse } from "@/lib/types";

interface UserTableProps {
  users: UserResponse[];
  onSelect: (user: UserResponse) => void;
}

export function UserTable({ users, onSelect }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border py-16">
        <p className="text-sm text-muted-foreground">유저가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/30">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">닉네임</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">아이디</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">이메일</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">역할</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">가입일</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <tr
              key={user.id}
              onClick={() => onSelect(user)}
              className={[
                "cursor-pointer transition-colors hover:bg-secondary/40",
                i < users.length - 1 ? "border-b border-border" : "",
              ].join(" ")}
            >
              <td className="px-4 py-3 font-medium text-foreground">{user.nickname}</td>
              <td className="px-4 py-3 text-muted-foreground">{user.username}</td>
              <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
              <td className="px-4 py-3">
                <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                  {user.role}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString("ko-KR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
