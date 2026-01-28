import { ReactNode } from "react";
import { BreadcrumbNavigation } from "./BreadcrumbNavigation";
import { BreadcrumbItem as BreadcrumbItemType } from "./BreadcrumbNavigation/types";
import { cn } from "@/lib/utils";
import { SignInButton } from "@clerk/nextjs";
import { SignedIn, SignedOut, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";

interface PageHeaderProps {
  title?: string;
  description?: string;
  breadcrumbItems: BreadcrumbItemType[];
  className?: string;
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbItems,
  className,
  children,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}>
      <div className="px-4 py-6">
        {/* Breadcrumb Navigation */}
        <div className="mb-4 flex justify-between">
          <BreadcrumbNavigation items={breadcrumbItems} maxDisplayItems={4} className="text-sm" />
          <div className="flex gap-2">
            <SignedOut>
              <div className="flex gap-2">
                <SignInButton mode="modal">
                  <Button>Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Sign Up</Button>
                </SignUpButton>
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>

        <div className="flex flex-row justify-between">
          {/* Page Title and Description */}
          <div className="flex flex-col gap-2">
            {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
            {description && <p className="text-muted-foreground text-lg">{description}</p>}
          </div>

          {/* Additional content */}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </header>
  );
}
