import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { width: 100, height: 32 },
  md: { width: 120, height: 38 },
  lg: { width: 140, height: 44 },
};

export function Logo({ href = "/", className, size = "md" }: LogoProps) {
  const { width, height } = sizes[size];

  const image = (
    <>
      {/* Light mode logo */}
      <Image
        src="/logo.svg"
        alt="Outcry"
        width={width}
        height={height}
        className="block dark:hidden"
        priority
      />
      {/* Dark mode logo */}
      <Image
        src="/logo-dark.svg"
        alt="Outcry"
        width={width}
        height={height}
        className="hidden dark:block"
        priority
      />
    </>
  );

  if (!href) return <div className={cn("flex items-center", className)}>{image}</div>;

  return (
    <Link href={href} className={cn("flex items-center", className)}>
      {image}
    </Link>
  );
}
