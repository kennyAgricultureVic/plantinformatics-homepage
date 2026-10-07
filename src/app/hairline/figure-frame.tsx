"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const noop = () => () => {};

/**
 * One Hairline figure page from /public/hairline, in an iframe. The page's own
 * theme follows the site's through its ?theme= parameter, so the frame reloads
 * when the theme changes. The theme is only known on the client, so the server
 * renders an empty placeholder of the same height.
 */
export function FigureFrame({ slug, title }: { slug: string; title: string }) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!mounted || !resolvedTheme) return <div className="h-[700px]" />;

  return (
    <iframe
      key={resolvedTheme}
      src={`/hairline/${slug}.html?theme=${resolvedTheme}`}
      title={title}
      loading="lazy"
      className="h-[700px] w-full border-0"
    />
  );
}
