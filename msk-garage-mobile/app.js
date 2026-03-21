import * as THREE from 'https://unpkg.com/three@0.160.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.1/examples/jsm/loaders/GLTFLoader.js';

const state = {
  type: 'single',
  length: '6',
  color: 'sand',
};

const CONFIG = {
  prices: {
    single: { label: 'от 1 000 000 ₽', copy: 'Для гаража на одни ворота. Финальный расчёт зависит от комплектации, площадки и монтажа.' },
    double: { label: 'от 2 000 000 ₽', copy: 'Для гаража на двое ворот. Финальная стоимость уточняется после выбора комплектации и условий монтажа.' },
  },
  labels: {
    type: { single: '1 ворота', double: '2 ворота' },
    color: { sand: 'Песочный', chocolate: 'Шоколадный', graphite: 'Графит' },
  },
  modelMap: {
    single: { '6': 'assets/models/garage_6x6.glb', '8': 'assets/models/garage_6x8.glb', '10': 'assets/models/garage_6x10.glb' },
    double: { '6': 'assets/models/garage_8x6.glb', '8': 'assets/models/garage_8x8.glb', '10': 'assets/models/garage_8x10.glb' },
  },
  colors: {
    sand: 0xc5ab79,
    chocolate: 0x5d4032,
    graphite: 0x424954,
  },
};

const refs = {
  viewer: document.getElementById('viewer'),
  viewerTitle: document.getElementById('viewer-title'),
  viewerStatus: document.getElementById('viewer-status'),
  priceValue: document.getElementById('price-value'),
  priceCopy: document.getElementById('price-copy'),
  typeSummary: document.getElementById('type-summary'),
  lengthSummary: document.getElementById('length-summary'),
  colorSummary: document.getElementById('color-summary'),
};

let scene;
let camera;
let renderer;
let controls;
let currentModel;
let animationId;
let loadToken = 0;
const loader = new GLTFLoader();

initViewer();
bindControls();
updateUI();
loadCurrentModel();

function initViewer() {
  scene = new THREE.Scene();
  scene.background = null;

  const { clientWidth, clientHeight } = refs.viewer;
  camera = new THREE.PerspectiveCamera(32, clientWidth / clientHeight, 0.1, 100);
  camera.position.set(6, 3.8, 8);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(clientWidth, clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  refs.viewer.appendChild(renderer.domElement);

  const ambient = new THREE.HemisphereLight(0xffffff, 0x5e6774, 1.5);
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(6, 10, 8);
  const fill = new THREE.DirectionalLight(0xf7d9aa, 0.55);
  fill.position.set(-5, 4, -3);
  scene.add(ambient, key, fill);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(8, 40),
    new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.08 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.95;
  scene.add(floor);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.minDistance = 6;
  controls.maxDistance = 10;
  controls.minPolarAngle = Math.PI / 3.4;
  controls.maxPolarAngle = Math.PI / 2.08;
  controls.target.set(0, 0.6, 0);

  window.addEventListener('resize', handleResize);
  animate();
}

function bindControls() {
  document.querySelectorAll('[data-option]').forEach((button) => {
    button.addEventListener('click', () => {
      const option = button.dataset.option;
      const value = button.dataset.value;
      state[option] = value;
      updateUI();
      if (option === 'type' || option === 'length') {
        loadCurrentModel();
      } else {
        applyColorTint();
      }
    });
  });

  document.querySelectorAll('[data-type-choice]').forEach((link) => {
    link.addEventListener('click', () => {
      state.type = link.dataset.typeChoice;
      updateUI();
      loadCurrentModel();
    });
  });
}

function updateUI() {
  document.querySelectorAll('[data-option="type"]').forEach((button) => button.classList.toggle('is-active', button.dataset.value === state.type));
  document.querySelectorAll('[data-option="length"]').forEach((button) => button.classList.toggle('is-active', button.dataset.value === state.length));
  document.querySelectorAll('[data-option="color"]').forEach((button) => button.classList.toggle('is-active', button.dataset.value === state.color));

  refs.typeSummary.textContent = CONFIG.labels.type[state.type];
  refs.lengthSummary.textContent = `${state.length} м`;
  refs.colorSummary.textContent = CONFIG.labels.color[state.color];
  refs.viewerTitle.textContent = `Гараж ${state.type === 'single' ? '6' : '8'}×${state.length} · ${CONFIG.labels.type[state.type]}`;
  refs.priceValue.textContent = CONFIG.prices[state.type].label;
  refs.priceCopy.textContent = CONFIG.prices[state.type].copy;
}

function loadCurrentModel() {
  const token = ++loadToken;
  const modelPath = CONFIG.modelMap[state.type][state.length];
  refs.viewerStatus.textContent = 'Модель загружается';

  loader.load(
    modelPath,
    (gltf) => {
      if (token !== loadToken) return;
      if (currentModel) scene.remove(currentModel);
      currentModel = gltf.scene;

      centerModel(currentModel);
      currentModel.rotation.y = -Math.PI / 5.2;
      scene.add(currentModel);
      applyColorTint();
      refs.viewerStatus.textContent = '3D готов';
    },
    undefined,
    () => {
      if (token !== loadToken) return;
      refs.viewerStatus.textContent = 'Не удалось загрузить модель';
    }
  );
}

function centerModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  model.position.sub(center);
  model.position.y = -box.min.y - size.y * 0.15 - 0.95;

  const maxSize = Math.max(size.x, size.y, size.z) || 1;
  const scale = 4.6 / maxSize;
  model.scale.setScalar(scale);
}

function applyColorTint() {
  if (!currentModel) return;
  const tint = new THREE.Color(CONFIG.colors[state.color]);

  currentModel.traverse((child) => {
    if (!child.isMesh || !child.material) return;

    const sourceMaterials = Array.isArray(child.material) ? child.material : [child.material];
    const tintedMaterials = sourceMaterials.map((material) => {
      if (!material.color) return material;

      if (!material.userData.__mskBaseColor) {
        material.userData.__mskBaseColor = material.color.clone();
      }

      const nextMaterial = material.clone();
      nextMaterial.color.copy(material.userData.__mskBaseColor).lerp(tint, 0.72);
      nextMaterial.userData.__mskBaseColor = material.userData.__mskBaseColor.clone();
      nextMaterial.needsUpdate = true;
      return nextMaterial;
    });

    child.material = Array.isArray(child.material) ? tintedMaterials : tintedMaterials[0];
  });
}

function handleResize() {
  if (!renderer || !camera) return;
  const { clientWidth, clientHeight } = refs.viewer;
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight);
}

function animate() {
  animationId = requestAnimationFrame(animate);
  if (currentModel) currentModel.rotation.y += 0.0015;
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('beforeunload', () => cancelAnimationFrame(animationId));
