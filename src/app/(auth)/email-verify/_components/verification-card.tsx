import { ReactNode } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";

interface VerificationCardProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function VerificationCard({
  title,
  children,
  footer,
}: VerificationCardProps) {
  return (
    <div className="w-full max-w-md px-4 z-10">
      <Card className="shadow-lg  bg-card/80">
        <CardContent className="">{children}</CardContent>
        {footer && (
          <CardFooter className="flex flex-col space-y-2">{footer}</CardFooter>
        )}
      </Card>
    </div>
  );
}

export function VerificationCardFooter() {
  return (
    <div className="text-center text-sm text-muted-foreground">
      Already verified?{" "}
      <Link
        href="/login"
        className="text-primary-font hover:underline font-medium"
      >
        Sign in
      </Link>
    </div>
  );
}
