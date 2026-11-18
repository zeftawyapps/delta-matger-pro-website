"use client";

import { create } from "zustand";
import { AuthUser, UserProfile, OrganizationPolicy } from "@/types";
import { authService } from "@/services/auth.service";
import { catalogService } from "@/services/catalog.service";

interface AuthState {
  authToken: string | null;
  currentUser: AuthUser | null;
  profile: UserProfile | null;
  organizationPolicy: OrganizationPolicy | null;

  setAuthToken: (token: string | null) => void;
  setCurrentUser: (user: AuthUser | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setOrganizationPolicy: (policy: OrganizationPolicy | null) => void;

  loginWithCredentials: (
    emailOrUsername: string,
    password: string,
    orgId?: string
  ) => Promise<void>;
  loginWithPhone: (
    phone: string,
    password: string,
    orgId?: string
  ) => Promise<void>;
  signupWithPhone: (
    name: string,
    phone: string,
    password: string,
    orgId?: string
  ) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (profileInput: UserProfile) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authToken: null,
  currentUser: null,
  profile: null,
  organizationPolicy: null,

  setAuthToken: (authToken) => set({ authToken }),
  setCurrentUser: (currentUser) => set({ currentUser }),
  setProfile: (profile) => set({ profile }),
  setOrganizationPolicy: (organizationPolicy) => set({ organizationPolicy }),

  refreshProfile: async () => {
    const { authToken } = get();
    if (!authToken) return;
    const profileData = await authService.getMyProfile(authToken);
    set({ profile: profileData });
  },

  updateProfile: async (profileInput) => {
    const { authToken, currentUser } = get();
    if (!authToken) throw new Error("User is not authenticated");

    const updatedProfile = await authService.updateMyProfile(
      profileInput,
      authToken
    );
    set({ profile: updatedProfile });

    if (updatedProfile && currentUser) {
      set({
        currentUser: {
          ...currentUser,
          username: updatedProfile.username || currentUser.username,
          phone: updatedProfile.phone || currentUser.phone,
          name:
            updatedProfile.name ||
            updatedProfile.username ||
            updatedProfile.phone ||
            currentUser.name,
        },
      });
    }
  },

  loginWithCredentials: async (emailOrUsername, password, orgId) => {
    const auth = await authService.login(emailOrUsername, password, orgId);
    authService.setStoredToken(auth.token);
    set({ authToken: auth.token, currentUser: auth.user });

    try {
      const profileData = await authService.getMyProfile(auth.token);
      set({ profile: profileData });
    } catch {
      set({ profile: null });
    }

    if (orgId) {
      const policy = await catalogService.getOrganizationPolicy(
        orgId,
        auth.token
      );
      set({ organizationPolicy: policy });
    }
  },

  loginWithPhone: async (phone, password, orgId) => {
    const auth = await authService.loginByPhone({
      phone,
      password,
      organizationId: orgId,
    });
    authService.setStoredToken(auth.token);
    set({ authToken: auth.token, currentUser: auth.user });

    try {
      const profileData = await authService.getMyProfile(auth.token);
      set({ profile: profileData });
    } catch {
      set({ profile: null });
    }

    if (orgId) {
      const policy = await catalogService.getOrganizationPolicy(
        orgId,
        auth.token
      );
      set({ organizationPolicy: policy });
    }
  },

  signupWithPhone: async (name, phone, password, orgId) => {
    await authService.signupCustomer({
      name,
      phone,
      password,
      organizationId: orgId,
    });
    await get().loginWithPhone(phone, password, orgId);
  },

  logout: () => {
    authService.clearStoredToken();
    set({
      authToken: null,
      currentUser: null,
      profile: null,
      organizationPolicy: null,
    });
  },
}));

