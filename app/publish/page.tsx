import { Suspense } from "react";
import { PublishClient } from "@/components/PublishClient";

export default function PublishPage() {
  return (
    <Suspense>
      <PublishClient />
    </Suspense>
  );
}
