import * as THREE from './vendor/three/three.module.js';
import { OrbitControls } from './vendor/three/OrbitControls.js';
import { GLTFLoader } from './vendor/three/GLTFLoader.js';

const root = document.getElementById('garage-mobile-root');

const state = {
  type: 'single',
  length: '6',
  color: 'sand',
};

const CONFIG = {
  prices: {
    single: {
      '6': { label: 'от 1 000 000 ₽', copy: 'Для гаража на одни ворота. Финальный расчёт зависит от комплектации, площадки и монтажа.' },
      '8': { label: 'от 1 200 000 ₽', copy: 'Для гаража на одни ворота. Финальный расчёт зависит от комплектации, площадки и монтажа.' },
      '10': { label: 'от 1 400 000 ₽', copy: 'Для гаража на одни ворота. Финальный расчёт зависит от комплектации, площадки и монтажа.' },
    },
    double: {
      '6': { label: 'от 2 000 000 ₽', copy: 'Для гаража на двое ворот. Финальная стоимость уточняется после выбора комплектации и условий монтажа.' },
      '8': { label: 'от 2 300 000 ₽', copy: 'Для гаража на двое ворот. Финальная стоимость уточняется после выбора комплектации и условий монтажа.' },
      '10': { label: 'от 2 600 000 ₽', copy: 'Для гаража на двое ворот. Финальная стоимость уточняется после выбора комплектации и условий монтажа.' },
    },
  },
  labels: {
    type: { single: '1 ворота', double: '2 ворота' },
    color: { sand: 'Песочный', chocolate: 'Шоколадный', graphite: 'Графит' },
  },
  modelMap: {
  single: {
    '6': 'https://bersentox.github.io/garage-configurator/msk-garage-mobile/assets/models/garage_6x6.glb',
    '8': 'https://bersentox.github.io/garage-configurator/msk-garage-mobile/assets/models/garage_6x8.glb',
    '10': 'https://bersentox.github.io/garage-configurator/msk-garage-mobile/assets/models/garage_6x10.glb',
  },
  double: {
    '6': 'https://bersentox.github.io/garage-configurator/msk-garage-mobile/assets/models/garage_8x6.glb',
    '8': 'https://bersentox.github.io/garage-configurator/msk-garage-mobile/assets/models/garage_8x8.glb',
    '10': 'https://bersentox.github.io/garage-configurator/msk-garage-mobile/assets/models/garage_8x10.glb',
  }
}
  colors: {
    sand: 0xc5ab79,
    chocolate: 0x5d4032,
    graphite: 0x424954,
  },
};

const refs = {
  viewer: root?.querySelector('#viewer'),
  viewerTitle: root?.querySelector('#viewer-title'),
  viewerStatus: root?.querySelector('#viewer-status'),
  priceValue: root?.querySelector('#price-value'),
  priceCopy: root?.querySelector('#price-copy'),
  typeSummary: root?.querySelector('#type-summary'),
  lengthSummary: root?.querySelector('#length-summary'),
  colorSummary: root?.querySelector('#color-summary'),
};

let scene;
let camera;
let renderer;
let controls;
let currentModel;
let currentPivot;
let animationId;
let loadToken = 0;
const loader = new GLTFLoader();

boot();

function boot() {
  if (!root) return;

  bindControls();
  updateUI();

  if (!refs.viewer) return;

  initViewer();
  loadCurrentModel();
}

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

  window.addEventListener('resize', handleResize);
  animate();
}

function bindControls() {
  root.querySelectorAll('[data-option]').forEach((button) => {
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

  root.querySelectorAll('[data-type-choice]').forEach((link) => {
    link.addEventListener('click', () => {
      state.type = link.dataset.typeChoice;
      updateUI();
      loadCurrentModel();
    });
  });

  const timelineItems = root.querySelectorAll('.timeline-item');
  if (!timelineItems.length) return;

  const setActiveTimelineItem = (nextItem) => {
    timelineItems.forEach((item) => {
      const isActive = item === nextItem;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
  };

  timelineItems.forEach((item) => {
    item.addEventListener('click', () => setActiveTimelineItem(item));
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setActiveTimelineItem(item);
      }
    });
  });

  const faqItems = root.querySelectorAll('.faq-list details');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;

      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.open = false;
        }
      });
    });
  });
}

function updateUI() {
  root.querySelectorAll('[data-option="type"]').forEach((button) => button.classList.toggle('is-active', button.dataset.value === state.type));
  root.querySelectorAll('[data-option="length"]').forEach((button) => button.classList.toggle('is-active', button.dataset.value === state.length));
  root.querySelectorAll('[data-option="color"]').forEach((button) => button.classList.toggle('is-active', button.dataset.value === state.color));

  refs.typeSummary.textContent = CONFIG.labels.type[state.type];
  refs.lengthSummary.textContent = `${state.length} м`;
  refs.colorSummary.textContent = CONFIG.labels.color[state.color];
  refs.viewerTitle.textContent = `Гараж ${state.type === 'single' ? '6' : '8'}×${state.length} · ${CONFIG.labels.type[state.type]}`;
  const currentPrice = CONFIG.prices[state.type][state.length];
  refs.priceValue.textContent = currentPrice.label;
  refs.priceCopy.textContent = currentPrice.copy;
}

function loadCurrentModel() {
  const token = ++loadToken;
  const modelPath = CONFIG.modelMap[state.type][state.length];
  refs.viewerStatus.textContent = 'Модель загружается';

  loader.load(
    modelPath,
    (gltf) => {
      if (token !== loadToken) return;
      if (currentPivot) scene.remove(currentPivot);

      currentModel = gltf.scene;
      currentPivot = new THREE.Group();

      const fit = normalizeModelIntoPivot(currentModel, currentPivot);

      currentPivot.rotation.y = -Math.PI / 5.2;
      scene.add(currentPivot);

      applyColorTint();
      applyViewerFit(fit);

      controls.target.copy(fit.center);
      controls.update();

      refs.viewerStatus.textContent = '3D готов';
    },
    undefined,
    () => {
      if (token !== loadToken) return;
      refs.viewerStatus.textContent = 'Не удалось загрузить модель';
    }
  );
}

function normalizeModelIntoPivot(model, pivot) {
  const rawBox = new THREE.Box3().setFromObject(model);
  const rawSize = new THREE.Vector3();
  const rawCenter = new THREE.Vector3();
  rawBox.getSize(rawSize);
  rawBox.getCenter(rawCenter);

  const maxSize = Math.max(rawSize.x, rawSize.y, rawSize.z) || 1;
  const scale = 4.6 / maxSize;
  model.scale.setScalar(scale);

  const scaledBox = new THREE.Box3().setFromObject(model);
  const scaledSize = new THREE.Vector3();
  const scaledCenter = new THREE.Vector3();
  scaledBox.getSize(scaledSize);
  scaledBox.getCenter(scaledCenter);

  model.position.set(
    -scaledCenter.x,
    -scaledCenter.y + scaledSize.y * 0.35,
    -scaledCenter.z
  );

  pivot.add(model);

  const finalBox = new THREE.Box3().setFromObject(pivot);
  const finalSize = new THREE.Vector3();
  const finalCenter = new THREE.Vector3();
  finalBox.getSize(finalSize);
  finalBox.getCenter(finalCenter);

  return { box: finalBox, size: finalSize, center: finalCenter };
}

function applyViewerFit({ size, center }) {
  const maxDim = Math.max(size.x, size.y, size.z) || 1;

  const fitHeightDistance = maxDim / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = Math.max(fitHeightDistance, fitWidthDistance) * 1.2;

  camera.position.set(
    center.x + distance * 0.9,
    center.y + distance * 0.45,
    center.z + distance * 1.05
  );

  camera.near = Math.max(0.1, distance / 100);
  camera.far = Math.max(100, distance * 10);
  camera.updateProjectionMatrix();

  controls.minDistance = distance * 0.7;
  controls.maxDistance = distance * 1.5;
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
  if (currentPivot) currentPivot.rotation.y += 0.0015;
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('beforeunload', () => cancelAnimationFrame(animationId));
