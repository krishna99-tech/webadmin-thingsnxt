"use client";

import React from "react";
import { Button, Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import { Menu, Bell, Search, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={onMenuClick}
            className="lg:hidden"
          >
            <Menu size={18} />
          </Button>
          
          <Breadcrumbs size="sm" className="hidden sm:flex">
            <BreadcrumbItem>Home</BreadcrumbItem>
            <BreadcrumbItem>Dashboard</BreadcrumbItem>
          </Breadcrumbs>
        </div>

        <div className="flex items-center gap-2">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          
          <Button isIconOnly variant="light" size="sm">
            <Search size={16} />
          </Button>
          
          <Button isIconOnly variant="light" size="sm" className="relative">
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
        </div>
      </div>
    </header>
  );
}
