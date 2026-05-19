"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { TravailFrameView, TravailPreviewState, WorkerAppTravailPage } from "@/worker-app/travail";

const frameMap: Record<
  string,
  {
    frameView: TravailFrameView;
    previewState: TravailPreviewState;
    previewJobId?: string;
  }
> = {
  "01": { frameView: "data", previewState: "list-data" },
  T01: { frameView: "data", previewState: "list-data" },
  "02": { frameView: "data", previewState: "list-search-results" },
  T02: { frameView: "data", previewState: "list-search-results" },
  "03": { frameView: "data", previewState: "list-search-empty" },
  T03: { frameView: "data", previewState: "list-search-empty" },
  "04": { frameView: "data", previewState: "detail-overview" },
  T04: { frameView: "data", previewState: "detail-overview" },
  "05": { frameView: "data", previewState: "detail-map" },
  T05: { frameView: "data", previewState: "detail-map" },
  "06": { frameView: "data", previewState: "detail-gallery" },
  T06: { frameView: "data", previewState: "detail-gallery" },
  "07": { frameView: "data", previewState: "list-filters-active" },
  T07: { frameView: "data", previewState: "list-filters-active" },
  "08": { frameView: "data", previewState: "list-filters-sheet" },
  T08: { frameView: "data", previewState: "list-filters-sheet" },
  "09": { frameView: "data", previewState: "detail-sheet-parcel" },
  T09: { frameView: "data", previewState: "detail-sheet-parcel" },
  "10": { frameView: "data", previewState: "detail-sheet-config" },
  T10: { frameView: "data", previewState: "detail-sheet-config" },
  TC1: {
    frameView: "data",
    previewState: "list-data",
    previewJobId: "est-10112-2",
  },
  TC2: {
    frameView: "data",
    previewState: "list-data",
    previewJobId: "est-10118-1",
  },
  TC3: {
    frameView: "data",
    previewState: "list-data",
    previewJobId: "est-10612-1",
  },
  TC4: {
    frameView: "data",
    previewState: "list-data",
    previewJobId: "cal-20502-1",
  },
  TC5: {
    frameView: "data",
    previewState: "list-data",
    previewJobId: "est-10116-1",
  },
  loading: { frameView: "loading", previewState: "list-loading" },
  empty: { frameView: "empty", previewState: "list-empty" },
};

function TravailPreviewContent() {
  const searchParams = useSearchParams();
  const frameId = searchParams.get("frame") ?? "01";
  const themeParam = searchParams.get("theme");
  const frameThemeParam = searchParams.get("frameTheme");
  const deviceParam = searchParams.get("device");

  const config = useMemo(() => frameMap[frameId] ?? frameMap["01"], [frameId]);
  const theme = themeParam === "dark" ? "dark" : "light";
  const frameTheme =
    frameThemeParam === "light" ? "light" : frameThemeParam === "dark" ? "dark" : theme;
  const showDeviceFrame = deviceParam !== "0";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        boxSizing: "border-box",
        background: "transparent",
      }}
    >
      <WorkerAppTravailPage
        showDeviceFrame={showDeviceFrame}
        theme={theme}
        frameTheme={frameTheme}
        frameView={config.frameView}
        previewState={config.previewState}
        previewJobId={config.previewJobId}
        isInteractive={false}
      />
    </main>
  );
}

export default function TravailPreviewPage() {
  return (
    <Suspense fallback={null}>
      <TravailPreviewContent />
    </Suspense>
  );
}
