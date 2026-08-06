"use client";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface NewsBackButtonProps {
  fallbackHref: string;
}

export default function NewsBackButton({ fallbackHref }: NewsBackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className="my-2 text-primary-font rounded-full hover:text-foreground"
    >
      <ChevronLeft className=" h-4 w-4" />
      Back
    </Button>
  );
}
