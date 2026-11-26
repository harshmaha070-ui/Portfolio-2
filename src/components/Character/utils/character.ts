import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";

const LFS_REMOTE_MODEL_BASE =
  "https://media.githubusercontent.com/media/harshmaha070-ui/portfolio-2/main/public/models";

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

function createRedFloorSpotlight(): THREE.Mesh {
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

  // Match exact ground plane dimensions & floor placement from original scene
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(14.542847, 16.989408),
    mat
  );
  ground.name = "ground";
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 2.753274, 2.014779);
  ground.receiveShadow = true;
  return ground;
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
        const isMobileViewport = window.innerWidth < 768;
        const modelFile = isMobileViewport
          ? "character-mobile.glb"
          : "character.glb";

        let customCharGltf: GLTF | null = null;
        try {
          customCharGltf = await loadGlbWithLfsFallback(
            loader,
            `/models/${modelFile}`,
            modelFile
          );
        } catch (e) {
          // Fallback to standard model if mobile variant fails
          if (isMobileViewport) {
            try {
              customCharGltf = await loadGlbWithLfsFallback(
                loader,
                "/models/character.glb",
                "character.glb"
              );
            } catch (fallbackErr) {
              console.error("Failed to load character model:", fallbackErr);
              resolve(null);
              return;
            }
          } else {
            console.error("Failed to load character model:", e);
            resolve(null);
            return;
          }
        }

        const customChar = customCharGltf.scene;

        customChar.traverse((child: any) => {
          if (child.isMesh) {
            const mesh = child as THREE.Mesh;
            child.castShadow = !isMobileViewport;
            child.receiveShadow = !isMobileViewport;
            mesh.frustumCulled = true;
          }
        });

        // Calculate custom character's bounding box
        const box = new THREE.Box3().setFromObject(customChar);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Target height to match the original character scale with large, prominent presence
        const targetHeight = 13.8;
        const scale = size.y > 0 ? targetHeight / size.y : 12.0;
        customChar.scale.setScalar(scale);

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

        const charGroup = new THREE.Group();
        charGroup.add(createRedFloorSpotlight());
        charGroup.add(headPivot);

        try {
          await renderer.compileAsync(charGroup, camera, scene);
        } catch (compileErr) {
          console.warn("Shader compileAsync warning:", compileErr);
        }

        const returnGltf: GLTF = {
          ...customCharGltf,
          scene: charGroup as any,
        };

        resolve(returnGltf);
        setCharTimeline(charGroup, camera);
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
