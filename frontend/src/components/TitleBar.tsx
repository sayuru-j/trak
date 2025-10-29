import { Minus, Maximize2, X } from "lucide-react";
import { useState } from "react";

declare global {
  interface Window {
    api: {
      windowMinimize: () => void;
      windowMaximize: () => void;
      windowClose: () => void;
      apiUrl: string;
    };
  }
}

const TitleBar = () => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      className="h-8 bg-background/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-3 select-none"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      <div className="flex items-center gap-2">
        {/* macOS/iOS Style Traffic Light Buttons */}
        <div
          className="flex items-center gap-2"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* Close Button - Red */}
          <button
            className="group relative w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/90 flex items-center justify-center transition-all"
            onClick={() => window.api?.windowClose()}
            onMouseEnter={() => setHovered("close")}
            onMouseLeave={() => setHovered(null)}
            title="Close"
          >
            {hovered === "close" && (
              <X className="w-2 h-2 text-[#4d0000] stroke-[2.5]" />
            )}
          </button>

          {/* Minimize Button - Yellow */}
          <button
            className="group relative w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/90 flex items-center justify-center transition-all"
            onClick={() => window.api?.windowMinimize()}
            onMouseEnter={() => setHovered("minimize")}
            onMouseLeave={() => setHovered(null)}
            title="Minimize"
          >
            {hovered === "minimize" && (
              <Minus className="w-2 h-2 text-[#995700] stroke-[2.5]" />
            )}
          </button>

          {/* Maximize Button - Green */}
          <button
            className="group relative w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#28c840]/90 flex items-center justify-center transition-all"
            onClick={() => window.api?.windowMaximize()}
            onMouseEnter={() => setHovered("maximize")}
            onMouseLeave={() => setHovered(null)}
            title="Maximize"
          >
            {hovered === "maximize" && (
              <Maximize2 className="w-2 h-2 text-[#003d0d] stroke-[2.5]" />
            )}
          </button>
        </div>

        {/* App Title */}
        <div className="flex items-center gap-2 text-sm font-semibold ml-2">
          <span>TRAK</span>
        </div>
      </div>

      <div className="w-20"></div> {/* Spacer for centering */}
    </div>
  );
};

export default TitleBar;

