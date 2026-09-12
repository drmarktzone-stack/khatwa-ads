import { Suspense } from "react";
import { ToolsHub } from "@/components/ToolsHub";

export default function ToolsPage() {
  return (
    <Suspense>
      <ToolsHub />
    </Suspense>
  );
}
