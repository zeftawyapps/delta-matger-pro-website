"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import styles from "@/components/Navbar/Navbar.module.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { lang, t, loginWithPhone, signupWithPhone } = useApp();

  const [loginMethod, setLoginMethod] = useState<"login" | "signup">("login");
  const [phoneInput, setPhoneInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [authError, setAuthError] = useState("");

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (loginMethod === "login") {
        if (phoneInput.trim().length < 6) {
          throw new Error(lang === "ar" ? "رقم الهاتف غير صالح" : "Invalid phone number");
        }
        await loginWithPhone(phoneInput);
      } else {
        if (!nameInput.trim()) {
          throw new Error(lang === "ar" ? "يرجى إدخال الاسم بالكامل" : "Please enter your full name");
        }
        if (phoneInput.trim().length < 6) {
          throw new Error(lang === "ar" ? "رقم الهاتف غير صالح" : "Invalid phone number");
        }
        await signupWithPhone(nameInput.trim(), phoneInput.trim());
      }
      onClose();
      setNameInput("");
      setPhoneInput("");
    } catch (err: any) {
      setAuthError(err.message || t.loginError);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.loginModal} ${lang === "ar" ? styles.rtl : styles.ltr}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className={styles.modalCloseBtn}>
          ✕
        </button>
        <h3>
          {loginMethod === "signup"
            ? lang === "ar"
              ? "إنشاء حساب جديد"
              : "Create Account"
            : lang === "ar"
            ? "تسجيل الدخول"
            : "Log In"}
        </h3>

        <div style={{ display: "flex", gap: "0.5rem", margin: "1rem 0", justifyContent: "center" }}>
          <button
            type="button"
            className="glowButton"
            style={{
              padding: "0.4rem 1rem",
              fontSize: "0.85rem",
              background: loginMethod === "login" ? "var(--primary)" : "var(--border)",
              color: loginMethod === "login" ? "#fff" : "var(--fg)",
              boxShadow: "none",
            }}
            onClick={() => {
              setLoginMethod("login");
              setAuthError("");
            }}
          >
            {lang === "ar" ? "تسجيل الدخول" : "Log In"}
          </button>
          <button
            type="button"
            className="glowButton"
            style={{
              padding: "0.4rem 1rem",
              fontSize: "0.85rem",
              background: loginMethod === "signup" ? "var(--primary)" : "var(--border)",
              color: loginMethod === "signup" ? "#fff" : "var(--fg)",
              boxShadow: "none",
            }}
            onClick={() => {
              setLoginMethod("signup");
              setAuthError("");
            }}
          >
            {lang === "ar" ? "حساب جديد" : "Sign Up"}
          </button>
        </div>

        <form onSubmit={handleLoginSubmit} className={styles.loginForm}>
          {loginMethod === "login" && (
            <div className={styles.formGroup}>
              <label>{lang === "ar" ? "رقم الهاتف" : "Phone Number"}</label>
              <input
                type="tel"
                required
                placeholder="010xxxxxx"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="customInput"
              />
            </div>
          )}

          {loginMethod === "signup" && (
            <>
              <div className={styles.formGroup}>
                <label>{lang === "ar" ? "الاسم الكامل" : "Full Name"}</label>
                <input
                  type="text"
                  required
                  placeholder={lang === "ar" ? "مثال: أحمد محمد" : "e.g. John Doe"}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="customInput"
                />
              </div>
              <div className={styles.formGroup}>
                <label>{lang === "ar" ? "رقم الهاتف" : "Phone Number"}</label>
                <input
                  type="tel"
                  required
                  placeholder="010xxxxxx"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="customInput"
                />
              </div>
            </>
          )}

          {authError && <p className={styles.errorMessage}>{authError}</p>}
          <button type="submit" className="glowButton" style={{ width: "100%", justifyContent: "center" }}>
            {loginMethod === "signup"
              ? lang === "ar"
                ? "إنشاء حساب"
                : "Sign Up"
              : lang === "ar"
              ? "تسجيل الدخول"
              : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
