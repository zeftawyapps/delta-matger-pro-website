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
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);
    try {
      if (phoneInput.trim().length < 6) {
        throw new Error(lang === "ar" ? "رقم الهاتف غير صالح" : "Invalid phone number");
      }
      if (passwordInput.trim().length < 6) {
        throw new Error(
          lang === "ar"
            ? "كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام"
            : "Password must be at least 6 characters"
        );
      }

      if (loginMethod === "login") {
        await loginWithPhone(phoneInput.trim(), passwordInput.trim());
      } else {
        if (!nameInput.trim()) {
          throw new Error(lang === "ar" ? "يرجى إدخال الاسم بالكامل" : "Please enter your full name");
        }
        await signupWithPhone(nameInput.trim(), phoneInput.trim(), passwordInput.trim());
      }
      onClose();
      setNameInput("");
      setPhoneInput("");
      setPasswordInput("");
    } catch (err: any) {
      setAuthError(err.message || t.loginError);
    } finally {
      setIsSubmitting(false);
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

          <div className={styles.formGroup}>
            <label>{lang === "ar" ? "كلمة المرور" : "Password"}</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder={
                  loginMethod === "signup"
                    ? lang === "ar"
                      ? "اختر كلمة مرور (6 خانات فأكثر)"
                      : "Choose a password (6+ characters)"
                    : lang === "ar"
                    ? "أدخل كلمة المرور"
                    : "Enter your password"
                }
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="customInput"
                style={{ width: "100%", paddingInlineEnd: "2.75rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  insetInlineEnd: "0.75rem",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  opacity: 0.7,
                  color: "inherit",
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {authError && <p className={styles.errorMessage}>{authError}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="glowButton"
            style={{ width: "100%", justifyContent: "center" }}
          >
            {isSubmitting
              ? lang === "ar"
                ? "جاري التنفيذ..."
                : "Please wait..."
              : loginMethod === "signup"
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

