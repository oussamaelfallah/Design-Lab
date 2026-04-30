"use client";

import { Suspense, useMemo } from "react";
import {
  PostFixePreviewState,
  SecteursFrameView,
  WorkerAppPostFixePage,
} from "@/worker-app/post-fixe";
import { useSearchParams } from "next/navigation";

const frameMap: Record<
  string,
  {
    frameView: SecteursFrameView;
    previewState: PostFixePreviewState;
    previewObservationPhase?: "Fleuraison" | "Nouaison" | "Chute physiologique";
  }
> = {
  "01": { frameView: "data", previewState: "list-data" },
  "02": { frameView: "data", previewState: "detail-overview" },
  "03": {
    frameView: "data",
    previewState: "observation-edit-fleuraison",
    previewObservationPhase: "Fleuraison",
  },
  "04": {
    frameView: "data",
    previewState: "observation-edit-nouaison",
    previewObservationPhase: "Nouaison",
  },
  "05": {
    frameView: "data",
    previewState: "observation-edit-chute",
    previewObservationPhase: "Chute physiologique",
  },
  "06": { frameView: "data", previewState: "conduite-fertilisation-soil-tab" },
  "07": { frameView: "data", previewState: "conduite-fertilisation-apport-tab" },
  "08": { frameView: "data", previewState: "observation-status-not-started" },
  "09": { frameView: "data", previewState: "observation-status-in-progress" },
  "10": { frameView: "data", previewState: "observation-status-done" },
  "11": { frameView: "data", previewState: "observation-readonly" },
  "12": { frameView: "data", previewState: "conduite-fertilisation-soil-create" },
  "13": { frameView: "data", previewState: "conduite-fertilisation-soil-view" },
  "14": { frameView: "data", previewState: "conduite-fertilisation-apport-create" },
  "15": { frameView: "data", previewState: "conduite-fertilisation-apport-view" },
  "16": { frameView: "data", previewState: "conduite-fertilisation-soil-unsaved" },
  "17": { frameView: "data", previewState: "conduite-irrigation-program-tab" },
  "18": { frameView: "data", previewState: "conduite-irrigation-stress-tab" },
  "19": { frameView: "data", previewState: "conduite-irrigation-program-create" },
  "20": { frameView: "data", previewState: "conduite-irrigation-program-view" },
  "21": { frameView: "data", previewState: "conduite-irrigation-program-unsaved" },
  "22": { frameView: "data", previewState: "conduite-irrigation-stress-create" },
  "23": { frameView: "data", previewState: "conduite-irrigation-stress-view" },
  "24": { frameView: "data", previewState: "conduite-irrigation-stress-unsaved" },
  "25": { frameView: "data", previewState: "observation-unsaved-modal" },
  loading: { frameView: "loading", previewState: "list-loading" },
  empty: { frameView: "empty", previewState: "list-empty" },
  detailLoading: { frameView: "loading", previewState: "detail-loading" },
};

function PostFixePreviewContent() {
  const searchParams = useSearchParams();
  const frameId = searchParams.get("frame") ?? "01";
  const themeParam = searchParams.get("theme");
  const frameThemeParam = searchParams.get("frameTheme");
  const deviceParam = searchParams.get("device");

  const config = useMemo(() => frameMap[frameId] ?? frameMap["01"], [frameId]);
  const theme = themeParam === "dark" ? "dark" : "light";
  const frameTheme = frameThemeParam === "light" ? "light" : frameThemeParam === "dark" ? "dark" : theme;
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
      <WorkerAppPostFixePage
        showDeviceFrame={showDeviceFrame}
        theme={theme}
        frameTheme={frameTheme}
        frameView={config.frameView}
        previewState={config.previewState}
        previewObservationPhase={config.previewObservationPhase}
        isInteractive={false}
      />
    </main>
  );
}

export default function PostFixePreviewPage() {
  return (
    <Suspense fallback={null}>
      <PostFixePreviewContent />
    </Suspense>
  );
}
