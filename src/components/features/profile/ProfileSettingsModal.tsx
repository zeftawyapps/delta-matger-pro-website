"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { api, BASE_URL } from "@/services/api";
import styles from "@/components/Navbar/Navbar.module.css";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { lang, currentUser, profile, authToken, updateProfile } = useApp();

  const [countries, setCountries] = useState<any[]>([]);
  const [governorates, setGovernorates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [settingsName, setSettingsName] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsAddress, setSettingsAddress] = useState("");
  const [settingsCountryId, setSettingsCountryId] = useState("");
  const [settingsGovId, setSettingsGovId] = useState("");
  const [settingsCityId, setSettingsCityId] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettingsLoading(true);

      const initName = currentUser?.name || profile?.name || profile?.username || "";
      const initPhone = profile?.phone || currentUser?.phone || "";
      const initAddress = profile?.address || "";
      const initCountryId = profile?.countryId || "EG";
      const initGovId = profile?.governorateId || "";
      const initCityId = profile?.cityId || "";

      setSettingsName(initName);
      setSettingsPhone(initPhone);
      setSettingsAddress(initAddress);
      setSettingsCountryId(initCountryId);
      setSettingsGovId(initGovId);
      setSettingsCityId(initCityId);

      (async () => {
        try {
          let countriesData = await api.getCountries().catch(() => []);
          if (countriesData.length === 0) {
            await fetch(`${BASE_URL}/locations/governorates/seed`, { method: "POST" }).catch(
              () => null
            );
            countriesData = await api.getCountries().catch(() => []);
          }
          setCountries(countriesData);

          if (initCountryId) {
            const govs = await api.getGovernorates(initCountryId).catch(() => []);
            setGovernorates(govs);

            if (initGovId) {
              const cts = await api.getCities(initGovId).catch(() => []);
              setCities(cts);
            }
          }
        } catch (err) {
          console.error("Error loading profile locations:", err);
        } finally {
          setSettingsLoading(false);
        }
      })();
    }
  }, [isOpen, profile, currentUser]);

  const handleSettingsCountryChange = async (newCountryId: string) => {
    setSettingsCountryId(newCountryId);
    setSettingsGovId("");
    setSettingsCityId("");
    setGovernorates([]);
    setCities([]);
    if (newCountryId) {
      try {
        const govs = await api.getGovernorates(newCountryId);
        setGovernorates(govs);
      } catch (err) {
        console.error("Error loading governorates:", err);
      }
    }
  };

  const handleSettingsGovChange = async (newGovId: string) => {
    setSettingsGovId(newGovId);
    setSettingsCityId("");
    setCities([]);
    if (newGovId) {
      try {
        const cts = await api.getCities(newGovId);
        setCities(cts);
      } catch (err) {
        console.error("Error loading cities:", err);
      }
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    setSettingsLoading(true);
    try {
      await updateProfile({
        name: settingsName,
        username: profile?.username || settingsName,
        phone: settingsPhone,
        address: settingsAddress,
        countryId: settingsCountryId,
        governorateId: settingsGovId,
        cityId: settingsCityId,
      });

      alert(
        lang === "ar" ? "تم تحديث الملف الشخصي بنجاح!" : "Profile updated successfully!"
      );
      onClose();
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      alert(
        lang === "ar"
          ? `فشل الحفظ: ${err.message || "خطأ غير معروف"}`
          : `Save failed: ${err.message || "Unknown error"}`
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.loginModal} ${lang === "ar" ? styles.rtl : styles.ltr}`}
        style={{ maxWidth: "520px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className={styles.modalCloseBtn}>
          ✕
        </button>
        <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
          👤 {lang === "ar" ? "تعديل الملف الشخصي" : "Edit Profile"}
        </h3>

        <form onSubmit={handleSettingsSubmit} className={styles.loginForm}>
          <div className="customInputGroup">
            <label className="inputLabel">
              <span className="labelIcon">👤</span>
              <span>{lang === "ar" ? "الاسم" : "Name"}</span>
            </label>
            <input
              type="text"
              required
              placeholder={lang === "ar" ? "الاسم الكامل" : "Full Name"}
              value={settingsName}
              onChange={(e) => setSettingsName(e.target.value)}
              className="customInput"
            />
          </div>

          <div className="customInputGroup">
            <label className="inputLabel">
              <span className="labelIcon">📱</span>
              <span>{lang === "ar" ? "رقم الهاتف" : "Phone Number"}</span>
            </label>
            <input
              type="tel"
              required
              placeholder="010xxxxxx"
              value={settingsPhone}
              onChange={(e) => setSettingsPhone(e.target.value)}
              className="customInput"
            />
          </div>

          <div className="customInputGroup">
            <label className="inputLabel">
              <span className="labelIcon">🌍</span>
              <span>{lang === "ar" ? "الدولة" : "Country"}</span>
            </label>
            <select
              value={settingsCountryId}
              onChange={(e) => handleSettingsCountryChange(e.target.value)}
              className="customInput customSelect"
              required
            >
              <option value="">{lang === "ar" ? "-- اختر الدولة --" : "-- Select Country --"}</option>
              {countries.map((c) => {
                const nameStr =
                  typeof c.name === "string"
                    ? c.name
                    : c.name?.[lang] || c.name?.ar || c.name?.en || c.id;
                return (
                  <option key={c.id} value={c.id}>
                    {nameStr}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="customInputGroup">
            <label className="inputLabel">
              <span className="labelIcon">🏛️</span>
              <span>{lang === "ar" ? "المحافظة" : "Governorate"}</span>
            </label>
            <select
              value={settingsGovId}
              onChange={(e) => handleSettingsGovChange(e.target.value)}
              className="customInput customSelect"
              required
              disabled={!settingsCountryId}
            >
              <option value="">
                {lang === "ar" ? "-- اختر المحافظة --" : "-- Select Governorate --"}
              </option>
              {governorates.map((g) => {
                const nameStr =
                  typeof g.name === "string"
                    ? g.name
                    : g.name?.[lang] || g.name?.ar || g.name?.en || g.id;
                return (
                  <option key={g.id} value={g.id}>
                    {nameStr}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="customInputGroup">
            <label className="inputLabel">
              <span className="labelIcon">🏙️</span>
              <span>{lang === "ar" ? "المدينة" : "City"}</span>
            </label>
            <select
              value={settingsCityId}
              onChange={(e) => setSettingsCityId(e.target.value)}
              className="customInput customSelect"
              required
              disabled={!settingsGovId}
            >
              <option value="">{lang === "ar" ? "-- اختر المدينة --" : "-- Select City --"}</option>
              {cities.map((ct) => {
                const nameStr =
                  typeof ct.name === "string"
                    ? ct.name
                    : ct.name?.[lang] || ct.name?.ar || ct.name?.en || ct.id;
                return (
                  <option key={ct.id} value={ct.id}>
                    {nameStr}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="customInputGroup">
            <label className="inputLabel">
              <span className="labelIcon">🏡</span>
              <span>{lang === "ar" ? "العنوان بالتفصيل" : "Detailed Address"}</span>
            </label>
            <input
              type="text"
              required
              placeholder={
                lang === "ar" ? "الشارع، رقم البناء، الشقة" : "Street, Building, Apartment"
              }
              value={settingsAddress}
              onChange={(e) => setSettingsAddress(e.target.value)}
              className="customInput"
            />
          </div>

          <button
            type="submit"
            disabled={settingsLoading}
            className="glowButton"
            style={{ width: "100%", justifyContent: "center", marginTop: "1rem", padding: "0.85rem" }}
          >
            {settingsLoading
              ? lang === "ar"
                ? "⏳ جاري الحفظ..."
                : "⏳ Saving..."
              : lang === "ar"
              ? "💾 حفظ التغييرات"
              : "💾 Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

