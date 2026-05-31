const root = document.getElementById('garage-mobile-v2-root');
const getById = (id) => (root ? root.querySelector(`#${id}`) : document.getElementById(id));
const queryAll = (selector) => (root ? [...root.querySelectorAll(selector)] : [...document.querySelectorAll(selector)]);

const hero = getById('hero');
const openBtn = getById('openBtn');
const garageGateSound = getById('garageGateSound');
const sceneChoice = getById('sceneChoice');
const configShell = getById('configShell');
const configShellViewport = getById('configShellViewport');
const configShellSummary = getById('configShellSummary');
const finalCtaSummary = getById('finalCtaSummary');
const finalCtaTimeline = getById('finalCtaTimeline');
const configBarCta = getById('configBarCta');
const finalCtaScene = getById('finalCtaScene');
const configShellViewerStatus = getById('configShellViewerStatus');
const garage3dViewer = getById('garage3dViewer');

const typeButtonsRoot = getById('configTypeButtons');
const typeButtons = typeButtonsRoot ? [...typeButtonsRoot.querySelectorAll('[data-type]')] : [];
const lengthButtonsRoot = getById('configLengthButtons');
const lengthButtons = lengthButtonsRoot ? [...lengthButtonsRoot.querySelectorAll('[data-length]')] : [];
const colorButtons = queryAll('.config-shell-color-btn');
const foundationButtonsRoot = getById('foundationButtons');
const foundationButtons = foundationButtonsRoot ? [...foundationButtonsRoot.querySelectorAll('[data-foundation]')] : [];
const extrasButtonsRoot = getById('extrasButtons');
const extrasButtons = extrasButtonsRoot ? [...extrasButtonsRoot.querySelectorAll('[data-extra]')] : [];
const choiceButtons = sceneChoice ? [...sceneChoice.querySelectorAll('[data-garage-option]')] : [];

const SHOW_CHOICE_DELAY_MS = 2000;
const HIDE_OPEN_BUTTON_DELAY_MS = 4600;

const RATE_PER_M2 = {
  6: 34000,
  8: 37000
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
  '6x6': 'https://cdn.jsdelivr.net/gh/bersentox/garage-configurator@main/models/garage_6x6.glb',
  '6x8': 'https://cdn.jsdelivr.net/gh/bersentox/garage-configurator@main/models/garage_6x8.glb',
  '6x10': 'https://cdn.jsdelivr.net/gh/bersentox/garage-configurator@main/models/garage_6x10.glb',
  '8x6': 'https://cdn.jsdelivr.net/gh/bersentox/garage-configurator@main/models/garage_8x6.glb',
  '8x8': 'https://cdn.jsdelivr.net/gh/bersentox/garage-configurator@main/models/garage_8x8.glb',
  '8x10': 'https://cdn.jsdelivr.net/gh/bersentox/garage-configurator@main/models/garage_8x10.glb'
};

const BUILD_TIMELINE_BY_SIZE = {
  '6x6': '7–10 дней',
  '6x8': '8–12 дней',
  '6x10': '10–14 дней',
  '8x6': '8–12 дней',
  '8x8': '10–14 дней',
  '8x10': '12–16 дней'
};

const WALL_COLOR_PRESETS = {
  sand: { label: 'песочный', wall: '#d1bc97' },
  graphite: { label: 'графит', wall: '#6a7280' },
  grey: { label: 'серый', wall: '#8a919c' }
};

const ROOF_DETAIL_PRESETS = {
  graphite: { label: 'графит', roofTrim: '#2d3540', gate: '#2d3540' },
  chocolate: { label: 'шоколадный', roofTrim: '#4a3428', gate: '#4a3428' },
  black: { label: 'чёрный', roofTrim: '#1a1a1a', gate: '#1a1a1a' }
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

function resolveModelKey(width, length) {
  const sizeKey = `${width}x${length}`;
  return MODEL_BY_SIZE[sizeKey] ? sizeKey : null;
}

function getConstructionTimelineLabel(state) {
  const sizeKey = `${state.width}x${state.length}`;
  const timeline = BUILD_TIMELINE_BY_SIZE[sizeKey] || BUILD_TIMELINE_BY_SIZE['6x6'];
  return `Средний срок строительства — ${timeline}`;
}

function calculateEstimatedPrice() {
  const ratePerM2 = RATE_PER_M2[configuratorState.width] || RATE_PER_M2[6];
  const basePrice = configuratorState.width * configuratorState.length * ratePerM2;
  const foundationRatePerM2 = FOUNDATION_RATE_PER_M2[configuratorState.foundation] ?? 0;
  const foundationPrice = configuratorState.width * configuratorState.length * foundationRatePerM2;
  const extrasPrice = Object.entries(configuratorState.extras).reduce((sum, [key, enabled]) => {
    return sum + (enabled ? (EXTRA_PRICE[key] || 0) : 0);
  }, 0);
  return basePrice + foundationPrice + extrasPrice;
}

function updateSummaryLabel() {
  const compactTypeLabel = configuratorState.type === 'double' ? '2 машины' : '1 машина';
  const foundationLabelMap = { none: 'без фундамента', pile: 'свайный', strip: 'ленточный', slab: 'плита' };
  const foundationLabel = foundationLabelMap[configuratorState.foundation] || 'без фундамента';
  const extrasCount = Object.values(configuratorState.extras).filter(Boolean).length;
  const compactSummaryText = `${compactTypeLabel} · ${configuratorState.length} м · ${foundationLabel} · ${extrasCount} опций`;
  const wallLabel = WALL_COLOR_PRESETS[configuratorState.wallColorPreset]?.label || '—';
  const roofTrimLabel = ROOF_DETAIL_PRESETS[configuratorState.roofTrimColorPreset]?.label || '—';
  const finalSummaryText = `${compactTypeLabel} · ${configuratorState.width}×${configuratorState.length} · ${wallLabel} / ${roofTrimLabel}`;

  if (configShellSummary) configShellSummary.textContent = compactSummaryText;
  if (finalCtaSummary) finalCtaSummary.textContent = finalSummaryText;
  if (finalCtaTimeline) finalCtaTimeline.textContent = getConstructionTimelineLabel(configuratorState);

  calculateEstimatedPrice();
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

function refreshControls() {
  updateTypeButtonState();
  updateLengthButtonState();
  updateColorButtonState();
  updateFoundationButtonState();
  updateExtrasButtonState();
  updateSummaryLabel();
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

function setupViewportStickyNormalization() {
  if (!configShell || !configShellViewport) return;

  let rafId = null;

  const applyStickyTopOffset = () => {
    const viewportTop = window.visualViewport ? window.visualViewport.offsetTop : 0;
    configShell.style.setProperty('--config-shell-sticky-top', `${Math.max(0, Math.round(viewportTop))}px`);
  };

  const normalizeStickyState = () => {
    rafId = null;
    const shellRect = configShell.getBoundingClientRect();
    const viewportRect = configShellViewport.getBoundingClientRect();
    const shouldStick = shellRect.top <= 0 && shellRect.bottom > viewportRect.height;
    configShellViewport.classList.toggle('is-stuck', shouldStick);
  };

  const scheduleNormalization = () => {
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(normalizeStickyState);
  };

  applyStickyTopOffset();
  normalizeStickyState();

  window.addEventListener('scroll', scheduleNormalization, { passive: true });
  window.addEventListener('resize', () => {
    applyStickyTopOffset();
    scheduleNormalization();
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      applyStickyTopOffset();
      scheduleNormalization();
    });
    window.visualViewport.addEventListener('scroll', () => {
      applyStickyTopOffset();
      scheduleNormalization();
    });
  }
}

function setupConfigBarVisibility() {
  if (!configShell || !configShellBar) return;

  let rafId = null;

  const updateVisibility = () => {
    rafId = null;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const shellRect = configShell.getBoundingClientRect();
    const finalRect = finalCtaScene ? finalCtaScene.getBoundingClientRect() : null;
    const configStarted = shellRect.top < viewportHeight * 0.72;
    const configNotEnded = shellRect.bottom > viewportHeight * 0.35;
    const finalCtaReached = finalRect ? finalRect.top < viewportHeight * 0.78 : false;
    const shouldShow = configStarted && configNotEnded && !finalCtaReached;

    configShellBar.classList.toggle('is-visible', shouldShow);
  };

  const scheduleUpdate = () => {
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(updateVisibility);
  };

  updateVisibility();
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);

  if (window.visualViewport) {
    window.visualViewport.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.visualViewport.addEventListener('resize', scheduleUpdate);
  }
}

function createViewerBridge() {
  let runtime = null;
  let activeModel = null;
  let activeParts = { wall: [], roofTrim: [], gate: [] };
  let activeColorSet = getActiveColorSet();
  let latestLoadToken = 0;

  const setStatus = (message) => {
    if (configShellViewerStatus) configShellViewerStatus.textContent = message;
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
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controls.minDistance = 5.5;
    controls.maxDistance = 22;
    controls.minPolarAngle = 0.78;
    controls.maxPolarAngle = 1.36;

    const AUTO_ROTATE_RESUME_DELAY_MS = 2400;
    let autoRotateResumeTimer = null;

    const stopAutoRotate = () => {
      controls.autoRotate = false;
      if (autoRotateResumeTimer !== null) {
        window.clearTimeout(autoRotateResumeTimer);
        autoRotateResumeTimer = null;
      }
    };

    const resumeAutoRotateWithDelay = () => {
      if (autoRotateResumeTimer !== null) window.clearTimeout(autoRotateResumeTimer);
      autoRotateResumeTimer = window.setTimeout(() => {
        controls.autoRotate = true;
        autoRotateResumeTimer = null;
      }, AUTO_ROTATE_RESUME_DELAY_MS);
    };

    renderer.domElement.addEventListener('pointerdown', stopAutoRotate, { passive: true });
    renderer.domElement.addEventListener('pointerup', resumeAutoRotateWithDelay, { passive: true });
    renderer.domElement.addEventListener('pointercancel', resumeAutoRotateWithDelay, { passive: true });
    renderer.domElement.addEventListener('touchstart', stopAutoRotate, { passive: true });
    renderer.domElement.addEventListener('touchend', resumeAutoRotateWithDelay, { passive: true });
    renderer.domElement.addEventListener('touchcancel', resumeAutoRotateWithDelay, { passive: true });

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xdbe5e1, 0.8);
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.6);
    keyLight.position.set(8, 9, 7);
    const fillLight = new THREE.DirectionalLight(0xe7efff, 0.4);
    fillLight.position.set(-8, 8, -7);
    scene.add(hemiLight, keyLight, fillLight);

    const loader = new GLTFLoader();

    const resize = () => {
      const width = Math.max(garage3dViewer.clientWidth, 1);
      const height = Math.max(garage3dViewer.clientHeight, 1);
      camera.aspect = width / height;
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

    runtime = { THREE, scene, camera, controls, loader, resize };
    return runtime;
  }

  function frameModelForMobile(viewer, model) {
    const bounds = new viewer.THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new viewer.THREE.Vector3());
    const maxHorizontal = Math.max(size.x, size.z);
    const vertical = Math.max(size.y, 1);
    const distance = Math.max(maxHorizontal * 1.02, vertical * 1.45, 5.8);

    viewer.controls.target.set(0, vertical * 0.42, 0);
    viewer.camera.position.set(distance * 0.62, distance * 0.42, distance * 0.74);
    viewer.camera.near = 0.1;
    viewer.camera.far = distance * 5;
    viewer.camera.updateProjectionMatrix();
    viewer.controls.minDistance = Math.max(distance * 0.38, 3.8);
    viewer.controls.maxDistance = distance * 2.1;
    viewer.controls.update();
    viewer.resize();
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

  function tintMesh(mesh, color) {
    if (!mesh?.material || !color) return;

    const tintMaterial = (material) => {
      const cloned = material.clone();
      if (cloned.color) cloned.color.set(color);
      return cloned;
    };

    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(tintMaterial)
      : tintMaterial(mesh.material);
  }

  function applyColors(colorSet = activeColorSet) {
    activeColorSet = colorSet;
    activeParts.wall.forEach((mesh) => tintMesh(mesh, colorSet.wall));
    activeParts.roofTrim.forEach((mesh) => tintMesh(mesh, colorSet.roofTrim));
    activeParts.gate.forEach((mesh) => tintMesh(mesh, colorSet.gate));
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

        if (activeModel) viewer.scene.remove(activeModel);

        const model = gltf.scene;
        const box = new viewer.THREE.Box3().setFromObject(model);
        const center = box.getCenter(new viewer.THREE.Vector3());
        model.position.x -= center.x;
        model.position.z -= center.z;
        model.position.y -= box.min.y;

        activeModel = model;
        viewer.scene.add(model);
        activeParts = collectModelParts(viewer, model);
        applyColors(getActiveColorSet());
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
    applyColors(activeColorSet);
  }

  return { loadByState, applyColorsByState };
}

const viewerBridge = createViewerBridge();

if (hero && openBtn) {
  let timers = [];

  openBtn.addEventListener('click', () => {
    if (hero.classList.contains('opening') || hero.classList.contains('show-choice')) return;

    if (garageGateSound) {
      garageGateSound.currentTime = 0;
      garageGateSound.volume = 0.6;
      garageGateSound.play().catch(() => {});
    }

    timers.forEach((timerId) => clearTimeout(timerId));
    timers = [];

    hero.classList.remove('idle', 'pushing', 'choice');
    hero.classList.add('open', 'opening');
    openBtn.setAttribute('aria-pressed', 'true');

    if (sceneChoice) sceneChoice.setAttribute('aria-hidden', 'true');

    timers.push(setTimeout(() => {
      hero.classList.remove('pushing', 'choice');
      hero.classList.add('show-choice');
      if (sceneChoice) sceneChoice.setAttribute('aria-hidden', 'false');
    }, SHOW_CHOICE_DELAY_MS));

    timers.push(setTimeout(() => {
      hero.classList.remove('opening', 'pushing', 'choice');
      openBtn.setAttribute('aria-hidden', 'true');
      openBtn.setAttribute('tabindex', '-1');
    }, HIDE_OPEN_BUTTON_DELAY_MS));
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

      refreshControls();
      await viewerBridge.loadByState();
      configShell.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

typeButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const nextType = button.dataset.type;
    if (!nextType || nextType === configuratorState.type) return;

    const isDouble = nextType === 'double';
    configuratorState.type = nextType;
    configuratorState.width = isDouble ? 8 : 6;

    refreshControls();
    await viewerBridge.loadByState();
  });
});

lengthButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const nextLength = Number(button.dataset.length);
    if (!nextLength || nextLength === configuratorState.length) return;

    configuratorState.length = nextLength;

    refreshControls();
    await viewerBridge.loadByState();
  });
});

colorButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const group = button.dataset.colorGroup;
    const preset = button.dataset.colorPreset;
    if (!group || !preset) return;

    if (group === 'wall') {
      configuratorState.wallColorPreset = preset;
    }

    if (group === 'roofTrim') {
      configuratorState.roofTrimColorPreset = preset;
      configuratorState.gateColorPreset = preset;
    }

    refreshControls();
    await viewerBridge.applyColorsByState();
  });
});

foundationButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const nextFoundation = button.dataset.foundation;
    if (!nextFoundation || nextFoundation === configuratorState.foundation) return;

    configuratorState.foundation = nextFoundation;
    refreshControls();
  });
});

extrasButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const extraKey = button.dataset.extra;
    if (!extraKey || !(extraKey in configuratorState.extras)) return;

    configuratorState.extras[extraKey] = !configuratorState.extras[extraKey];
    refreshControls();
  });
});

if (configBarCta && finalCtaScene) {
  configBarCta.addEventListener('click', () => {
    finalCtaScene.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

refreshControls();
setupViewportStickyNormalization();
setupConfigBarVisibility();
viewerBridge.loadByState();
