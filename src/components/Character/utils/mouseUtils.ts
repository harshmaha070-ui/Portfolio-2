import * as THREE from "three";

export const handleMouseMove = (
  event: MouseEvent,
  setMousePosition: (x: number, y: number) => void
) => {
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  setMousePosition(mouseX, mouseY);
};

export const handleTouchMove = (
  event: TouchEvent,
  setMousePosition: (x: number, y: number) => void
) => {
  const mouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
  setMousePosition(mouseX, mouseY);
};

export const handleTouchEnd = (
  setMousePosition: (
    x: number,
    y: number,
    interpolationX: number,
    interpolationY: number
  ) => void
) => {
  setTimeout(() => {
    setMousePosition(0, 0, 0.03, 0.03);
    setTimeout(() => {
      setMousePosition(0, 0, 0.1, 0.2);
    }, 1000);
  }, 2000);
};

export const handleHeadRotation = (
  headBone: THREE.Object3D,
  mouseX: number,
  mouseY: number,
  interpolationX: number,
  interpolationY: number,
  lerp: (x: number, y: number, t: number) => number,
  elapsedTime: number = 0
) => {
  if (!headBone) return;

  // Subtle breathing cycle
  const breath = Math.sin(elapsedTime * 1.6) * 0.006;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const scrollY = typeof window !== "undefined" ? window.scrollY : 0;

  if (scrollY < 200) {
    // 1. Hero Section (Landing): Full interactive mouse tracking
    if (headBone.name === "headPivot") {
      headBone.rotation.y = lerp(
        headBone.rotation.y,
        mouseX * 0.35,
        interpolationY
      );
      headBone.rotation.x = lerp(
        headBone.rotation.x,
        -mouseY * 0.22 + breath,
        interpolationX
      );
      headBone.rotation.z = lerp(
        headBone.rotation.z,
        -mouseX * 0.05,
        interpolationX
      );
    } else {
      const maxRotation = Math.PI / 6;
      headBone.rotation.y = lerp(
        headBone.rotation.y,
        mouseX * maxRotation,
        interpolationY
      );
      let minRotationX = -0.3;
      let maxRotationX = 0.4;
      if (mouseY > minRotationX) {
        if (mouseY < maxRotationX) {
          headBone.rotation.x = lerp(
            headBone.rotation.x,
            -mouseY - 0.5 * maxRotation,
            interpolationX
          );
        } else {
          headBone.rotation.x = lerp(
            headBone.rotation.x,
            -maxRotation - 0.5 * maxRotation,
            interpolationX
          );
        }
      } else {
        headBone.rotation.x = lerp(
          headBone.rotation.x,
          -minRotationX - 0.5 * maxRotation,
          interpolationX
        );
      }
    }
  } else if (scrollY < vh * 1.15) {
    // 2. About Me Section: Face camera directly in slight 3/4 portrait angle
    // Both eyes clearly visible from the front, no side profile
    if (headBone.name === "headPivot") {
      headBone.rotation.y = lerp(
        headBone.rotation.y,
        mouseX * 0.12 - 0.04,
        0.05
      );
      headBone.rotation.x = lerp(
        headBone.rotation.x,
        0.02 + breath - mouseY * 0.08,
        0.05
      );
      headBone.rotation.z = lerp(
        headBone.rotation.z,
        -mouseX * 0.02,
        0.05
      );
    } else if (window.innerWidth >= 900) {
      headBone.rotation.x = lerp(headBone.rotation.x, -0.1, 0.03);
      headBone.rotation.y = lerp(headBone.rotation.y, -0.15, 0.03);
    }
  } else {
    // 3. What I Do Section (Desk Workspace):
    // Natural slight 3/4 view facing viewer, face clearly visible, both eyes visible
    if (headBone.name === "headPivot") {
      const glance = Math.sin(elapsedTime * 0.8) * 0.012;
      const workingPulse =
        Math.sin(elapsedTime * 14) * Math.cos(elapsedTime * 8) * 0.003;
      headBone.rotation.y = lerp(
        headBone.rotation.y,
        0.06 + glance + mouseX * 0.06,
        0.05
      );
      headBone.rotation.x = lerp(
        headBone.rotation.x,
        0.03 + breath + workingPulse - mouseY * 0.04,
        0.05
      );
      headBone.rotation.z = lerp(headBone.rotation.z, 0, 0.05);
    } else if (window.innerWidth >= 900) {
      headBone.rotation.x = lerp(headBone.rotation.x, -0.2, 0.03);
      headBone.rotation.y = lerp(headBone.rotation.y, -0.1, 0.03);
    }
  }
};
