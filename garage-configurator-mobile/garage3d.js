import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/+esm";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js/+esm";

function clampPixelRatio() {
  return Math.min(window.devicePixelRatio || 1, 1.5);
}

function createMaterial(color) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.12 });
}

export function createGarage3DViewer({ containerId = "garage-3d-viewer" } = {}) {
  const container = document.getElementById(containerId);
  if (!container) return { applyColors() {}, loadModelBySize() {}, destroy() {} };

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#dfe7ef");
  scene.fog = new THREE.Fog("#dfe7ef", 12, 24);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(6.5, 4.4, 8.4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "low-power" });
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
  controls.target.set(0, 1.2, 0);

  const ambient = new THREE.HemisphereLight(0xffffff, 0x8ea0b6, 1.15);
  scene.add(ambient);
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
  keyLight.position.set(6, 9, 7);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xcad8ea, 0.55);
  fillLight.position.set(-4, 5, -5);
  scene.add(fillLight);

  const ground = new THREE.Mesh(
    new THREE.CylinderGeometry(7, 7.6, 0.22, 48),
    new THREE.MeshStandardMaterial({ color: "#cfd8e2", roughness: 1, metalness: 0 })
  );
  ground.position.y = -0.12;
  scene.add(ground);

  const garageGroup = new THREE.Group();
  scene.add(garageGroup);

  const walls = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.55, 4.4), createMaterial("#7a818b"));
  walls.position.y = 1.3;
  garageGroup.add(walls);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.55, 1.1, 4), createMaterial("#3f4651"));
  roof.rotation.y = Math.PI * 0.25;
  roof.position.y = 3.02;
  roof.scale.set(1.3, 1, 1.55);
  garageGroup.add(roof);

  const gate = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.7, 0.12), createMaterial("#5d6674"));
  gate.position.set(0, 0.92, 2.24);
  garageGroup.add(gate);

  const trim = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.14, 4.55), createMaterial("#191f29"));
  trim.position.y = 2.54;
  garageGroup.add(trim);

  const innerWalls = new THREE.Mesh(new THREE.BoxGeometry(4.1, 2.2, 3.85), createMaterial("#d7dde5"));
  innerWalls.position.y = 1.28;
  innerWalls.visible = false;
  garageGroup.add(innerWalls);

  const footing = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.18, 4.8), createMaterial("#98a3b1"));
  footing.position.y = 0.02;
  garageGroup.add(footing);

  let currentSize = { width: 6, length: 6 };
  let frameId = 0;
  let destroyed = false;
  let resizeObserver = null;

  function updateGeometry(width, length) {
    currentSize = { width, length };
    const widthScale = width / 6;
    const lengthScale = length / 6;

    walls.scale.set(widthScale, 1, Math.min(lengthScale, 2));
    trim.scale.set(widthScale, 1, Math.min(lengthScale, 2));
    footing.scale.set(widthScale, 1, Math.min(lengthScale, 2));
    innerWalls.scale.set(Math.max(0.9, widthScale * 0.92), 1, Math.max(0.9, Math.min(lengthScale, 2) * 0.92));
    roof.scale.set(1.3 * widthScale, 1, 1.55 * Math.min(lengthScale, 2));

    const gateWidth = width >= 8 ? 2.9 : 1.7;
    gate.geometry.dispose();
    gate.geometry = new THREE.BoxGeometry(gateWidth, 1.7, 0.12);
    gate.position.set(0, 0.92, 2.24 * Math.min(lengthScale, 2));

    controls.target.set(0, 1.25, 0);
  }

  function applyColors(colors = {}) {
    if (colors.wall) walls.material.color.set(colors.wall);
    if (colors.roof) roof.material.color.set(colors.roof);
    if (colors.gate) gate.material.color.set(colors.gate);
    if (colors.trim) trim.material.color.set(colors.trim);
    if (colors.interiorWall) innerWalls.material.color.set(colors.interiorWall);
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
    garageGroup.rotation.y += 0.0022;
    controls.update();
    renderer.render(scene, camera);
  }

  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
  }

  window.addEventListener("resize", resize);
  updateGeometry(currentSize.width, currentSize.length);
  resize();
  animate();

  return {
    applyColors,
    loadModelBySize(width, length) {
      updateGeometry(width, length);
    },
    destroy() {
      destroyed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      resizeObserver?.disconnect();
      controls.dispose();
      renderer.dispose();
      container.contains(renderer.domElement) && renderer.domElement.remove();
      [walls, roof, gate, trim, innerWalls, footing, ground].forEach((mesh) => {
        mesh.geometry?.dispose?.();
        mesh.material?.dispose?.();
      });
    }
  };
}
