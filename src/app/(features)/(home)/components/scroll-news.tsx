"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useNews } from "@/services/fastapi/news";
import Image from "next/image";

export function ScrollNews() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const { data: newsData, isLoading, error } = useNews(1, 5);

  useEffect(() => {
    if (!api || !newsData?.items?.length) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        // If at the end, scroll back to the beginning
        api.scrollTo(0);
      }
    }, 3000); // Auto-scroll every 3 seconds

    return () => {
      clearInterval(interval);
      api.off("select", onSelect);
    };
  }, [api, newsData]);

  if (isLoading) {
    return (
      <div className="relative w-full max-w-2xl">
        <Card>
          <CardContent className="flex aspect-[4/3] items-center justify-center p-6">
            <span className="text-muted-foreground">Loading news...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full max-w-2xl">
        <Card>
          <CardContent className="flex aspect-[4/3] items-center justify-center p-6">
            <span className="text-destructive">Failed to load news</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  const newsItems = newsData?.items || [];

  if (newsItems.length === 0) {
    return (
      <div className="relative w-full max-w-2xl">
        <Card>
          <CardContent className="flex aspect-[4/3] items-center justify-center p-6">
            <span className="text-muted-foreground">No news available</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent>
          {newsItems.map((news) => (
            <CarouselItem key={news.id}>
              <div className="p-1 w-full">
                <Card>
                  <CardContent className="p-0 relative aspect-[4/3] overflow-hidden">
                    {news.image_url ? (
                      <Image
                        src={news.image_url}
                        alt={news.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 672px"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                    {/* Overlay with title */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
                      <h3 className="text-white text-xl font-semibold line-clamp-2">
                        {news.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-white/80 text-sm">
                        <span>{news.author.username}</span>
                        <span>•</span>
                        <span>
                          {new Date(news.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {newsItems.map((news, index) => (
          <button
            key={news.id}
            onClick={() => api?.scrollTo(index)}
            className={`transition-all duration-300 rounded-full ${
              current === index
                ? "w-8 h-2 bg-muted-foreground/60"
                : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Go to ${news.title}`}
          />
        ))}
      </div>
    </div>
  );
}
