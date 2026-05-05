export type Theme = "original" | "light" | "dark";

export const themes: { value: Theme; label: string; sidebar: string; sidebarText: string; hover: string; border: string }[] = [
  {
    value: "original",
    label: "Original",
    sidebar: "#cbc1b0",
    sidebarText: "#1a1a1a",
    hover: "rgba(0,0,0,0.1)",
    border: "rgba(0,0,0,0.15)",
  },
  {
    value: "light",
    label: "Light",
    sidebar: "#ffffff",
    sidebarText: "#1a1a1a",
    hover: "rgba(0,0,0,0.06)",
    border: "rgba(0,0,0,0.1)",
  },
  {
    value: "dark",
    label: "Dark",
    sidebar: "#18181b",
    sidebarText: "#ffffff",
    hover: "rgba(255,255,255,0.1)",
    border: "rgba(255,255,255,0.1)",
  },
];

export function getTheme(value: Theme) {
  return themes.find((t) => t.value === value) ?? themes[0];
}
