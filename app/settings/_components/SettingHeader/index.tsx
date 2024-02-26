import { Card } from "@/_shared/ui/Card";

export function SettingHeader({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <h1 className="text-lg font-bold before:mr-1 before:content-['#']">
        {children}
      </h1>
    </Card>
  );
}
