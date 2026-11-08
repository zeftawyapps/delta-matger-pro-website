"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import SectionHeader from "@/components/common/SectionHeader";
import styles from "./Sections.module.css";

interface VideoExplainerShowcaseProps {
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  config?: Record<string, any>;
}

export default function VideoExplainerShowcase({
  title,
  description,
  config = {},
}: VideoExplainerShowcaseProps) {
  const { lang } = useApp();
  const { titleText, descText, hasHeader } = getSectionHeaderTexts({ title, description }, lang);

  const videoUrl = config.videoUrl || "";
  const videoType = config.videoType || "youtube";
  const ctaButtonText = resolveLocalizedText(config.ctaButtonText || config.buttonText, lang);
  const ctaButtonLink = config.ctaButtonLink || config.buttonLink || "/store";

  if (!videoUrl) return null;

  return (
    <section className={`${styles.sectionContainer} animateFadeUp`}>
      <SectionHeader
        title={titleText}
        subtitle={descText}
        config={config}
      />

      <div className={styles.videoWrapper}>
        <div className={styles.videoFrameContainer}>
          {videoType === "mp4" || videoUrl.endsWith(".mp4") ? (
            <video
              src={videoUrl}
              poster={config.posterImageUrl}
              controls
              className={styles.videoIframe}
            />
          ) : (
            <iframe
              src={videoUrl}
              title={titleText || "Explainer Video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.videoIframe}
            />
          )}
        </div>

        {ctaButtonText && (
          <Link
            href={ctaButtonLink}
            className="glowButton"
            style={{ padding: "0.95rem 2.25rem", fontSize: "1.05rem" }}
          >
            🚀 {ctaButtonText}
          </Link>
        )}
      </div>
    </section>
  );
}

