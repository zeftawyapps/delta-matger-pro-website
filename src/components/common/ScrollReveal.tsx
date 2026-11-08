"use client";

import React, { useEffect, useRef, useState } from "react";
import { SectionAnimationConfig, SectionAnimationType } from "@/types";

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: SectionAnimationConfig;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

export default function ScrollReveal({
  children,
  animation,
  className = "",
  style,
  id,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const animType: SectionAnimationType = animation?.type || "fade_up";
  const isNone = animType === "none";

  useEffect(() => {
    if (isNone) {
      setIsRevealed(true);
      return;
    }

    if (typeof window !== "undefined") {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        setIsRevealed(true);
        return;
      }
    }

    const node = containerRef.current;
    if (!node) return;

    // Use IntersectionObserver to trigger animation when section scrolls into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            if (animation?.once !== false) {
              observer.unobserve(entry.target);
            }
          } else if (animation?.once === false) {
            setIsRevealed(false);
          }
        });
      },
      {
        threshold: animation?.threshold ?? 0.08,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [isNone, animation?.once, animation?.threshold]);

  if (isNone) {
    return (
      <div id={id} className={className} style={style}>
        {children}
      </div>
    );
  }

  const durationMs = animation?.duration ?? 650;
  const delayMs = animation?.delay ?? 0;

  const animClass = `scrollAnim_${animType}`;
  const revealClass = isRevealed ? "isRevealed" : "";

  const mergedStyle: React.CSSProperties = {
    ...style,
    ["--reveal-duration" as any]: `${durationMs}ms`,
    ["--reveal-delay" as any]: `${delayMs}ms`,
  };

  return (
    <div
      ref={containerRef}
      id={id}
      className={`scrollRevealContainer ${animClass} ${revealClass} ${className}`.trim()}
      style={mergedStyle}
    >
      {children}
    </div>
  );
}

