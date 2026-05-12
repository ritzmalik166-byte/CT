"use client";

import { ContactShadows, Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { SpinningBox } from "./SpinningBox";

export default function WebGLBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Canvas
        shadows
        camera={{ position: [3.2, 1.8, 4.2], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#020617"]} />
        <ambientLight intensity={0.35} />
        <directionalLight castShadow intensity={1.15} position={[4, 6, 3]} />
        <SpinningBox />
        <ContactShadows
          position={[0, -1.05, 0]}
          opacity={0.4}
          scale={14}
          blur={2.2}
          far={6}
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
