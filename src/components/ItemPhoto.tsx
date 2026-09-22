import { useQuery } from "@tanstack/react-query";
import { ImageOff } from "lucide-react";
import { getPhotoUrl } from "@/lib/reports";
import { cn } from "@/lib/utils";

interface Props {
  path: string | null;
  alt: string;
  className?: string;
}

export function ItemPhoto({ path, alt, className }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["photo", path],
    queryFn: () => getPhotoUrl(path),
    enabled: Boolean(path),
    staleTime: 30 * 60 * 1000,
  });

  if (!path || (!isLoading && !data)) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-surface text-muted-foreground",
          className,
        )}
      >
        <ImageOff className="h-6 w-6 opacity-50" aria-hidden />
        <span className="sr-only">No photo available</span>
      </div>
    );
  }

  if (isLoading) return <div className={cn("animate-pulse bg-surface", className)} />;

  return <img src={data!} alt={alt} loading="lazy" className={cn("object-cover", className)} />;
}
