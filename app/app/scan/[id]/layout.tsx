import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { SITE } from "@/lib/constants";

interface LayoutProps {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const { data } = await createServerClient()
    .from("scans")
    .select("url, score")
    .eq("id", id)
    .single();

  if (!data) {
    return {
      title: `Scan Results — ${SITE.name}`,
      description: "Accessibility scan results from NeuroEdge.",
    };
  }

  const title = `${data.url} scored ${data.score}/100 — ${SITE.name}`;
  const description = `Accessibility scan: ${data.url} scored ${data.score}/100. See the full breakdown of issues and estimated revenue impact.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: SITE.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function ScanResultLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
