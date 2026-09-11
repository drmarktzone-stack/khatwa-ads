import { Suspense } from "react";
import { ScanClient } from "@/components/ScanClient";

export default function ScanPage() {
  return (
    <Suspense>
      <ScanClient />
    </Suspense>
  );
}
