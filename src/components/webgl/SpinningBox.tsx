"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import type { Mesh } from "three";

gsap.registerPlugin(useGSAP);

export function SpinningBox() {
  const meshRef = useRef<Mesh>(null);

  useGSAP(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    gsap.to(mesh.rotation, {
      y: Math.PI * 2,
      duration: 10,
      repeat: -1,
      ease: "none",
    });

    gsap.fromTo(
      mesh.position,
      { y: -0.25 },
      {
        y: 0.25,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      },
    );
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow position={[0, 0, 0]}>
      <boxGeometry args={[1.15, 1.15, 1.15]} />
      <meshStandardMaterial
        color="#818cf8"
        metalness={0.35}
        roughness={0.28}
        envMapIntensity={1}
      />
    </mesh>
  );
}
