"use client";

import { create } from "zustand";
import {
  OrgConfig,
  BlogCategory,
  BlogPost,
  Product,
  Offer,
} from "@/types";

interface CatalogState {
  config: OrgConfig | null;
  categories: BlogCategory[];
  productCategories: any[];
  posts: BlogPost[];
  products: Product[];
  offers: Offer[];
  loading: boolean;

  setConfig: (config: OrgConfig | null) => void;
  setCategories: (categories: BlogCategory[]) => void;
  setProductCategories: (productCategories: any[]) => void;
  setPosts: (posts: BlogPost[]) => void;
  setProducts: (products: Product[]) => void;
  setOffers: (offers: Offer[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  config: null,
  categories: [],
  productCategories: [],
  posts: [],
  products: [],
  offers: [],
  loading: true,

  setConfig: (config) => set({ config }),
  setCategories: (categories) => set({ categories }),
  setProductCategories: (productCategories) => set({ productCategories }),
  setPosts: (posts) => set({ posts }),
  setProducts: (products) => set({ products }),
  setOffers: (offers) => set({ offers }),
  setLoading: (loading) => set({ loading }),
}));

