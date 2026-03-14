import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const MODEL_PATH = "../models/garage_6x8.glb";

function buildMeshIndex(root) {
  const index = [];

  root.traverse((node) => {
    if (!node.isMesh) return;

    const meshName = (node.name || "").toLowerCase();
    const materialName = (node.material?.name || "").toLowerCase();
    const sourceName = `${meshName} ${materialName}`.trim();
    index.push({ node, sourceName, meshName, materialName });
    console.log("[Garage3D] mesh:", node.name || "(unnamed)", "material:", node.material?.name || "(unnamed)");
  });

  return index;
}

function findFirstMatch(meshIndex, terms) {
  return meshIndex.find(({ sourceName }) => terms.some((term) => sourceName.includes(term)))?.node || null;
}

function detectGarageParts(meshIndex) {
  const garageParts = {
    walls: null,
    roof: null,
    gate: null,
    trim: null,
    innerWalls: null
  };

  garageParts.walls = findFirstMatch(meshIndex, ["wall", "walls", "body", "facade", "fasad", "стен"]);
  garageParts.roof = findFirstMatch(meshIndex, ["roof", "top", "кры", "кров"]);
  garageParts.gate = findFirstMatch(meshIndex, ["gate", "door", "ворот"]);
  garageParts.trim = findFirstMatch(meshIndex, ["trim", "frame", "fascia", "corner", "угол", "обод"]);
  garageParts.innerWalls = findFirstMatch(meshIndex, ["inner", "interior", "inside", "внутр"]);

  console.log("[Garage3D] parts map", {
    walls: garageParts.walls?.name || null,
    roof: garageParts.roof?.name || null,
    gate: garageParts.gate?.name || null,
    trim: garageParts.trim?.name || null,
    innerWalls: garageParts.innerWalls?.name || null
  });

  return garageParts;
}

function cloneAndSetColor(mesh, color) {
  if (!mesh?.material) return;

  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map((material) => {
      const cloned = material.clone();
      if (cloned.color) cloned.color.set(color);
      return cloned;
    });
    return;
  }

  mesh.material = mesh.material.clone();
  if (mesh.material.color) {
    mesh.material.color.set(color);
  }
}

export function createGarage3DViewer({ containerId = "garage-3d-viewer" } = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    return {
      applyColors() {},
      destroy() {}
    };
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#f3f4f6");

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(7, 5, 9);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  container.appendChild(renderer.domElement);

  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xcbd5e1, 1.05);
  scene.add(hemisphereLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.15);
  directionalLight.position.set(8, 10, 7);
  scene.add(directionalLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.minDistance = 4;
  controls.maxDistance = 20;
  controls.target.set(0, 1.5, 0);

  const loader = new GLTFLoader();
  let animationFrameId = 0;
  let mountedModel = null;
  let destroyed = false;
  let resizeObserver = null;

  const garageParts = {
    walls: null,
    roof: null,
    gate: null,
    trim: null,
    innerWalls: null
  };

  function frameModel(object3d) {
    const box = new THREE.Box3().setFromObject(object3d);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    object3d.position.sub(center);

    const maxSize = Math.max(size.x, size.y, size.z);
    const distance = Math.max(6, maxSize * 1.7);
    camera.position.set(distance * 0.8, distance * 0.55, distance);
    camera.near = 0.1;
    camera.far = Math.max(100, distance * 12);
    camera.updateProjectionMatrix();
    controls.target.set(0, Math.max(size.y * 0.2, 1.2), 0);
    controls.update();
  }

  function setGarageColor(partName, color) {
    const mesh = garageParts[partName];
    if (!mesh || !color) return;

    cloneAndSetColor(mesh, color);
  }

  function applyColors(colors = {}) {
    setGarageColor("walls", colors.wall);
    setGarageColor("roof", colors.roof);
    setGarageColor("trim", colors.trim);
    setGarageColor("gate", colors.gate);
    setGarageColor("innerWalls", colors.interiorWall);
  }

  function resize() {
    if (destroyed) return;
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
  }

  function animate() {
    if (destroyed) return;
    animationFrameId = window.requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  loader.load(
    MODEL_PATH,
    (gltf) => {
      if (destroyed) return;

      mountedModel = gltf.scene;
      scene.add(mountedModel);
      frameModel(mountedModel);

      const meshIndex = buildMeshIndex(mountedModel);
      Object.assign(garageParts, detectGarageParts(meshIndex));
    },
    undefined,
    (error) => {
      console.error("[Garage3D] Failed to load model", error);
    }
  );

  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
  }

  window.addEventListener("resize", resize);
  resize();
  animate();

  return {
    applyColors,
    destroy() {
      destroyed = true;
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      resizeObserver?.disconnect();
      controls.dispose();

      if (mountedModel) {
        mountedModel.traverse((node) => {
          if (!node.isMesh) return;
          node.geometry?.dispose?.();

          if (Array.isArray(node.material)) {
            node.material.forEach((material) => material?.dispose?.());
          } else {
            node.material?.dispose?.();
          }
        });
      }

      renderer.dispose();
      renderer.domElement.remove();
    }
  };
}
