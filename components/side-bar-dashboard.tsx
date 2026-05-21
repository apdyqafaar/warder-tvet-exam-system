"use client";
import { KeyRound, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { client } from "@/lib/auth-client";
import { useUser } from "@/lib/context/useProvider";
import { getNavigations } from "@/lib/navigations";

export function AppSidebar() {
  const user = useUser();
  const navigations = getNavigations(user?.role || "");
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await client.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/sign-in");
        },
      },
    });
  };

  const activeNave = (route: string) => {
    if (route === "/dashboard/teacher") {
      return pathname === "/dashboard/teacher";
    }

    if (route === "/dashboard/admin") {
      return pathname === "/dashboard/admin";
    }

    return pathname.startsWith(route);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-3 text-xl font-bold">Wardheer Tevet</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            {navigations.map((item) => {
              const active = activeNave(item.route);

              return (
                <Link
                  className={`my-2 flex cursor-pointer items-center rounded p-2 hover:bg-primary/20 ${active && "bg-primary/10"}`}
                  key={item.name}
                  href={item.route}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-primary/5 p-2 transition-colors hover:bg-primary/20">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user?.image || ""}
                  alt={user?.name || "User"}
                />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium">
                  {user?.name}
                </span>
                <span className="truncate text-xs capitalize text-muted-foreground">
                  {user?.role}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56"
            side="right"
            sideOffset={10}
          >
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/${user?.role}/profile`}
                className="flex w-full cursor-pointer items-center"
              >
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/${user?.role}/change-password`}
                className="flex w-full cursor-pointer items-center"
              >
                <KeyRound className="mr-2 h-4 w-4" />
                <span>Change Password</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex cursor-pointer items-center text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
