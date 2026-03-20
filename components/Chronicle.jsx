"use client";

import { useState, useCallback, useRef, useEffect, useId } from "react";
import {
  Pulse, FileText, Pill, Flask, Upload, Plus,
  CaretRight, Calendar, MapPin, ArrowLeft,
  CheckCircle, TrendUp, TrendDown, Minus,
  Stethoscope, Lightning, Moon, Sun, Heart,
  Clock, CaretDown, CaretUp, WarningCircle,
  Sparkle, ArrowRight, Eye, EyeSlash, SignOut
} from "@phosphor-icons/react";

// ─── Data ────────────────────────────────────────────────────────────────────

const CONDITIONS = [
  { id: "c1", name: "Generalized Anxiety Disorder", status: "managed", diagnosed: "2022-03-15", notes: "On SSRIs since 2022. Stable with therapy." },
  { id: "c2", name: "Vitamin D Deficiency", status: "active", diagnosed: "2023-11-20", notes: "Levels at 18 ng/mL. Supplementing." },
  { id: "c3", name: "Allergic Rhinitis", status: "resolved", diagnosed: "2021-06-10", notes: "Seasonal. Resolved with antihistamines." },
  { id: "c4", name: "Lower Back Pain", status: "managed", diagnosed: "2024-08-05", notes: "Postural. Physiotherapy recommended." },
];

const VISITS = [
  { id: "v1", date: "2024-12-10", doctor: "Dr. Meera Sharma", specialty: "Psychiatry", clinic: "Mindwell Clinic, Koramangala", diagnosis: "GAD — dose adjustment", notes: "Increased Escitalopram to 15mg. Follow-up in 6 weeks.", conditionId: "c1", hasDoc: true },
  { id: "v2", date: "2024-11-28", doctor: "Dr. Rajesh Iyer", specialty: "Internal Medicine", clinic: "Apollo Clinic, HSR Layout", diagnosis: "Vitamin D — persistent", notes: "Continue D3 60K weekly. Recheck in 3 months.", conditionId: "c2", hasDoc: true },
  { id: "v3", date: "2024-09-05", doctor: "Dr. Meera Sharma", specialty: "Psychiatry", clinic: "Mindwell Clinic, Koramangala", diagnosis: "GAD — stable", notes: "Continue current medication. Good progress.", conditionId: "c1", hasDoc: true },
  { id: "v4", date: "2024-06-15", doctor: "Dr. Rajesh Iyer", specialty: "Internal Medicine", clinic: "Apollo Clinic, HSR Layout", diagnosis: "Vitamin D — improving", notes: "Levels at 24 ng/mL. Continue supplementation.", conditionId: "c2", hasDoc: false },
  { id: "v5", date: "2024-03-20", doctor: "Dr. Meera Sharma", specialty: "Psychiatry", clinic: "Mindwell Clinic, Koramangala", diagnosis: "GAD — acute episode", notes: "Added Clonazepam 0.25mg SOS.", conditionId: "c1", hasDoc: true },
  { id: "v6", date: "2023-09-12", doctor: "Dr. Anil Kumar", specialty: "ENT", clinic: "Manipal Hospital", diagnosis: "Allergic rhinitis", notes: "Levocetirizine + nasal spray.", conditionId: "c3", hasDoc: false },
  { id: "v7", date: "2024-08-05", doctor: "Dr. Priya Nair", specialty: "Orthopedics", clinic: "Fortis Hospital", diagnosis: "Lumbar strain — postural", notes: "Physiotherapy 2x/week for 6 weeks.", conditionId: "c4", hasDoc: true },
];

const MEDICATIONS = [
  { id: "m1", generic: "Escitalopram", brand: "Nexito", dosage: "15mg", frequency: "Once daily", time: "morning", startDate: "2022-03-15", endDate: null, status: "active", conditionId: "c1" },
  { id: "m2", generic: "Clonazepam", brand: "Clonafit", dosage: "0.25mg", frequency: "SOS", time: "as needed", startDate: "2024-03-20", endDate: null, status: "active", conditionId: "c1" },
  { id: "m3", generic: "Cholecalciferol", brand: "D-Rise 60K", dosage: "60,000 IU", frequency: "Weekly", time: "sunday", startDate: "2023-11-20", endDate: null, status: "active", conditionId: "c2" },
  { id: "m4", generic: "Levocetirizine", brand: "Xyzal", dosage: "5mg", frequency: "Once daily", time: null, startDate: "2023-09-12", endDate: "2023-10-12", status: "past", conditionId: "c3" },
  { id: "m5", generic: "Aceclofenac + Paracetamol", brand: "Zerodol-P", dosage: "100mg+325mg", frequency: "Twice daily", time: null, startDate: "2024-08-05", endDate: "2024-08-19", status: "past", conditionId: "c4" },
];

const LAB_RESULTS = [
  { id: "l1", date: "2024-11-28", test: "Vitamin D", value: "22", unit: "ng/mL", refRange: "30–100", flag: "low", lab: "SRL", conditionId: "c2" },
  { id: "l2", date: "2024-06-15", test: "Vitamin D", value: "24", unit: "ng/mL", refRange: "30–100", flag: "low", lab: "SRL", conditionId: "c2" },
  { id: "l3", date: "2023-11-20", test: "Vitamin D", value: "18", unit: "ng/mL", refRange: "30–100", flag: "low", lab: "SRL", conditionId: "c2" },
  { id: "l4", date: "2024-11-28", test: "CBC", value: "Normal", unit: "", refRange: "", flag: "normal", lab: "SRL", conditionId: null },
  { id: "l5", date: "2024-11-28", test: "TSH", value: "3.2", unit: "mIU/L", refRange: "0.4–4.0", flag: "normal", lab: "SRL", conditionId: null },
  { id: "l6", date: "2024-11-28", test: "HbA1c", value: "5.4", unit: "%", refRange: "<5.7", flag: "normal", lab: "SRL", conditionId: null },
];

const INSIGHTS = [
  { id: "i1", icon: WarningCircle, title: "Follow-up overdue", body: "Dr. Sharma asked for a 6-week follow-up after your Dec visit. That was 11 weeks ago.", action: "Schedule visit", color: { light: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", icon: "#ef4444" }, dark: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.12)", text: "#fca5a5", icon: "#f87171" } } },
  { id: "i2", icon: TrendUp, title: "Vitamin D — still below range", body: "18 → 24 → 22 ng/mL over three tests. Trending better but last reading dipped. Recheck due this month.", action: "View trend", color: { light: { bg: "#fffbeb", border: "#fed7aa", text: "#92400e", icon: "#f59e0b" }, dark: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.1)", text: "#fbbf24", icon: "#f59e0b" } } },
  { id: "i3", icon: Sparkle, title: "2.8 years on Escitalopram", body: "You've been stable. Worth discussing tapering with Dr. Sharma at your next visit.", action: null, color: { light: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", icon: "#22c55e" }, dark: { bg: "rgba(34,197,94,0.06)", border: "rgba(34,197,94,0.1)", text: "#86efac", icon: "#22c55e" } } },
  { id: "i4", icon: CheckCircle, title: "CBC, TSH, HbA1c all clear", body: "November blood work came back normal. No action needed.", action: null, color: { light: { bg: "#faf9f7", border: "#e7e5e0", text: "#57534e", icon: "#a8a29e" }, dark: { bg: "rgba(168,162,158,0.05)", border: "rgba(168,162,158,0.08)", text: "#a8a29e", icon: "#78716c" } } },
];

// ─── Utils ───────────────────────────────────────────────────────────────────

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtShort = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const fmtMonth = (d) => new Date(d).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

const statusMeta = {
  active: { label: "Active", light: { dot: "#f59e0b", text: "#92400e" }, dark: { dot: "#f59e0b", text: "#fbbf24" } },
  managed: { label: "Managed", light: { dot: "#10b981", text: "#065f46" }, dark: { dot: "#10b981", text: "#6ee7b7" } },
  resolved: { label: "Resolved", light: { dot: "#a8a29e", text: "#78716c" }, dark: { dot: "#78716c", text: "#a8a29e" } },
};
const flagMeta = {
  low: { icon: TrendDown, light: { color: "#b45309", bg: "#fef3c7" }, dark: { color: "#fbbf24", bg: "rgba(245,158,11,0.1)" } },
  high: { icon: TrendUp, light: { color: "#b91c1c", bg: "#fee2e2" }, dark: { color: "#fca5a5", bg: "rgba(239,68,68,0.1)" } },
  normal: { icon: CheckCircle, light: { color: "#047857", bg: "#d1fae5" }, dark: { color: "#6ee7b7", bg: "rgba(16,185,129,0.1)" } },
};

// ─── Theme ───────────────────────────────────────────────────────────────────

const TH = {
  light: {
    bg: "#faf8f5", bgCard: "#ffffff", bgElevated: "#ffffff", bgSurface: "#f5f2ee",
    text: "#1c1917", textSec: "#57534e", textTer: "#a8a29e", textMut: "#d6d3d1",
    border: "rgba(0,0,0,0.05)", borderStr: "rgba(0,0,0,0.08)", accent: "#1c1917",
    shadow: "0 1px 3px rgba(0,0,0,0.04)", inputBg: "#ffffff", inputBd: "rgba(0,0,0,0.07)",
    pill: { bg: "#f5f2ee", text: "#78716c" }, emerald: { bg: "#ecfdf5", text: "#059669" },
    brand: "#ea580c", brandSoft: "#fff3ed",
  },
  dark: {
    bg: "#1a1816", bgCard: "#242220", bgElevated: "#282624", bgSurface: "#201e1c",
    text: "#ede9e3", textSec: "#a8a29e", textTer: "#6b6560", textMut: "#3a3836",
    border: "rgba(255,255,255,0.05)", borderStr: "rgba(255,255,255,0.08)", accent: "#ede9e3",
    shadow: "0 1px 3px rgba(0,0,0,0.2)", inputBg: "#201e1c", inputBd: "rgba(255,255,255,0.07)",
    pill: { bg: "#2a2826", text: "#a8a29e" }, emerald: { bg: "rgba(16,185,129,0.08)", text: "#6ee7b7" },
    brand: "#fb923c", brandSoft: "rgba(232,121,83,0.12)",
  },
};

// ─── Hooks & Micro Components ────────────────────────────────────────────────

function hexToRgb(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 0xff, n & 0xff];
}
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");
}
function darker(hex, f = 0.82) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * f, g * f, b * f);
}
function lighter(hex, f = 0.22) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f);
}

function BrandLogo({ size = 24, color = "#ea580c", style }) {
  const id = useId();
  // Tight viewBox crops to text bounds (no empty space): text centered at 60 in original 0..120, ~20–100
  const vbMinX = 18;
  const vbMinY = 10;
  const vbW = 84;
  const vbH = 18;
  const w = Math.round((size * vbW) / vbH);
  const shadow = darker(color);
  const highlight = lighter(color);
  const filterId = `emboss-${id.replace(/:/g, "")}`;
  return (
    <svg width={w} height={size} viewBox={`${vbMinX} ${vbMinY} ${vbW} ${vbH}`} fill="none" style={style} role="img" aria-label="Chronicle">
      <defs>
        <filter id={filterId} x="-15%" y="-15%" width="130%" height="130%">
          <feOffset in="SourceAlpha" dx="0.25" dy="0.25" result="shadow" />
          <feFlood floodColor={shadow} result="shadowColor" />
          <feComposite in="shadowColor" in2="shadow" operator="in" result="shadowFill" />
          <feOffset in="SourceAlpha" dx="-0.25" dy="-0.25" result="highlight" />
          <feFlood floodColor={highlight} result="highlightColor" />
          <feComposite in="highlightColor" in2="highlight" operator="in" result="highlightFill" />
          <feBlend in="shadowFill" in2="SourceGraphic" mode="normal" result="withShadow" />
          <feBlend in="highlightFill" in2="withShadow" mode="normal" />
        </filter>
      </defs>
      <text x="60" y="25" textAnchor="middle" fill={color} fontFamily="var(--serif)" fontSize="18" fontWeight="600" filter={`url(#${filterId})`}>chronicle.</text>
    </svg>
  );
}

function useStagger(n, base = 55) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setV(true), 30);
    return () => clearTimeout(t);
  }, []);
  return (i) => ({
    opacity: v ? 1 : 0,
    transform: v ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
    transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${i * base}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${i * base}ms`,
  });
}

function StatusDot({ status, dark }) {
  const m = statusMeta[status];
  const c = dark ? m.dark : m.light;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: c.text }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot }} />
      {m.label}
    </span>
  );
}

function Pressable({ children, style, onClick }) {
  const [p, setP] = useState(false);
  return (
    <div
      onClick={onClick}
      onPointerDown={() => setP(true)}
      onPointerUp={() => setP(false)}
      onPointerLeave={() => setP(false)}
      style={{
        ...style,
        transform: p ? "scale(0.975)" : "scale(1)",
        transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1)",
        cursor: onClick ? "pointer" : "default",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
      }}
    >
      {children}
    </div>
  );
}

// ─── Login Screen ────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const stagger = useStagger(6, 80);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => onLogin(), 600);
  };

  const inputWrap = {
    position: "relative",
    width: "100%",
  };
  const inputStyle = {
    width: "100%",
    height: 54,
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "#ffffff",
    color: "#1c1917",
    fontSize: 16,
    padding: "0 18px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };
  const labelStyle = {
    fontSize: 13,
    fontWeight: 500,
    color: "#57534e",
    marginBottom: 8,
    display: "block",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#faf8f5",
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 32px",
        }}
      >
        {/* Brand mark */}
        <div style={{ ...stagger(0), marginBottom: 48, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <BrandLogo size={56} color="#ea580c" style={{ marginBottom: 28 }} />
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: 32,
              fontWeight: 700,
              color: "#1c1917",
              letterSpacing: -0.8,
              lineHeight: 1.15,
              marginBottom: 8,
            }}
          >
            Welcome back
          </h1>
          <p style={{ fontSize: 15, color: "#a8a29e", lineHeight: 1.5 }}>
            Sign in to Chronicle
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={stagger(1)}>
            <label style={labelStyle}>Email</label>
            <div style={inputWrap}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(0,0,0,0.2)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.04)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0,0,0,0.08)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          <div style={stagger(2)}>
            <label style={labelStyle}>Password</label>
            <div style={{ ...inputWrap, display: "flex", alignItems: "center" }}>
              <input
                type={showPass ? "text" : "password"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Enter password"
                style={{ ...inputStyle, paddingRight: 50 }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(0,0,0,0.2)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.04)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0,0,0,0.08)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: "#a8a29e",
                  display: "flex",
                }}
              >
                {showPass ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={stagger(3)}>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: 54,
                borderRadius: 16,
                background: loading ? "#44403c" : "#1c1917",
                color: "#ffffff",
                fontSize: 16,
                fontWeight: 600,
                border: "none",
                cursor: loading ? "default" : "pointer",
                transition: "background 0.2s, transform 0.1s",
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading ? (
                <div style={{ display: "flex", gap: 5 }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "#a8a29e",
                        animation: `bounce 0.6s ${i * 0.1}s ease-in-out infinite`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <div style={{ ...stagger(4), textAlign: "center" }}>
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                fontSize: 14,
                color: "#a8a29e",
                cursor: "pointer",
                padding: "8px 0",
              }}
            >
              Forgot password?
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div style={{ ...stagger(5), padding: "0 32px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "#a8a29e" }}>
          Don&apos;t have an account?{" "}
          <button
            style={{
              background: "none",
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              color: "#1c1917",
              cursor: "pointer",
            }}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── Upload Sheet ────────────────────────────────────────────────────────────

function UploadSheet({ open, onClose, t, dark }) {
  const [step, setStep] = useState(0);
  const [more, setMore] = useState(false);
  const handleUpload = () => {
    setStep(1);
    setTimeout(() => setStep(2), 1800);
  };
  const handleSave = () => {
    setStep(0);
    setMore(false);
    onClose();
  };
  const handleClose = () => {
    setStep(0);
    setMore(false);
    onClose();
  };

  const inp = {
    height: 46,
    borderRadius: 14,
    border: `1px solid ${t.inputBd}`,
    background: t.inputBg,
    color: t.text,
    fontSize: 15,
    padding: "0 16px",
    outline: "none",
    width: "100%",
  };
  const lbl = {
    fontSize: 11,
    color: t.textTer,
    marginBottom: 6,
    display: "block",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    fontWeight: 500,
  };

  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <div
        onClick={handleClose}
        style={{
          position: "absolute",
          inset: 0,
          background: dark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.2)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />
      <div
        style={{
          position: "relative",
          background: t.bgElevated,
          borderRadius: "28px 28px 0 0",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "sheetUp 0.35s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 6px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: t.textMut }} />
        </div>
        {step === 0 && (
          <div style={{ padding: "4px 24px 44px" }}>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: 24,
                fontWeight: 600,
                color: t.text,
                marginBottom: 4,
              }}
            >
              Add record
            </h2>
            <p style={{ fontSize: 14, color: t.textTer, marginBottom: 28 }}>
              Upload a prescription or lab report
            </p>
            <div
              onClick={handleUpload}
              style={{
                border: `2px dashed ${t.borderStr}`,
                borderRadius: 22,
                padding: "52px 24px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  background: t.bgSurface,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Upload size={22} style={{ color: t.textSec }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 500, color: t.text, marginBottom: 4 }}>
                Tap to upload
              </p>
              <p style={{ fontSize: 13, color: t.textTer }}>Photo, scan, or PDF</p>
            </div>
          </div>
        )}
        {step === 1 && (
          <div
            style={{
              padding: "24px 24px 60px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 20,
                background: t.bgSurface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Lightning
                size={24}
                style={{ color: t.textSec, animation: "pulse 1s ease-in-out infinite" }}
              />
            </div>
            <h3
              style={{
                fontFamily: "var(--serif)",
                fontSize: 18,
                fontWeight: 600,
                color: t.text,
                marginBottom: 6,
              }}
            >
              Reading prescription
            </h3>
            <p style={{ fontSize: 14, color: t.textTer }}>Extracting details…</p>
          </div>
        )}
        {step === 2 && (
          <div style={{ overflowY: "auto", flex: 1 }}>
            <div style={{ padding: "4px 24px 0" }}>
              <h2
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 24,
                  fontWeight: 600,
                  color: t.text,
                  marginBottom: 16,
                }}
              >
                Review
              </h2>
              <div
                style={{
                  background: t.emerald.bg,
                  borderRadius: 16,
                  padding: "12px 16px",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <CheckCircle size={16} style={{ color: t.emerald.text, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: t.emerald.text }}>
                  Extracted visit details and 1 medication
                </p>
              </div>
            </div>
            <div
              style={{
                padding: "0 24px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={lbl}>Date</label>
                  <input style={inp} defaultValue="2025-01-15" />
                </div>
                <div>
                  <label style={lbl}>Doctor</label>
                  <input style={inp} defaultValue="Dr. Meera Sharma" />
                </div>
              </div>
              <div>
                <label style={lbl}>Diagnosis</label>
                <input style={inp} defaultValue="GAD — stable on current regimen" />
              </div>
              <div style={{ background: t.bgSurface, borderRadius: 18, padding: 18 }}>
                <label style={{ ...lbl, marginBottom: 14 }}>Medication</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <input
                    style={{ ...inp, height: 42, fontSize: 14 }}
                    defaultValue="Escitalopram"
                  />
                  <input
                    style={{ ...inp, height: 42, fontSize: 14 }}
                    defaultValue="15mg · Once daily"
                  />
                </div>
                <button
                  style={{
                    fontSize: 13,
                    color: t.textTer,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    marginTop: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: 0,
                  }}
                >
                  <Plus size={13} /> Add medication
                </button>
              </div>
              <div>
                <label style={lbl}>Condition</label>
                <select style={{ ...inp, appearance: "none", cursor: "pointer" }}>
                  {CONDITIONS.map((c) => (
                    <option key={c.id}>{c.name}</option>
                  ))}
                  <option>+ New condition</option>
                </select>
              </div>
              <button
                onClick={() => setMore(!more)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  fontSize: 13,
                  color: t.textTer,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {more ? "Less" : "More details"}{" "}
                {more ? <CaretUp size={14} /> : <CaretDown size={14} />}
              </button>
              {more && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    animation: "fadeIn 0.25s ease",
                  }}
                >
                  <div>
                    <label style={lbl}>Clinic</label>
                    <input style={inp} defaultValue="Mindwell Clinic, Koramangala" />
                  </div>
                  <div>
                    <label style={lbl}>Notes</label>
                    <textarea
                      defaultValue="Continue medication. Follow-up in 8 weeks."
                      rows={2}
                      style={{ ...inp, height: "auto", padding: "12px 16px", resize: "none" }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div
              style={{
                position: "sticky",
                bottom: 0,
                background: t.bgElevated,
                borderTop: `1px solid ${t.border}`,
                padding: "16px 24px 36px",
                display: "flex",
                gap: 12,
              }}
            >
              <button
                onClick={handleClose}
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 16,
                  border: `1px solid ${t.borderStr}`,
                  background: "transparent",
                  color: t.textSec,
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  flex: 2,
                  height: 50,
                  borderRadius: 16,
                  border: "none",
                  background: t.accent,
                  color: dark ? "#1a1816" : "#fff",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Vita Home ───────────────────────────────────────────────────────────────

function VitaHome({ t, dark, onNav, userName, onLogout }) {
  const stagger = useStagger(14, 60);
  const activeMeds = MEDICATIONS.filter((m) => m.status === "active");
  let idx = 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={{ ...stagger(idx++), paddingTop: 8, paddingBottom: 32 }}>
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: 34,
            fontWeight: 700,
            color: t.text,
            letterSpacing: -1,
            lineHeight: 1.15,
            marginBottom: 10,
          }}
        >
          {getGreeting()},
          <br />
          {userName}
        </h1>
        <p style={{ fontSize: 15, color: t.textSec, lineHeight: 1.55 }}>
          Here&apos;s what I&apos;m keeping an eye on.
        </p>
      </div>

      {/* Today's meds */}
      <div style={{ ...stagger(idx++), marginBottom: 32 }}>
        <div
          style={{
            background: t.bgCard,
            borderRadius: 24,
            border: `1px solid ${t.border}`,
            boxShadow: t.shadow,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 20px 10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: t.textTer,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Today&apos;s medications
            </p>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: t.emerald.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Pill size={15} style={{ color: t.emerald.text }} />
            </div>
          </div>
          {[
            {
              label: "MORNING",
              meds: activeMeds.filter((m) => m.time === "morning"),
              dot: { background: dark ? "#6ee7b7" : "#10b981" },
            },
            {
              label: "AS NEEDED",
              meds: activeMeds.filter((m) => m.time === "as needed"),
              dot: {
                border: `2px solid ${t.textTer}`,
                background: "transparent",
                boxSizing: "border-box",
              },
            },
            {
              label: "WEEKLY · SUNDAY",
              meds: activeMeds.filter((m) => m.time === "sunday"),
              dot: { background: dark ? "#93c5fd" : "#3b82f6" },
            },
          ].map(
            (g) =>
              g.meds.length > 0 && (
                <div key={g.label}>
                  <div style={{ padding: "14px 20px 0" }}>
                    <p
                      style={{
                        fontSize: 10,
                        color: t.textTer,
                        fontWeight: 600,
                        letterSpacing: 0.8,
                      }}
                    >
                      {g.label}
                    </p>
                  </div>
                  {g.meds.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        padding: "11px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          flexShrink: 0,
                          ...g.dot,
                        }}
                      />
                      <span style={{ fontSize: 15, fontWeight: 500, color: t.text }}>
                        {m.generic}
                      </span>
                      <span style={{ fontSize: 13, color: t.textTer }}>{m.dosage}</span>
                    </div>
                  ))}
                </div>
              )
          )}
          <div style={{ height: 10 }} />
        </div>
      </div>

      {/* Insights */}
      <div style={{ ...stagger(idx++), marginBottom: 14 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: t.textTer,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          Insights
        </p>
      </div>
      {INSIGHTS.map((ins) => {
        const c = dark ? ins.color.dark : ins.color.light;
        return (
          <div key={ins.id} style={{ ...stagger(idx++), marginBottom: 12 }}>
            <Pressable
              style={{
                padding: "18px 20px",
                borderRadius: 22,
                background: c.bg,
                border: `1px solid ${c.border}`,
              }}
            >
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 11,
                    flexShrink: 0,
                    background: dark
                      ? "rgba(0,0,0,0.15)"
                      : "rgba(255,255,255,0.75)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ins.icon size={16} style={{ color: c.icon }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: c.text,
                      marginBottom: 5,
                      lineHeight: 1.3,
                    }}
                  >
                    {ins.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: c.text,
                      opacity: 0.75,
                      lineHeight: 1.5,
                    }}
                  >
                    {ins.body}
                  </p>
                  {ins.action && (
                    <button
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 13,
                        fontWeight: 600,
                        color: c.icon,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        marginTop: 10,
                      }}
                    >
                      {ins.action} <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            </Pressable>
          </div>
        );
      })}

      {/* Glance */}
      <div style={{ ...stagger(idx++), marginTop: 20, marginBottom: 8 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: t.textTer,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: 14,
          }}
        >
          At a glance
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            {
              val: CONDITIONS.filter((c) => c.status !== "resolved").length,
              label: "Conditions",
              nav: "health",
            },
            { val: VISITS.filter((v) => v.date >= "2024-01-01").length, label: "Visits '24" },
            { val: LAB_RESULTS.length, label: "Lab results", nav: "records" },
          ].map((s, i) => (
            <Pressable
              key={i}
              onClick={s.nav ? () => onNav(s.nav) : undefined}
              style={{
                padding: "18px 14px",
                borderRadius: 20,
                background: t.bgCard,
                border: `1px solid ${t.border}`,
                boxShadow: t.shadow,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 30,
                  fontWeight: 700,
                  color: t.text,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {s.val}
              </div>
              <div style={{ fontSize: 11, color: t.textTer, marginTop: 6 }}>{s.label}</div>
            </Pressable>
          ))}
        </div>
      </div>

      {/* Recent */}
      <div style={{ ...stagger(idx++), marginTop: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 14,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: t.textTer,
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Recent visits
          </p>
          <button
            onClick={() => onNav("records")}
            style={{
              fontSize: 12,
              color: t.textTer,
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            All <CaretRight size={12} />
          </button>
        </div>
        <div
          style={{
            background: t.bgCard,
            borderRadius: 22,
            border: `1px solid ${t.border}`,
            boxShadow: t.shadow,
            overflow: "hidden",
          }}
        >
          {[...VISITS]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3)
            .map((v, i, a) => (
              <div
                key={v.id}
                style={{
                  padding: "15px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  borderBottom:
                    i < a.length - 1 ? `1px solid ${t.border}` : "none",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 11,
                    flexShrink: 0,
                    background: t.bgSurface,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Stethoscope size={14} style={{ color: t.textTer }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>
                    {v.diagnosis}
                  </div>
                  <div style={{ fontSize: 12, color: t.textTer, marginTop: 1 }}>
                    {v.doctor} · {fmtShort(v.date)}
                  </div>
                </div>
                {v.hasDoc && (
                  <FileText size={13} style={{ color: t.textMut, flexShrink: 0 }} />
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── Health Page ─────────────────────────────────────────────────────────────

function HealthPage({ t, dark, onSelect }) {
  const stagger = useStagger(8);
  const grouped = { active: [], managed: [], resolved: [] };
  CONDITIONS.forEach((c) => grouped[c.status]?.push(c));
  const sections = [
    { key: "active", label: "Needs attention" },
    { key: "managed", label: "Managed" },
    { key: "resolved", label: "Resolved" },
  ].filter((s) => grouped[s.key].length > 0);
  let idx = 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={stagger(idx++)}>
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: 34,
            fontWeight: 700,
            color: t.text,
            letterSpacing: -1,
          }}
        >
          Health
        </h1>
        <p style={{ fontSize: 14, color: t.textTer, marginTop: 4 }}>
          {CONDITIONS.length} conditions
        </p>
      </div>
      {sections.map((sec) => (
        <div key={sec.key} style={stagger(idx++)}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: t.textTer,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 12,
            }}
          >
            {sec.label}
          </p>
          <div
            style={{
              background: t.bgCard,
              borderRadius: 22,
              border: `1px solid ${t.border}`,
              boxShadow: t.shadow,
              overflow: "hidden",
            }}
          >
            {grouped[sec.key].map((c, i, a) => {
              const vc = VISITS.filter((v) => v.conditionId === c.id).length;
              return (
                <Pressable
                  key={c.id}
                  onClick={() => onSelect(c)}
                  style={{
                    padding: "18px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    borderBottom:
                      i < a.length - 1 ? `1px solid ${t.border}` : "none",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: t.text,
                        marginBottom: 3,
                      }}
                    >
                      {c.name}
                    </div>
                    <div style={{ fontSize: 12, color: t.textTer }}>
                      {vc} visits · Since {fmtShort(c.diagnosed)}
                    </div>
                  </div>
                  <CaretRight size={16} style={{ color: t.textMut }} />
                </Pressable>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Condition Detail ────────────────────────────────────────────────────────

function ConditionDetail({ condition: cn, t, dark, onBack }) {
  const stagger = useStagger(10, 40);
  const visits = VISITS.filter((v) => v.conditionId === cn.id).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const labs = LAB_RESULTS.filter((l) => l.conditionId === cn.id).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const am = MEDICATIONS.filter(
    (m) => m.conditionId === cn.id && m.status === "active"
  );
  let idx = 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={stagger(idx++)}>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            color: t.textTer,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            marginBottom: 16,
          }}
        >
          <ArrowLeft size={16} /> Health
        </button>
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: 28,
            fontWeight: 700,
            color: t.text,
            letterSpacing: -0.5,
            lineHeight: 1.15,
          }}
        >
          {cn.name}
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 10,
          }}
        >
          <StatusDot status={cn.status} dark={dark} />
          <span style={{ fontSize: 12, color: t.textTer }}>
            Since {fmt(cn.diagnosed)}
          </span>
        </div>
        {cn.notes && (
          <p
            style={{
              fontSize: 14,
              color: t.textSec,
              marginTop: 14,
              lineHeight: 1.5,
            }}
          >
            {cn.notes}
          </p>
        )}
      </div>
      {am.length > 0 && (
        <div style={stagger(idx++)}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: t.textTer,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 12,
            }}
          >
            Current medication
          </p>
          {am.map((m) => (
            <div
              key={m.id}
              style={{
                padding: "16px 20px",
                borderRadius: 18,
                background: t.bgCard,
                border: `1px solid ${t.border}`,
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: t.emerald.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pill size={15} style={{ color: t.emerald.text }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: t.text }}>
                  {m.generic}
                </div>
                <div style={{ fontSize: 12, color: t.textTer, marginTop: 1 }}>
                  {m.brand} · {m.dosage} · {m.frequency}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {labs.length > 0 && (
        <div style={stagger(idx++)}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: t.textTer,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 12,
            }}
          >
            Lab trend
          </p>
          <div
            style={{
              background: t.bgCard,
              borderRadius: 22,
              border: `1px solid ${t.border}`,
              overflow: "hidden",
            }}
          >
            {labs.map((l, i) => {
              const fm = dark
                ? flagMeta[l.flag]?.dark
                : flagMeta[l.flag]?.light;
              return (
                <div
                  key={l.id}
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    borderBottom:
                      i < labs.length - 1
                        ? `1px solid ${t.border}`
                        : "none",
                  }}
                >
                  <span style={{ fontSize: 12, color: t.textTer, flex: 1 }}>
                    {fmtShort(l.date)}
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: fm?.color,
                      fontFamily: "var(--serif)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {l.value}
                  </span>
                  <span
                    style={{ fontSize: 12, color: t.textTer, marginLeft: 4 }}
                  >
                    {l.unit}
                  </span>
                </div>
              );
            })}
          </div>
          <p
            style={{
              fontSize: 11,
              color: t.textTer,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            ref: {labs[0].refRange}
          </p>
        </div>
      )}
      <div style={stagger(idx++)}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: t.textTer,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: 12,
          }}
        >
          Visits · {visits.length}
        </p>
        <div
          style={{
            background: t.bgCard,
            borderRadius: 22,
            border: `1px solid ${t.border}`,
            overflow: "hidden",
          }}
        >
          {visits.map((v, i) => (
            <div
              key={v.id}
              style={{
                padding: "16px 20px",
                borderBottom:
                  i < visits.length - 1
                    ? `1px solid ${t.border}`
                    : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 500, color: t.text }}>
                  {v.diagnosis}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: t.textTer,
                    marginLeft: 12,
                    flexShrink: 0,
                  }}
                >
                  {fmtShort(v.date)}
                </span>
              </div>
              <div style={{ fontSize: 13, color: t.textTer }}>{v.doctor}</div>
              <div
                style={{
                  fontSize: 12,
                  color: t.textTer,
                  marginTop: 4,
                  lineHeight: 1.4,
                }}
              >
                {v.notes}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Records Page ────────────────────────────────────────────────────────────

function RecordsPage({ t, dark }) {
  const stagger = useStagger(12, 35);
  const [filter, setFilter] = useState("all");
  const chip = (on) => ({
    padding: "7px 16px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s",
    background: on ? t.accent : t.bgSurface,
    color: on ? (dark ? "#1a1816" : "#fff") : t.textSec,
  });
  const items = [];
  if (filter !== "labs")
    VISITS.forEach((v) => items.push({ type: "v", date: v.date, d: v }));
  if (filter !== "visits")
    LAB_RESULTS.forEach((l) => items.push({ type: "l", date: l.date, d: l }));
  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  const grouped = {};
  items.forEach((it) => {
    const k = fmtMonth(it.date);
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(it);
  });
  let idx = 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={stagger(idx++)}>
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: 34,
            fontWeight: 700,
            color: t.text,
            letterSpacing: -1,
          }}
        >
          Records
        </h1>
        <p style={{ fontSize: 14, color: t.textTer, marginTop: 4 }}>
          {VISITS.length} visits · {LAB_RESULTS.length} labs
        </p>
      </div>
      <div style={{ ...stagger(idx++), display: "flex", gap: 8 }}>
        {["all", "visits", "labs"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={chip(filter === f)}>
            {f === "all" ? "All" : f === "visits" ? "Visits" : "Labs"}
          </button>
        ))}
      </div>
      {Object.entries(grouped).map(([month, mi]) => (
        <div key={month} style={stagger(idx++)}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: t.textTer,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 12,
            }}
          >
            {month}
          </p>
          <div
            style={{
              background: t.bgCard,
              borderRadius: 22,
              border: `1px solid ${t.border}`,
              boxShadow: t.shadow,
              overflow: "hidden",
            }}
          >
            {mi.map((it, i) => {
              if (it.type === "v") {
                const v = it.d;
                const co = CONDITIONS.find((c) => c.id === v.conditionId);
                return (
                  <div
                    key={v.id}
                    style={{
                      padding: "16px 20px",
                      display: "flex",
                      gap: 14,
                      borderBottom:
                        i < mi.length - 1
                          ? `1px solid ${t.border}`
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        flexShrink: 0,
                        background: t.bgSurface,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Stethoscope size={15} style={{ color: t.textTer }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: t.text,
                          }}
                        >
                          {v.diagnosis}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: t.textTer,
                            flexShrink: 0,
                            marginLeft: 8,
                          }}
                        >
                          {fmtShort(v.date)}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: t.textTer,
                          marginTop: 2,
                        }}
                      >
                        {v.doctor} · {v.specialty}
                      </div>
                      {co && (
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: 11,
                            marginTop: 6,
                            padding: "2px 8px",
                            borderRadius: 8,
                            background: t.pill.bg,
                            color: t.pill.text,
                          }}
                        >
                          {co.name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              } else {
                const l = it.d;
                const fm = dark
                  ? flagMeta[l.flag]?.dark
                  : flagMeta[l.flag]?.light;
                const Ic = flagMeta[l.flag]?.icon || Minus;
                return (
                  <div
                    key={l.id}
                    style={{
                      padding: "16px 20px",
                      display: "flex",
                      gap: 14,
                      alignItems: "center",
                      borderBottom:
                        i < mi.length - 1
                          ? `1px solid ${t.border}`
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        flexShrink: 0,
                        background: fm?.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ic size={15} style={{ color: fm?.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: t.text,
                        }}
                      >
                        {l.test}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: t.textTer,
                          marginTop: 2,
                        }}
                      >
                        {l.lab} · {fmtShort(l.date)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: fm?.color,
                          fontFamily: "var(--serif)",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {l.value}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: t.textTer,
                          marginLeft: 3,
                        }}
                      >
                        {l.unit}
                      </span>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "home", label: "Home", icon: Sparkle },
  { id: "health", label: "Health", icon: Heart },
  { id: "records", label: "Records", icon: Clock },
];

export default function Chronicle() {
  const [appState, setAppState] = useState("login");
  const [page, setPage] = useState("home");
  const [dark, setDark] = useState(false);
  const [cond, setCond] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [userName] = useState("Shantanu");
  const scrollRef = useRef(null);
  const t = dark ? TH.dark : TH.light;

  const onLogin = useCallback(() => setAppState("app"), []);
  const onLogout = useCallback(() => {
    setAppState("login");
    setPage("home");
    setCond(null);
  }, []);
  const nav = useCallback((p) => {
    setPage(p);
    setCond(null);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const showHeader = page !== "home" || cond;

  const renderContent = () => {
    if (page === "health" && cond)
      return (
        <ConditionDetail
          condition={cond}
          t={t}
          dark={dark}
          onBack={() => setCond(null)}
        />
      );
    switch (page) {
      case "home":
        return (
          <VitaHome
            t={t}
            dark={dark}
            onNav={nav}
            userName={userName}
            onLogout={onLogout}
          />
        );
      case "health":
        return <HealthPage t={t} dark={dark} onSelect={setCond} />;
      case "records":
        return <RecordsPage t={t} dark={dark} />;
      default:
        return (
          <VitaHome
            t={t}
            dark={dark}
            onNav={nav}
            userName={userName}
            onLogout={onLogout}
          />
        );
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&family=DM+Sans:wght@400;500;600&display=swap');
        :root { --serif: 'Source Serif 4', Georgia, serif; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body, html { font-family: 'DM Sans', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; overscroll-behavior: none; }
        button, input, select, textarea { font-family: inherit; }
        ::-webkit-scrollbar { width: 0; height: 0; }
        ::placeholder { color: #c4c0b8; }
        @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>

      {/* Login */}
      {appState === "login" && <LoginScreen onLogin={onLogin} />}

      {/* App */}
      {appState === "app" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: t.bg,
            display: "flex",
            flexDirection: "column",
            maxWidth: 480,
            margin: "0 auto",
            transition: "background 0.35s ease",
            animation: "fadeIn 0.4s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: showHeader ? "16px 22px 8px" : "12px 22px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative",
              zIndex: 10,
              minHeight: showHeader ? 56 : 44,
            }}
          >
            {showHeader ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <BrandLogo size={24} color={t.brand} />
              </div>
            ) : (
              <div />
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setDark(!dark)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  border: `1px solid ${t.border}`,
                  background: t.bgCard,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {dark ? (
                  <Sun size={17} style={{ color: t.textSec }} />
                ) : (
                  <Moon size={17} style={{ color: t.textSec }} />
                )}
              </button>
              <button
                onClick={onLogout}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  border: `1px solid ${t.border}`,
                  background: t.bgCard,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <SignOut size={16} style={{ color: t.textTer }} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div
            ref={scrollRef}
            key={page + (cond?.id || "")}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "4px 22px 32px",
            }}
          >
            {renderContent()}
          </div>

          {/* Bottom bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 16px 22px",
              background: dark
                ? "rgba(26,24,22,0.95)"
                : "rgba(250,248,245,0.95)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderTop: `1px solid ${t.border}`,
              position: "relative",
            }}
          >
            {TABS.map((tab) => {
              const active = page === tab.id && !cond;
              return (
                <button
                  key={tab.id}
                  onClick={() => nav(tab.id)}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px 0",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <div
                    style={{
                      transition:
                        "transform 0.25s cubic-bezier(0.22,1,0.36,1)",
                      transform: active ? "scale(1.15)" : "scale(1)",
                    }}
                  >
                    <tab.icon
                      size={22}
                      strokeWidth={active ? 2.2 : 1.5}
                      style={{
                        color: active ? t.brand : t.textTer,
                        transition: "color 0.2s",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: active ? 600 : 400,
                      color: active ? t.brand : t.textTer,
                      transition: "color 0.2s",
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
            <button
              onClick={() => setUploadOpen(true)}
              style={{
                position: "absolute",
                top: -22,
                right: 22,
                width: 52,
                height: 52,
                borderRadius: 18,
                background: t.accent,
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: dark
                  ? "0 4px 20px rgba(0,0,0,0.4)"
                  : "0 4px 20px rgba(0,0,0,0.12)",
                transition:
                  "transform 0.15s cubic-bezier(0.22,1,0.36,1)",
              }}
              onPointerDown={(e) =>
                (e.currentTarget.style.transform = "scale(0.92)")
              }
              onPointerUp={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
              onPointerLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <Plus size={22} style={{ color: dark ? "#1a1816" : "#fff" }} />
            </button>
          </div>

          <UploadSheet
            open={uploadOpen}
            onClose={() => setUploadOpen(false)}
            t={t}
            dark={dark}
          />
        </div>
      )}
    </>
  );
}
