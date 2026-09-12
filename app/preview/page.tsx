import { Suspense } from "react";
import { PreviewClient } from "@/components/PreviewClient";

export default function PreviewPage() {
  return (
    <Suspense>
      <PreviewClient />
    </Suspense>
  );
}
