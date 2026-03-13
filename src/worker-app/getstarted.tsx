import { WorkerAppCanvas } from "./worker-app-canvas";

type WorkerAppGetStartedPageProps = {
  showDeviceFrame: boolean;
  theme: "dark" | "light";
};

export function WorkerAppGetStartedPage({ showDeviceFrame, theme }: WorkerAppGetStartedPageProps) {
  return <WorkerAppCanvas showDeviceFrame={showDeviceFrame} theme={theme} />;
}
