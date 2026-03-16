import { WorkerAppCanvas } from "./worker-app-canvas";

type WorkerAppGetStartedPageProps = {
  showDeviceFrame: boolean;
  theme: "dark" | "light";
  frameTheme?: "dark" | "light";
};

export function WorkerAppGetStartedPage({
  showDeviceFrame,
  theme,
  frameTheme,
}: WorkerAppGetStartedPageProps) {
  return <WorkerAppCanvas showDeviceFrame={showDeviceFrame} theme={theme} frameTheme={frameTheme} />;
}
