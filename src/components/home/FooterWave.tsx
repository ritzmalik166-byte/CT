"use client";

import Threads from "@/components/ui/Threads";

interface FooterWaveProps {
  className?: string;
}

const FooterWave: React.FC<FooterWaveProps> = ({ className = "" }) => {
  return (
    <div
      className={`pointer-events-none ${className}`}
      style={{ width: "100%", height: "100%" }}
    >
      <Threads
        color={[0.9294117647058824, 0.9294117647058824, 0.9294117647058824]}
        amplitude={1}
        distance={0}
        enableMouseInteraction
      />
    </div>
  );
};

export default FooterWave;
