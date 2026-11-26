import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, RoundedBox } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface SoftwareTool {
  id: string;
  name: string;
  image: string;
  desktopPos: [number, number, number];
  mobilePos: [number, number, number];
  floatSpeed: number;
  floatPhase: number;
}

const softwareTools: SoftwareTool[] = [
  {
    id: "premiere",
    name: "Adobe Premiere Pro",
    image: "/assets/premiere-pro.png",
    desktopPos: [-4.05, 0.55, 0.4],
    mobilePos: [-1.45, 1.35, 0.3],
    floatSpeed: 1.35,
    floatPhase: 0,
  },
  {
    id: "after-effects",
    name: "Adobe After Effects",
    image: "/assets/after-effects.png",
    desktopPos: [-1.35, -0.65, 0.9],
    mobilePos: [1.45, 1.15, 0.7],
    floatSpeed: 1.55,
    floatPhase: 1.6,
  },
  {
    id: "photoshop",
    name: "Adobe Photoshop",
    image: "/assets/photoshop.png",
    desktopPos: [1.35, 0.6, 0.7],
    mobilePos: [-1.45, -1.25, 0.6],
    floatSpeed: 1.4,
    floatPhase: 3.1,
  },
  {
    id: "illustrator",
    name: "Adobe Illustrator",
    image: "/assets/illustrator.png",
    desktopPos: [4.05, -0.55, 0.3],
    mobilePos: [1.45, -1.4, 0.25],
    floatSpeed: 1.5,
    floatPhase: 4.7,
  },
];

function createRedGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 128);
    grad.addColorStop(0, "rgba(255, 23, 68, 0.92)");
    grad.addColorStop(0.35, "rgba(229, 9, 53, 0.55)");
    grad.addColorStop(0.7, "rgba(139, 0, 31, 0.18)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

interface FloatingIconProps {
  tool: SoftwareTool;
  texture: THREE.Texture;
  glowTexture: THREE.Texture;
  isHovered: boolean;
  onHoverChange: (id: string | null) => void;
}

function FloatingIcon({
  tool,
  texture,
  glowTexture,
  isHovered,
  onHoverChange,
}: FloatingIconProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const frameMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const { viewport } = useThree();

  const isCompact = viewport.width < 6.5;
  const targetBasePos: [number, number, number] = isCompact
    ? [
        (tool.mobilePos[0] > 0 ? 1 : -1) * Math.min(viewport.width * 0.24, 1.35),
        tool.mobilePos[1] * 0.92 - 0.15,
        tool.mobilePos[2],
      ]
    : [
        tool.desktopPos[0] * Math.min(1, viewport.width / 11.0),
        tool.desktopPos[1],
        tool.desktopPos[2],
      ];
  const baseScale = isCompact
    ? Math.min(0.68, Math.max(0.48, viewport.width / 6.3))
    : Math.min(1.0, Math.max(0.76, viewport.width / 11.0));

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const dt = Math.min(0.05, delta);

    const floatY = Math.sin(t * tool.floatSpeed + tool.floatPhase) * 0.2;
    const floatX = Math.cos(t * tool.floatSpeed * 0.7 + tool.floatPhase) * 0.08;

    const desiredX = targetBasePos[0] + floatX;
    const desiredY = targetBasePos[1] + floatY;
    const desiredZ = targetBasePos[2] + (isHovered ? 0.55 : 0);

    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      desiredX,
      dt * 6
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      desiredY,
      dt * 6
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      desiredZ,
      dt * 7
    );

    const targetScale = baseScale * (isHovered ? 1.15 : 1.0);
    const nextScale = THREE.MathUtils.lerp(
      groupRef.current.scale.x,
      targetScale,
      dt * 8
    );
    groupRef.current.scale.setScalar(nextScale);

    const idleRotY = Math.sin(t * 0.8 + tool.floatPhase) * 0.22;
    const idleRotX = Math.cos(t * 0.65 + tool.floatPhase) * 0.1;
    const desiredRotY = isHovered ? 0 : idleRotY;
    const desiredRotX = isHovered ? 0 : idleRotX;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      desiredRotY,
      dt * 6
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      desiredRotX,
      dt * 6
    );

    if (glowMatRef.current) {
      glowMatRef.current.opacity = THREE.MathUtils.lerp(
        glowMatRef.current.opacity,
        isHovered ? 0.85 : 0.32,
        dt * 7
      );
    }

    if (frameMatRef.current) {
      frameMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        frameMatRef.current.emissiveIntensity,
        isHovered ? 0.55 : 0.12,
        dt * 7
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={targetBasePos}
      scale={baseScale}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        onHoverChange(tool.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "auto";
        onHoverChange(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onHoverChange(isHovered ? null : tool.id);
      }}
    >
      {/* Subtle red ambient glow halo behind each 3D icon */}
      <mesh position={[0, 0, -0.22]}>
        <planeGeometry args={[3.5, 3.5]} />
        <meshBasicMaterial
          ref={glowMatRef}
          map={glowTexture}
          transparent
          opacity={0.32}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3D Beveled obsidian plaque for realistic depth & lighting */}
      <RoundedBox
        args={[1.92, 1.92, 0.22]}
        radius={0.35}
        smoothness={6}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          ref={frameMatRef}
          color="#13080d"
          metalness={0.65}
          roughness={0.25}
          emissive="#E50935"
          emissiveIntensity={0.12}
        />
      </RoundedBox>

      {/* Front icon face preserving exact artwork, aspect ratio, and transparency */}
      <mesh position={[0, 0, 0.118]}>
        <planeGeometry args={[2.38, 2.38]} />
        <meshStandardMaterial
          map={texture}
          transparent
          alphaTest={0.05}
          roughness={0.25}
          metalness={0.08}
        />
      </mesh>

      {/* Back icon face for clean 3D rotation */}
      <mesh position={[0, 0, -0.118]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.38, 2.38]} />
        <meshStandardMaterial
          map={texture}
          transparent
          alphaTest={0.05}
          roughness={0.25}
          metalness={0.08}
        />
      </mesh>

      {isHovered && (
        <Html position={[0, -1.48, 0.25]} center distanceFactor={11}>
          <div className="tech-icon-tooltip">{tool.name}</div>
        </Html>
      )}
    </group>
  );
}

function FloatingCluster({
  textures,
  glowTexture,
  hoveredId,
  onHoverChange,
}: {
  textures: THREE.Texture[];
  glowTexture: THREE.Texture;
  hoveredId: string | null;
  onHoverChange: (id: string | null) => void;
}) {
  const clusterRef = useRef<THREE.Group>(null);

  useFrame(({ pointer }, delta) => {
    if (!clusterRef.current) return;
    const dt = Math.min(0.05, delta);
    const targetRotY = pointer.x * 0.14;
    const targetRotX = -pointer.y * 0.08;
    clusterRef.current.rotation.y = THREE.MathUtils.lerp(
      clusterRef.current.rotation.y,
      targetRotY,
      dt * 4
    );
    clusterRef.current.rotation.x = THREE.MathUtils.lerp(
      clusterRef.current.rotation.x,
      targetRotX,
      dt * 4
    );
  });

  return (
    <group ref={clusterRef} position={[0, -0.35, 0]}>
      {softwareTools.map((tool, index) => (
        <FloatingIcon
          key={tool.id}
          tool={tool}
          texture={textures[index]}
          glowTexture={glowTexture}
          isHovered={hoveredId === tool.id}
          onHoverChange={onHoverChange}
        />
      ))}

      {/* Soft grounded red floor glow & shadow catch under cluster */}
      <mesh position={[0, -2.55, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 5.5]} />
        <meshBasicMaterial
          map={glowTexture}
          transparent
          opacity={0.26}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function TechStackCanvas({
  hoveredId,
  onHoverChange,
  isInView,
}: {
  hoveredId: string | null;
  onHoverChange: (id: string | null) => void;
  isInView: boolean;
}) {
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return softwareTools.map((tool) => {
      const tex = loader.load(tool.image);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      return tex;
    });
  }, []);

  const glowTexture = useMemo(() => createRedGlowTexture(), []);

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.75]}
      frameloop={isInView ? "always" : "never"}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 12], fov: 38, near: 0.5, far: 100 }}
      onCreated={(state) => (state.gl.toneMappingExposure = 1.15)}
      className="tech-canvas"
    >
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[4, 7, 8]}
        intensity={1.7}
        color="#ffffff"
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <pointLight position={[-6, 1, 5]} intensity={14} color="#E50935" distance={22} />
      <pointLight position={[6, -1, 4]} intensity={12} color="#FF1744" distance={22} />
      <pointLight position={[0, 4, -5]} intensity={10} color="#8B001F" distance={20} />

      <FloatingCluster
        textures={textures}
        glowTexture={glowTexture}
        hoveredId={hoveredId}
        onHoverChange={onHoverChange}
      />

      <Environment
        files="/models/char_enviorment.hdr"
        environmentIntensity={0.45}
        environmentRotation={[0, 4, 2]}
      />
    </Canvas>
  );
}

const TechStack = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [shouldMountCanvas, setShouldMountCanvas] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const preloadObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldMountCanvas(true);
          preloadObserver.disconnect();
        }
      },
      { rootMargin: "900px 0px" }
    );
    preloadObserver.observe(el);

    const viewObserver = new IntersectionObserver(
      (entries) => {
        setIsInView(Boolean(entries[0]?.isIntersecting));
      },
      { rootMargin: "250px 0px" }
    );
    viewObserver.observe(el);

    return () => {
      preloadObserver.disconnect();
      viewObserver.disconnect();
      document.body.style.cursor = "auto";
    };
  }, []);

  useGSAP(() => {
    const techTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".techstack",
        start: "top 85%",
        end: "top 25%",
        scrub: true,
        id: "techstack-trigger",
      },
    });

    techTimeline.fromTo(
      ".techstack h2",
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, ease: "power2.out" }
    );

    techTimeline.fromTo(
      ".tech-canvas",
      { opacity: 0 },
      { opacity: 1, ease: "power2.out" },
      0.2
    );

    return () => {
      techTimeline.kill();
      ScrollTrigger.getById("techstack-trigger")?.kill();
    };
  }, [shouldMountCanvas]);

  return (
    <div className="techstack" ref={sectionRef}>
      <h2>Skills &amp; Tools</h2>

      {shouldMountCanvas && (
        <TechStackCanvas
          hoveredId={hoveredId}
          onHoverChange={setHoveredId}
          isInView={isInView}
        />
      )}
    </div>
  );
};

export default TechStack;
