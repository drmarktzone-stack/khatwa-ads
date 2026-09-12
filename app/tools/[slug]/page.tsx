import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ToolClient } from "@/components/ToolClient";
import { isToolSlug } from "@/lib/tools-engine";

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isToolSlug(slug)) notFound();
  return (
    <Suspense>
      <ToolClient slug={slug} />
    </Suspense>
  );
}
