"use client";

import React, { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import HomepageWrapper from "../page";

export default function StoreRoute() {
  const { setAppMode } = useApp();

  useEffect(() => {
    setAppMode("store");
  }, []);

  return <HomepageWrapper />;
}
