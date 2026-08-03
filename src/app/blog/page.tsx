"use client";

import React, { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import HomepageWrapper from "../page";

export default function BlogRoute() {
  const { setAppMode } = useApp();

  useEffect(() => {
    setAppMode("blog");
  }, []);

  return <HomepageWrapper />;
}
