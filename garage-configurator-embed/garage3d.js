const GARAGE_MODEL_PATHS = {
  "6x6": "../models/garage_6x6.glb",
  "6x8": "../models/garage_6x8.glb",
  "6x10": "../models/garage_6x10.glb",
  "8x6": "../models/garage_8x6.glb",
  "8x8": "../models/garage_8x8.glb",
  "8x10": "../models/garage_8x10.glb"
};

const THREE_MODULE_CANDIDATES = [
  {
    name: "jsdelivr",
    three: "https://cdn.jsdelivr.net/npm/three@0.160.0/+esm",
    controls: "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js/+esm",
    loader: "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js/+esm"
  },
  {
    name: "esm.sh",
    three: "https://esm.sh/three@0.160.0",
    controls: "https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js",
    loader: "https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js"
  }
];

let threeModulesPromise = null;

function getGarageModelPath(width, length) {
  return GARAGE_MODEL_PATHS[`${width}x${length}`] || null;
}

async function loadThreeModules() {
  if (threeModulesPromise) return threeModulesPromise;

  threeModulesPromise = (async () => {
    const failures = [];

    for (const candidate of THREE_MODULE_CANDIDATES) {
      try {
        const [threeModule, controlsModule, loaderModule] = await Promise.all([
          import(candidate.three),
          import(candidate.controls),
          import(candidate.loader)
        ]);

        const THREE = threeModule;
        const OrbitControls = controlsModule.OrbitControls;
        const GLTFLoader = loaderModule.GLTFLoader;

        if (!THREE || !OrbitControls || !GLTFLoader) {
          throw new Error("Three.js module exports are incomplete");
        }

        return { THREE, OrbitControls, GLTFLoader, source: candidate.name };
      } catch (error) {
        failures.push({ source: candidate.name, error });
      }
    }

    const details = failures
      .map(({ source, error }) => `${source}: ${error?.message || String(error)}`)
      .join("; ");

    throw new Error(`Не удалось загрузить модули Three.js (${details})`);
  })();

  return threeModulesPromise;
}

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

function createViewerStatus(container) {
  container.style.position = "relative";

  const statusMessage = document.createElement("div");
  statusMessage.setAttribute("role", "status");
  statusMessage.style.position = "absolute";
  statusMessage.style.left = "50%";
  statusMessage.style.top = "50%";
  statusMessage.style.transform = "translate(-50%, -50%)";
  statusMessage.style.padding = "12px 14px";
  statusMessage.style.maxWidth = "88%";
  statusMessage.style.borderRadius = "10px";
  statusMessage.style.background = "rgba(15, 23, 42, 0.82)";
  statusMessage.style.color = "#f8fafc";
  statusMessage.style.fontSize = "14px";
  statusMessage.style.lineHeight = "1.35";
  statusMessage.style.textAlign = "center";
  statusMessage.style.zIndex = "3";
  statusMessage.style.pointerEvents = "none";
  statusMessage.style.display = "none";
  container.appendChild(statusMessage);

  return {
    show(message) {
      statusMessage.textContent = message;
      statusMessage.style.display = "block";
    },
    hide() {
      statusMessage.textContent = "";
      statusMessage.style.display = "none";
    },
    remove() {
      statusMessage.remove();
    }
  };
}

function createViewerImpl({ container, status, modules }) {
  const { THREE, OrbitControls, GLTFLoader } = modules;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#f3f4f6");
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(7, 5, 9);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xdbe5e1, 0.8));
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  const keyLight = new THREE.DirectionalLight(0xffffff, 0.6);
  keyLight.position.set(8, 9, 7);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xe7efff, 0.4);
  fillLight.position.set(-8, 8, -7);
  scene.add(fillLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.1;
  controls.enableZoom = true;
  controls.zoomSpeed = 0.7;
  controls.rotateSpeed = 0.85;
  controls.minDistance = 7;
  controls.maxDistance = 18;
  controls.minPolarAngle = 0.75;
  controls.maxPolarAngle = 1.42;

  const loader = new GLTFLoader();
  let animationFrameId = 0;
  let mountedModel = null;
  let destroyed = false;
  let resizeObserver = null;
  let activeModelKey = "";
  let pendingLoadId = 0;
  let activeColors = {};
  const modelRotationSpeed = 0.0007;

  const garageParts = {
    walls: null,
    roof: null,
    gate: null,
    trim: null,
    innerWalls: null
  };

  function centerModel(object3d) {
    const box = new THREE.Box3().setFromObject(object3d);
    const center = box.getCenter(new THREE.Vector3());
    object3d.position.sub(center);
  }

  function frameModel(object3d) {
    const box = new THREE.Box3().setFromObject(object3d);
    const size = box.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    const distance = Math.max(6, maxSize * 1.7);
    camera.position.set(distance * 0.95, distance * 0.35, distance * 1.15);
    camera.near = 0.1;
    camera.far = Math.max(100, distance * 12);
    camera.updateProjectionMatrix();
    controls.target.set(0, 0, 0);
    controls.update();
  }

  function setGarageColor(partName, color) {
    const mesh = garageParts[partName];
    if (!mesh || !color) return;
    cloneAndSetColor(mesh, color);
  }

  function applyColors(colors = {}) {
    activeColors = { ...activeColors, ...colors };
    setGarageColor("walls", colors.wall);
    setGarageColor("roof", colors.roof);
    setGarageColor("trim", colors.trim);
    setGarageColor("gate", colors.gate);
    setGarageColor("innerWalls", colors.interiorWall);
  }

  function disposeModel(model) {
    if (!model) return;
    model.traverse((node) => {
      if (!node.isMesh) return;
      node.geometry?.dispose?.();
      if (Array.isArray(node.material)) {
        node.material.forEach((material) => material?.dispose?.());
      } else {
        node.material?.dispose?.();
      }
    });
  }

  function clearGarageParts() {
    Object.keys(garageParts).forEach((key) => {
      garageParts[key] = null;
    });
  }

  function loadModelBySize(width, length) {
    const nextModelPath = getGarageModelPath(width, length);
    const nextModelKey = `${width}x${length}`;

    if (!nextModelPath) {
      console.error("[Garage3D] Unsupported model size", { width, length });
      status.show("Не удалось подобрать модель для выбранного размера гаража.");
      return;
    }

    if (activeModelKey === nextModelKey && mountedModel) {
      applyColors(activeColors);
      return;
    }

    const loadId = ++pendingLoadId;
    status.show("Загрузка 3D-модели…");

    if (mountedModel) {
      modelGroup.remove(mountedModel);
      disposeModel(mountedModel);
      mountedModel = null;
      clearGarageParts();
    }

    loader.load(
      nextModelPath,
      (gltf) => {
        if (destroyed || loadId !== pendingLoadId) {
          disposeModel(gltf.scene);
          return;
        }

        mountedModel = gltf.scene;
        activeModelKey = nextModelKey;
        modelGroup.rotation.set(0, 0, 0);
        centerModel(mountedModel);
        modelGroup.add(mountedModel);
        frameModel(mountedModel);

        const meshIndex = buildMeshIndex(mountedModel);
        Object.assign(garageParts, detectGarageParts(meshIndex));
        applyColors(activeColors);
        status.hide();
      },
      undefined,
      (error) => {
        if (loadId !== pendingLoadId) return;
        console.error("[Garage3D] Failed to load model", { path: nextModelPath, error });
        status.show("Не удалось загрузить 3D-модель. Проверьте подключение и обновите страницу.");
      }
    );
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
    modelGroup.rotation.y += modelRotationSpeed;
    renderer.render(scene, camera);
  }

  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
  }

  window.addEventListener("resize", resize);
  resize();
  animate();

  return {
    applyColors,
    loadModelBySize,
    destroy() {
      destroyed = true;
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      resizeObserver?.disconnect();
      controls.dispose();
      if (mountedModel) disposeModel(mountedModel);
      renderer.dispose();
      renderer.domElement.remove();
    }
  };
}

export function createGarage3DViewer({ containerId = "garage-3d-viewer" } = {}) {
  const container = document.getElementById(containerId);

  if (!container) {
    return {
      applyColors() {},
      loadModelBySize() {},
      destroy() {}
    };
  }

  const status = createViewerStatus(container);
  status.show("Подготовка 3D-просмотра…");

  let destroyed = false;
  let viewerImpl = null;
  let pendingSize = null;
  let pendingColors = {};

  const api = {
    applyColors(colors = {}) {
      pendingColors = { ...pendingColors, ...colors };
      viewerImpl?.applyColors(colors);
    },
    loadModelBySize(width, length) {
      pendingSize = { width, length };
      viewerImpl?.loadModelBySize(width, length);
    },
    destroy() {
      destroyed = true;
      viewerImpl?.destroy();
      status.remove();
    }
  };

  loadThreeModules()
    .then((modules) => {
      if (destroyed) return;
      console.info("[Garage3D] Three.js modules loaded from", modules.source);
      viewerImpl = createViewerImpl({ container, status, modules });
      if (Object.keys(pendingColors).length) {
        viewerImpl.applyColors(pendingColors);
      }
      if (pendingSize) {
        viewerImpl.loadModelBySize(pendingSize.width, pendingSize.length);
      } else {
        status.hide();
      }
    })
    .catch((error) => {
      if (destroyed) return;
      console.error("[Garage3D] Failed to initialize Three.js", error);
      status.show("Не удалось запустить 3D-просмотр. Проверьте сеть и блокировщики контента.");
    });

  return api;
}
