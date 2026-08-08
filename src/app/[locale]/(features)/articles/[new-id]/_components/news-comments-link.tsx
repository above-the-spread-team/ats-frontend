"use client";

import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface NewsCommentsLinkProps {
  count: number;
}

export default function NewsCommentsLink({ count }: NewsCommentsLinkProps) {
  const t = useTranslations("articles");

  return (
    <div
      onClick={() => {
        document.getElementById("comments-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }}
      className="flex items-center hover:text-primary-font transition-colors cursor-pointer"
    >
      <MessageCircle className="h-5 w-5 mr-2" />
      <span>{count} </span>
      <span className="ml-1 md:block hidden">{t("commentsWord")}</span>
    </div>
  );
}
