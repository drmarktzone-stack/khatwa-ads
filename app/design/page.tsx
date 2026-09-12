import { Suspense } from "react";
import { DesignClient } from "@/components/DesignClient";

export default function DesignPage() {
  return (
    <Suspense>
      <DesignClient />
    </Suspense>
  );
}
