"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "", size = 24 }: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same dimensions during SSR
    return (
      <div 
        className={`bg-muted animate-pulse rounded ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Determine which logo to use based on theme
  // Dark theme = white logo, Light theme = black logo
  const logoSrc = resolvedTheme === "dark" ? "/logos/white.png" : "/logos/black.png";

  return (
    <Image
      src={logoSrc}
      alt="ZenVerifier Logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority
    />
  );
}
