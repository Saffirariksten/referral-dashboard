import { ThemeSelector } from "@/components/theme-selector";

export default function SettingsPage() {
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <div>
          <h2 className="font-semibold mb-1">Sidebar theme</h2>
          <p className="text-sm text-gray-500 mb-4">Choose the look of the sidebar navigation.</p>
          <ThemeSelector />
        </div>
      </div>
    </div>
  );
}
