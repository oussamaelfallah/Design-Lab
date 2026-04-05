import { WorkerAppCanvas } from "./worker-app-canvas";

type WorkerAppGetStartedV2PageProps = {
  showDeviceFrame: boolean;
  theme: "dark" | "light";
  frameTheme?: "dark" | "light";
};

export function WorkerAppGetStartedV2Page({
  showDeviceFrame,
  theme,
  frameTheme,
}: WorkerAppGetStartedV2PageProps) {
  return (
    <WorkerAppCanvas
      showDeviceFrame={showDeviceFrame}
      theme={theme}
      frameTheme={frameTheme}
      variant="v2"
    />
  );
}
