"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function ThemeToggle() {
 const [theme, setTheme] = useState<Theme>("dark");
 useEffect(() => {
  const stored = window.localStorage.getItem("cevanta-theme");
  const next: Theme = stored === "light" || stored === "dark" ? stored : "dark";
  document.documentElement.dataset.theme = next;
  const frame = window.requestAnimationFrame(() => setTheme(next));
  return () => window.cancelAnimationFrame(frame);
 }, []);
 const toggle = () => {
  const next: Theme = theme === "dark" ? "light" : "dark";
  setTheme(next);
  document.documentElement.dataset.theme = next;
  window.localStorage.setItem("cevanta-theme", next);
 };
 return <button className="theme-toggle" type="button" onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} aria-pressed={theme === "light"}>{theme === "dark" ? "☼ Light" : "☾ Dark"}</button>;
}
