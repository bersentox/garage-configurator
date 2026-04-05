const hero = document.getElementById('hero');
const openBtn = document.getElementById('openBtn');
const garageGateSound = document.getElementById('garageGateSound');
const sceneChoice = document.getElementById('sceneChoice');
const configShell = document.getElementById('configShell');
const configShellBar = document.getElementById('configShellBar');
const configShellSummary = document.getElementById('configShellSummary');
const configShellPrice = document.getElementById('configShellPrice');
const finalCtaPrice = document.getElementById('finalCtaPrice');
const finalCtaSummary = document.getElementById('finalCtaSummary');
const configBarCta = document.getElementById('configBarCta');
const finalCtaScene = document.getElementById('finalCtaScene');
const configShellViewerStatus = document.getElementById('configShellViewerStatus');
const garage3dViewer = document.getElementById('garage3dViewer');
const typeButtonsRoot = document.getElementById('configTypeButtons');
const typeButtons = typeButtonsRoot ? [...typeButtonsRoot.querySelectorAll('[data-type]')] : [];
const lengthButtonsRoot = document.getElementById('configLengthButtons');
const lengthButtons = lengthButtonsRoot ? [...lengthButtonsRoot.querySelectorAll('[data-length]')] : [];
const colorButtons = [...document.querySelectorAll('.config-shell-color-btn')];
const foundationButtonsRoot = document.getElementById('foundationButtons');
const foundationButtons = foundationButtonsRoot ? [...foundationButtonsRoot.querySelectorAll('[data-foundation]')] : [];
const extrasButtonsRoot = document.getElementById('extrasButtons');
const extrasButtons = extrasButtonsRoot ? [...extrasButtonsRoot.querySelectorAll('[data-extra]')] : [];
const choiceButtons = sceneChoice ? [...sceneChoice.querySelectorAll('[data-garage-option]')] : [];

const PUSH_DELAY_MS = 520;
const SHOW_CHOICE_DELAY_MS = 2000;
const CHOICE_DELAY_MS = 4600;
const RATE_PER_M2 = {
  6: 54000,
  8: 57000
};
const FOUNDATION_RATE_PER_M2 = {
  none: 0,
  pile: 6500,
  strip: 5500,
  slab: 4500
};
const EXTRA_PRICE = {
  automation: 25000,
  electrics: 60000,
  lighting: 15000,
  ventilation: 6000,
  drainage: 25000
};
const MODEL_BY_SIZE = {
  '6x6': '../models/garage_6x6.glb',
  '6x8': '../models/garage_6x8.glb',
  '6x10': '../models/garage_6x10.glb',
  '8x6': '../models/garage_8x6.glb',
  '8x8': '../models/garage_8x8.glb',
  '8x10': '../models/garage_8x10.glb'
};
const WALL_COLOR_PRESETS = {
  sand: {
    label: 'песочный',
    wall: '#d1bc97'
  },
  graphite: {
    label: 'графит',
    wall: '#6a7280'
  },
  grey: {
    label: 'серый',
    wall: '#8a919c'
  }
};
const ROOF_DETAIL_PRESETS = {
  graphite: {
    label: 'графит',
    roofTrim: '#2d3540',
    gate: '#2d3540'
  },
  chocolate: {
    label: 'шоколадный',
    roofTrim: '#4a3428',
    gate: '#4a3428'
  },
  black: {
    label: 'чёрный',
    roofTrim: '#1a1a1a',
    gate: '#1a1a1a'
  }
};
const configuratorState = {
  type: 'single',
  width: 6,
  length: 6,
  wallColorPreset: 'sand',
  roofTrimColorPreset: 'graphite',
  gateColorPreset: 'graphite',
  foundation: 'none',
  extras: {
    automation: false,
    electrics: false,
    lighting: false,
    ventilation: false,
    drainage: false
  }
};
const FOUNDATION_LABELS = {
  none: 'без фундамента',
  pile: 'свайный',
  strip: 'ленточный',
  slab: 'плита'
};
const EXTRA_LABELS = {
  automation: 'автоматика',
  electrics: 'электрика',
  lighting: 'освещение',
  ventilation: 'вентиляция',
  drainage: 'водостоки'
};

function resolveModelKey(width, length) {
  const sizeKey = `${width}x${length}`;
  return MODEL_BY_SIZE[sizeKey] ? sizeKey : null;
}

function updateSummaryLabel() {
  const typeLabel = configuratorState.type === 'double' ? 'Гараж на 2 машины' : 'Гараж на 1 машину';
  const compactTypeLabel = configuratorState.type === 'double' ? '2 машины' : '1 машина';
  const wallLabel = WALL_COLOR_PRESETS[configuratorState.wallColorPreset]?.label || '—';
  const roofTrimLabel = ROOF_DETAIL_PRESETS[configuratorState.roofTrimColorPreset]?.label || '—';
  const foundationLabel = FOUNDATION_LABELS[configuratorState.foundation] || FOUNDATION_LABELS.none;
  const extrasLabel = Object.entries(configuratorState.extras)
    .filter(([, enabled]) => enabled)
    .map(([key]) => EXTRA_LABELS[key])
    .join(', ') || 'без доп. опций';
  const compactSummaryText = `${compactTypeLabel} · ${configuratorState.width}×${configuratorState.length} · ${wallLabel} / ${roofTrimLabel}`;
  const finalSummaryText = `${typeLabel} · ${configuratorState.width} × ${configuratorState.length} м · стены: ${wallLabel} · крыша и детали: ${roofTrimLabel} · фундамент: ${foundationLabel} · ${extrasLabel}`;

  if (configShellSummary) {
    configShellSummary.textContent = compactSummaryText;
  }

  if (finalCtaSummary) {
    finalCtaSummary.textContent = finalSummaryText;
  }
}

function calculateEstimatedPrice() {
  const ratePerM2 = RATE_PER_M2[configuratorState.width] || RATE_PER_M2[6];
  const basePrice = configuratorState.width * configuratorState.length * ratePerM2;
  const foundationRatePerM2 = FOUNDATION_RATE_PER_M2[configuratorState.foundation] ?? 0;
  const foundationPrice = configuratorState.width * configuratorState.length * foundationRatePerM2;
  const extrasPrice = Object.entries(configuratorState.extras)
    .reduce((sum, [key, enabled]) => sum + (enabled ? (EXTRA_PRICE[key] || 0) : 0), 0);
  return basePrice + foundationPrice + extrasPrice;
}

function formatPrice(value) {
  return `от ${new Intl.NumberFormat('ru-RU').format(Math.round(value))} ₽`;
}

function updatePriceLabel() {
  const priceText = formatPrice(calculateEstimatedPrice());
  if (configShellPrice) {
    configShellPrice.textContent = priceText;
  }
  if (finalCtaPrice) {
    finalCtaPrice.textContent = priceText;
  }
}

function refreshBottomBar() {
  updateSummaryLabel();
  updatePriceLabel();
}

function updateLengthButtonState() {
  lengthButtons.forEach((button) => {
    const isActive = Number(button.dataset.length) === configuratorState.length;
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function updateTypeButtonState() {
  typeButtons.forEach((button) => {
    const isActive = button.dataset.type === configuratorState.type;
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function updateColorButtonState() {
  colorButtons.forEach((button) => {
    const group = button.dataset.colorGroup;
    const preset = button.dataset.colorPreset;
    const isActive = (
      (group === 'wall' && preset === configuratorState.wallColorPreset) ||
      (group === 'roofTrim' && preset === configuratorState.roofTrimColorPreset)
    );
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function getActiveColorSet() {
  const wallPreset = WALL_COLOR_PRESETS[configuratorState.wallColorPreset] || WALL_COLOR_PRESETS.sand;
  const roofTrimPreset = ROOF_DETAIL_PRESETS[configuratorState.roofTrimColorPreset] || ROOF_DETAIL_PRESETS.graphite;
  const gatePreset = ROOF_DETAIL_PRESETS[configuratorState.gateColorPreset] || roofTrimPreset;
  return {
    wall: wallPreset.wall,
    roofTrim: roofTrimPreset.roofTrim,
    gate: gatePreset.gate
  };
}

function updateFoundationButtonState() {
  foundationButtons.forEach((button) => {
    const isActive = button.dataset.foundation === configuratorState.foundation;
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function updateExtrasButtonState() {
  extrasButtons.forEach((button) => {
    const key = button.dataset.extra;
    const isActive = Boolean(key && configuratorState.extras[key]);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function createViewerBridge() {
  let runtime = null;
  let activeModel = null;
  let activeParts = { wall: [], roofTrim: [], gate: [] };
  let activeColorSet = getActiveColorSet();
  let latestLoadToken = 0;

  const setStatus = (message) => {
    if (configShellViewerStatus) {
      configShellViewerStatus.textContent = message;
    }
  };

  async function ensureRuntime() {
    if (runtime || !garage3dViewer) return runtime;

    const [THREE, { OrbitControls }, { GLTFLoader }] = await Promise.all([
      import('https://cdn.jsdelivr.net/npm/three@0.160.0/+esm'),
      import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js/+esm'),
      import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js/+esm')
    ]);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f3f4f6');

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(7, 5, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    garage3dViewer.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.autoRotate = false;
    controls.minDistance = 5.5;
    controls.maxDistance = 22;
    controls.minPolarAngle = 0.78;
    controls.maxPolarAngle = 1.36;

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xdbe5e1, 0.8);
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.6);
    keyLight.position.set(8, 9, 7);
    const fillLight = new THREE.DirectionalLight(0xe7efff, 0.4);
    fillLight.position.set(-8, 8, -7);
    scene.add(hemiLight, keyLight, fillLight);

    const loader = new GLTFLoader();
    const resize = () => {
      const width = garage3dViewer.clientWidth;
      const height = garage3dViewer.clientHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    runtime = { THREE, scene, camera, controls, loader, setStatus, resize };
    return runtime;
  }

  function frameModelForMobile(viewer, model) {
    const bounds = new viewer.THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new viewer.THREE.Vector3());
    const maxHorizontal = Math.max(size.x, size.z);
    const vertical = Math.max(size.y, 1);
    const distance = Math.max(maxHorizontal * 1.3, vertical * 1.9, 7.4);
    const eyeY = vertical * 0.5 + distance * 0.2;
    const eyeX = distance * 0.82;
    const eyeZ = distance * 1.03;

    viewer.camera.position.set(eyeX, eyeY, eyeZ);
    viewer.camera.near = 0.1;
    viewer.camera.far = Math.max(120, distance * 18);
    viewer.camera.updateProjectionMatrix();

    viewer.controls.target.set(0, vertical * 0.35, 0);
    viewer.controls.minDistance = distance * 0.72;
    viewer.controls.maxDistance = distance * 1.34;
    viewer.controls.update();
  }

  function collectModelParts(viewer, model) {
    const partMap = { wall: [], roofTrim: [], gate: [] };

    model.traverse((node) => {
      if (!node.isMesh) return;

      const sourceName = `${node.name || ''} ${node.material?.name || ''}`.toLowerCase();

      if (/gate|door|ворот/.test(sourceName)) {
        partMap.gate.push(node);
        return;
      }

      if (/roof|trim|fascia|frame|corner|крыш|кров|добор|обод|угол/.test(sourceName)) {
        partMap.roofTrim.push(node);
        return;
      }

      if (/wall|body|facade|fasad|стен/.test(sourceName)) {
        partMap.wall.push(node);
      }
    });

    if (!partMap.wall.length) {
      model.traverse((node) => {
        if (!node.isMesh) return;
        if (partMap.gate.includes(node) || partMap.roofTrim.includes(node)) return;
        partMap.wall.push(node);
      });
    }

    return partMap;
  }

  function tintMesh(viewer, mesh, color) {
    if (!mesh?.material || !color) return;

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

  function applyColors(viewer, colorSet = activeColorSet) {
    activeColorSet = colorSet;

    activeParts.wall.forEach((mesh) => tintMesh(viewer, mesh, colorSet.wall));
    activeParts.roofTrim.forEach((mesh) => tintMesh(viewer, mesh, colorSet.roofTrim));
    activeParts.gate.forEach((mesh) => tintMesh(viewer, mesh, colorSet.gate));
  }

  async function loadByState() {
    const modelKey = resolveModelKey(configuratorState.width, configuratorState.length);
    if (!modelKey) {
      setStatus('Модель не найдена для выбранного размера');
      return;
    }

    const modelPath = MODEL_BY_SIZE[modelKey];
    const currentToken = ++latestLoadToken;
    const viewer = await ensureRuntime();
    if (!viewer) return;

    setStatus(`Загрузка модели ${modelKey}…`);

    viewer.loader.load(
      modelPath,
      (gltf) => {
        if (currentToken !== latestLoadToken) return;

        if (activeModel) {
          viewer.scene.remove(activeModel);
        }

        const model = gltf.scene;
        const box = new viewer.THREE.Box3().setFromObject(model);
        const center = box.getCenter(new viewer.THREE.Vector3());
        model.position.x -= center.x;
        model.position.z -= center.z;
        model.position.y -= box.min.y;

        activeModel = model;
        viewer.scene.add(model);
        activeParts = collectModelParts(viewer, model);
        applyColors(viewer, activeColorSet);
        frameModelForMobile(viewer, model);
        setStatus(`Модель ${modelKey} загружена`);
      },
      undefined,
      () => {
        if (currentToken !== latestLoadToken) return;
        setStatus(`Ошибка загрузки модели ${modelKey}`);
      }
    );
  }

  async function applyColorsByState() {
    activeColorSet = getActiveColorSet();
    const viewer = await ensureRuntime();
    if (!viewer || !activeModel) return;
    applyColors(viewer, activeColorSet);
  }

  return { loadByState, applyColorsByState };
}

const viewerBridge = createViewerBridge();

if (hero && openBtn) {
  let timers = [];

  openBtn.addEventListener('click', () => {
    if (hero.classList.contains('opening') || hero.classList.contains('pushing') || hero.classList.contains('choice')) {
      return;
    }

    if (garageGateSound) {
      garageGateSound.currentTime = 0;
      garageGateSound.volume = 0.6;
      garageGateSound.play().catch(() => {});
    }

    timers.forEach((timerId) => clearTimeout(timerId));
    timers = [];

    hero.classList.remove('idle');
    hero.classList.add('open', 'opening');
    openBtn.setAttribute('aria-pressed', 'true');

    if (sceneChoice) {
      sceneChoice.setAttribute('aria-hidden', 'true');
    }

    timers.push(setTimeout(() => {
      hero.classList.add('pushing');
    }, PUSH_DELAY_MS));

    timers.push(setTimeout(() => {
      hero.classList.add('show-choice');

      if (sceneChoice) {
        sceneChoice.setAttribute('aria-hidden', 'false');
      }
    }, SHOW_CHOICE_DELAY_MS));

    timers.push(setTimeout(() => {
      hero.classList.remove('opening', 'pushing');
      hero.classList.add('choice');
      openBtn.setAttribute('aria-hidden', 'true');
      openBtn.setAttribute('tabindex', '-1');
    }, CHOICE_DELAY_MS));
  });
}

if (configShell && choiceButtons.length) {
  choiceButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const garageOption = button.dataset.garageOption;
      const isDouble = garageOption === 'two';

      configuratorState.type = isDouble ? 'double' : 'single';
      configuratorState.width = isDouble ? 8 : 6;
      configuratorState.length = 6;

      configShell.hidden = false;
      configShell.setAttribute('aria-hidden', 'false');

      choiceButtons.forEach((choiceButton) => {
        choiceButton.setAttribute('aria-pressed', String(choiceButton === button));
      });

      updateTypeButtonState();
      updateLengthButtonState();
      updateColorButtonState();
      updateFoundationButtonState();
      updateExtrasButtonState();
      refreshBottomBar();

      await viewerBridge.loadByState();
      configShell.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

if (typeButtons.length) {
  typeButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const nextType = button.dataset.type;
      if (!nextType || nextType === configuratorState.type) return;

      const isDouble = nextType === 'double';
      configuratorState.type = isDouble ? 'double' : 'single';
      configuratorState.width = isDouble ? 8 : 6;

      updateTypeButtonState();
      refreshBottomBar();

      await viewerBridge.loadByState();
    });
  });
}

if (lengthButtons.length) {
  lengthButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const nextLength = Number(button.dataset.length);
      if (!nextLength || nextLength === configuratorState.length) return;

      configuratorState.length = nextLength;
      updateLengthButtonState();
      refreshBottomBar();
      await viewerBridge.loadByState();
    });
  });
}

if (colorButtons.length) {
  colorButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const colorGroup = button.dataset.colorGroup;
      const colorPreset = button.dataset.colorPreset;
      if (!colorGroup || !colorPreset) return;

      if (colorGroup === 'wall' && WALL_COLOR_PRESETS[colorPreset]) {
        configuratorState.wallColorPreset = colorPreset;
      } else if (colorGroup === 'roofTrim' && ROOF_DETAIL_PRESETS[colorPreset]) {
        configuratorState.roofTrimColorPreset = colorPreset;
        configuratorState.gateColorPreset = colorPreset;
      } else {
        return;
      }

      updateColorButtonState();
      refreshBottomBar();
      await viewerBridge.applyColorsByState();
    });
  });
}

if (foundationButtons.length) {
  foundationButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextFoundation = button.dataset.foundation;
      if (!nextFoundation || nextFoundation === configuratorState.foundation) return;

      configuratorState.foundation = nextFoundation;
      updateFoundationButtonState();
      refreshBottomBar();
    });
  });
}

if (extrasButtons.length) {
  extrasButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const extraKey = button.dataset.extra;
      if (!extraKey || !(extraKey in configuratorState.extras)) return;

      configuratorState.extras[extraKey] = !configuratorState.extras[extraKey];
      updateExtrasButtonState();
      refreshBottomBar();
    });
  });
}

if (configBarCta && finalCtaScene) {
  configBarCta.addEventListener('click', () => {
    finalCtaScene.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

if (configShellBar && finalCtaScene) {
  const finalSceneObserver = new IntersectionObserver(
    ([entry]) => {
      configShellBar.classList.toggle('is-hidden', entry.isIntersecting);
    },
    {
      threshold: 0.35
    }
  );

  finalSceneObserver.observe(finalCtaScene);
}
