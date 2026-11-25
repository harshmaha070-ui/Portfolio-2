import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";

const LFS_REMOTE_MODEL_BASE =
  "https://media.githubusercontent.com/media/harshmaha070-ui/Portfolio-2/main/public/models";

async function loadGlbWithLfsFallback(
  loader: GLTFLoader,
  localPath: string,
  fileName: string
): Promise<GLTF> {
  try {
    return await loader.loadAsync(localPath);
  } catch (localErr) {
    const remoteUrl = `${LFS_REMOTE_MODEL_BASE}/${encodeURIComponent(fileName)}`;
    console.warn(
      `Failed to load local ${localPath}, falling back to ${remoteUrl}:`,
      localErr
    );
    return await loader.loadAsync(remoteUrl);
  }
}

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve) => {
      try {
        // 1. Load Desk Environment (table, monitor, computer, keyboard, animations)
        let deskGltf: GLTF | null = null;
        try {
          deskGltf = await loadGlbWithLfsFallback(
            loader,
            "/models/desk.glb",
            "desk.glb"
          );
        } catch (e) {
          console.warn("Desk model not found, proceeding with character only.", e);
        }

        // 2. Load Custom Character model
        let customCharGltf: GLTF | null = null;
        try {
          customCharGltf = await loadGlbWithLfsFallback(
            loader,
            "/models/character.glb",
            "character.glb"
          );
        } catch (e) {
          console.error("Failed to load character model:", e);
          resolve(null);
          return;
        }
        const customChar = customCharGltf.scene;

        customChar.traverse((child: any) => {
          if (child.isMesh) {
            const mesh = child as THREE.Mesh;
            child.castShadow = true;
            child.receiveShadow = true;
            mesh.frustumCulled = true;
          }
        });

        // Calculate custom character's bounding box
        const box = new THREE.Box3().setFromObject(customChar);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Target height to match the original character scale with large, prominent presence
        // 13.8 gives prominent stature while ensuring ample headroom in all scroll sections
        const targetHeight = 13.8;
        const scale = size.y > 0 ? targetHeight / size.y : 12.0;
        customChar.scale.setScalar(scale);

        // Standing pivot for character interactions
        // In Hero view: positioned at y ≈ 0.8, z ≈ -0.2 so eyes are at camera eye level (y ≈ 13.1)
        // In Desk view: animates to stand beside the desk at x ≈ -2.6, y = 2.75 (floor level), z ≈ 2.2
        const headPivot = new THREE.Group();
        headPivot.name = "headPivot";
        headPivot.position.set(0, 0.8, -0.2);

        // Position custom character inside headPivot so feet rest at local y = 0
        customChar.position.set(
          -center.x * scale,
          -box.min.y * scale,
          -center.z * scale
        );
        headPivot.add(customChar);

        let rootObject: THREE.Object3D;
        let returnGltf: GLTF;

        if (deskGltf) {
          const deskScene = deskGltf.scene;

          // Completely remove any original white character meshes, bones, or leftovers
          const originalWhiteCharNames = [
            "metarig.002",
            "hair",
            "BODY.SHIRT",
            "Ear.001",
            "Eyebrow",
            "EYEs.001",
            "Face.002",
            "Hand",
            "Neck",
            "Pant",
            "Plane.007",
            "Shoe",
            "Sole",
            "spine",
            "spine.001",
            "spine.002",
            "spine.003",
            "spine.004",
            "spine.005",
            "spine.006",
          ];

          originalWhiteCharNames.forEach((name) => {
            const obj = deskScene.getObjectByName(name);
            if (obj) {
              if (obj.parent) obj.parent.remove(obj);
              obj.visible = false;
            }
          });

          // Completely remove any chair objects (Plane = chair seat/backrest, Plane.003 = chair base/legs)
          const chairNames = [
            "Plane",
            "Plane.003",
            "Plane003",
            "Plane.016",
            "Plane016",
            "chair",
            "Chair",
            "stool",
            "Stool",
          ];
          chairNames.forEach((name) => {
            const obj = deskScene.getObjectByName(name);
            if (obj) {
              obj.visible = false;
              if (obj.parent) obj.parent.remove(obj);
            }
          });

          // Completely remove any unwanted objects:
          // original character, chair, monitor, desk/tabletop, keyboard, and all keys.
          // Keep ONLY the ground (red glowing floor plane).
          const unwantedObjectNames = [
            ...originalWhiteCharNames,
            ...chairNames,
            "Plane.002",
            "Plane002",
            "Plane.003",
            "Plane003",
            "Plane.004",
            "Plane004",
            "Plane.015",
            "Plane015",
            "Plane.016",
            "Plane016",
            "Plane.017",
            "Plane017",
            "Cube.002",
            "Cube002",
            "screenlight",
            "Screenlight",
            "screenLight",
            "Keyboard",
            "keyboard",
            "KEYS",
            "Monitor",
            "monitor",
            "display",
            "Display",
          ];
          unwantedObjectNames.forEach((name) => {
            const obj = deskScene.getObjectByName(name);
            if (obj) {
              obj.visible = false;
              if (obj.parent) obj.parent.remove(obj);
            }
          });

          // Ensure ONLY the ground (purple glowing floor plane) remains from deskScene
          const toRemove: THREE.Object3D[] = [];
          deskScene.traverse((child: any) => {
            if (child.isMesh) {
              const name = child.name || "";
              const parentName = child.parent ? child.parent.name || "" : "";

              // Keep ONLY the ground plane (the purple glowing floor)
              const isGround = name === "ground" || parentName === "ground";

              if (!isGround) {
                child.visible = false;
                child.castShadow = false;
                child.receiveShadow = false;
                toRemove.push(child);
              }
            }
          });

          toRemove.forEach((child) => {
            if (child.parent) child.parent.remove(child);
          });

          // Transform the floor spotlight into a beautiful, premium red glow
          const groundObj = deskScene.getObjectByName("ground") as THREE.Mesh;
          if (groundObj) {
            const canvas = document.createElement("canvas");
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
              gradient.addColorStop(0, "rgba(255, 23, 68, 0.95)");
              gradient.addColorStop(0.25, "rgba(229, 9, 53, 0.75)");
              gradient.addColorStop(0.55, "rgba(139, 0, 31, 0.35)");
              gradient.addColorStop(0.8, "rgba(61, 0, 16, 0.12)");
              gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, 512, 512);
            }
            const redGlowTexture = new THREE.CanvasTexture(canvas);
            const mat = new THREE.MeshStandardMaterial({
              map: redGlowTexture,
              transparent: true,
              opacity: 0.9,
              depthWrite: false,
              roughness: 0.8,
              metalness: 0.1,
              emissive: new THREE.Color(0xe50935),
              emissiveIntensity: 0.45,
            });
            groundObj.material = mat;
          }

          try {
            await renderer.compileAsync(deskScene, camera, scene);
          } catch (compileErr) {
            console.warn("Shader compileAsync warning:", compileErr);
          }

          // Add ONLY the custom character inside the scene
          deskScene.add(headPivot);

          rootObject = deskScene;
          returnGltf = deskGltf;
        } else {
          const charGroup = new THREE.Group();
          charGroup.add(headPivot);
          try {
            await renderer.compileAsync(charGroup, camera, scene);
          } catch (compileErr) {
            console.warn("Shader compileAsync warning:", compileErr);
          }
          rootObject = charGroup;
          returnGltf = {
            ...customCharGltf,
            scene: charGroup as any,
          };
        }

        resolve(returnGltf);
        setCharTimeline(rootObject, camera);
        setAllTimeline();

        dracoLoader.dispose();
      } catch (err) {
        console.error(err);
        dracoLoader.dispose();
        resolve(null);
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;
