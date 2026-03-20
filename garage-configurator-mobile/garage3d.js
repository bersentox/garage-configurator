import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/+esm';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js/+esm';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js/+esm';
import { resolveModelAsset } from './asset-paths.js';

const MODEL_FILES = {
  '6x6': 'garage_6x6.glb',
  '6x8': 'garage_6x8.glb',
  '6x10': 'garage_6x10.glb',
  '8x6': 'garage_8x6.glb',
  '8x8': 'garage_8x8.glb',
  '8x10': 'garage_8x10.glb'
};

const SUPPORTED_LENGTHS = [6, 8, 10];
const MATERIAL_ROLE_MAP = {
  gate: ['mat_gate', 'gate'],
  roof: ['mat_roof', 'roof'],
  trim: ['mat_trim', 'trim', 'foundation'],
  wall: ['mat_walls', 'walls'],
  interiorWall: ['mat_windows', 'mat_glass', 'windows', 'glass']
};

function clampPixelRatio() {
  return Math.min(window.devicePixelRatio || 1, 1.25);
}

function normalizeSize(width, length) {
  const canonicalWidth = Number(width) >= 8 ? 8 : 6;
  const numericLength = Number(length) || 6;
  const canonicalLength = SUPPORTED_LENGTHS.reduce((closest, option) => (
    Math.abs(option - numericLength) < Math.abs(closest - numericLength) ? option : closest
  ), SUPPORTED_LENGTHS[0]);
  return { width: canonicalWidth, length: canonicalLength, key: `${canonicalWidth}x${canonicalLength}` };
}

function disposeMaterial(material) {
  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
    return;
  }
  material?.dispose?.();
}

export function createGarage3DViewer({ containerId = 'garage-3d-viewer' } = {}) {
  const container = document.getElementById(containerId);
  if (!container) return { applyColors() {}, loadModelBySize() {}, destroy() {} };

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#dde6ee');

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(8.2, 4.6, 9.8);

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(clampPixelRatio());
  renderer.setSize(container.clientWidth || 1, container.clientHeight || 1, false);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.rotateSpeed = 0.55;
  controls.minPolarAngle = 0.95;
  controls.maxPolarAngle = 1.35;
  controls.target.set(0, 1.65, 0);

  const ambient = new THREE.HemisphereLight(0xffffff, 0x94a5b8, 1.2);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(8, 10, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xd9e7f5, 0.5);
  fillLight.position.set(-6, 5, -5);
  scene.add(fillLight);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(9, 48),
    new THREE.MeshStandardMaterial({ color: '#c8d3df', roughness: 1, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  scene.add(ground);

  const loader = new GLTFLoader();
  const modelAnchor = new THREE.Group();
  scene.add(modelAnchor);

  let currentModel = null;
  let activeRequestId = 0;
  let lastRequestedKey = '';
  let currentColors = {};
  let destroyed = false;
  let frameId = 0;
  let resizeObserver = null;

  function collectColorTargets(root) {
    const targets = { wall: [], roof: [], gate: [], trim: [], interiorWall: [] };
    root.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = false;
      node.receiveShadow = false;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((material) => {
        if (!material || !material.name) return;
        const name = material.name.toLowerCase();
        Object.entries(MATERIAL_ROLE_MAP).forEach(([role, markers]) => {
          if (markers.some((marker) => name.includes(marker))) {
            targets[role].push(material);
          }
        });
      });
    });
    return targets;
  }

  function fitCameraToModel(root) {
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    controls.target.copy(center);
    const distance = Math.max(size.x, size.z) * 1.28 + 2.8;
    camera.position.set(center.x + distance * 0.82, center.y + size.y * 0.95, center.z + distance);
    camera.lookAt(center);
  }

  function applyColors(colors = currentColors) {
    currentColors = { ...currentColors, ...colors };
    if (!currentModel?.userData?.colorTargets) return;

    Object.entries(currentModel.userData.colorTargets).forEach(([role, materials]) => {
      const colorValue = currentColors[role];
      if (!colorValue) return;
      materials.forEach((material) => {
        material.color?.set(colorValue);
        material.needsUpdate = true;
      });
    });
  }

  function clearCurrentModel() {
    if (!currentModel) return;
    modelAnchor.remove(currentModel);
    currentModel.traverse((node) => {
      if (!node.isMesh) return;
      node.geometry?.dispose?.();
      disposeMaterial(node.material);
    });
    currentModel = null;
  }

  function setLoadingState(isLoading, message = '') {
    container.dataset.loading = String(isLoading);
    container.dataset.message = message;
  }

  function loadModelBySize(width, length) {
    const { key } = normalizeSize(width, length);
    if (key === lastRequestedKey && currentModel) {
      applyColors();
      return Promise.resolve();
    }

    lastRequestedKey = key;
    const requestId = ++activeRequestId;
    setLoadingState(true, 'Загружаем модель');

    return loader.loadAsync(resolveModelAsset(MODEL_FILES[key]))
      .then((gltf) => {
        if (destroyed || requestId != activeRequestId) return;
        clearCurrentModel();
        currentModel = gltf.scene;
        currentModel.rotation.y = -0.38;
        currentModel.position.set(0, 0, 0);
        currentModel.scale.setScalar(0.34);
        currentModel.userData.colorTargets = collectColorTargets(currentModel);
        modelAnchor.add(currentModel);
        fitCameraToModel(currentModel);
        applyColors();
        setLoadingState(false);
      })
      .catch((error) => {
        if (requestId != activeRequestId) return;
        console.error('[garage-configurator-mobile] GLB load failed', error);
        setLoadingState(false, 'Модель недоступна');
      });
  }

  function resize() {
    if (destroyed) return;
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(clampPixelRatio());
    renderer.setSize(width, height, false);
  }

  function animate() {
    if (destroyed) return;
    frameId = window.requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
  }

  window.addEventListener('resize', resize);
  resize();
  animate();

  return {
    applyColors,
    getCanonicalSize(width, length) {
      return normalizeSize(width, length);
    },
    loadModelBySize,
    destroy() {
      destroyed = true;
      activeRequestId += 1;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      resizeObserver?.disconnect();
      controls.dispose();
      clearCurrentModel();
      ground.geometry.dispose();
      disposeMaterial(ground.material);
      renderer.dispose();
      container.contains(renderer.domElement) && renderer.domElement.remove();
    }
  };
}
