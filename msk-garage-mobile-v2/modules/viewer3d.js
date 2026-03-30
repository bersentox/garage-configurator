import * as THREE from "../../msk-garage-mobile/vendor/three/three.module.js";
import { GLTFLoader } from "../../msk-garage-mobile/vendor/three/GLTFLoader.js";

export class Viewer3D {
  constructor(container) {
    this.container = container;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b0d10);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 250);
    this.cameraStart = new THREE.Vector3(0, 2.18, 6.9);
    this.cameraEnd = new THREE.Vector3(0, 1.95, 6.12);
    this.camera.position.copy(this.cameraStart);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.append(this.renderer.domElement);

    this.loader = new GLTFLoader();
    this.currentModel = null;

    this.clock = new THREE.Clock();
    this.wakeT = 0;

    this.setupLighting();
    this.setupGrounding();
    this.resize();

    this.animate = this.animate.bind(this);
    this.onResize = this.onResize.bind(this);
    window.addEventListener("resize", this.onResize);

    this.animate();
  }

  setupLighting() {
    this.hemi = new THREE.HemisphereLight(0xc4d8ec, 0x090c12, 0.34);
    this.hemi.position.set(0, 9, 0);
    this.scene.add(this.hemi);

    this.key = new THREE.DirectionalLight(0xd8e8f5, 0.28);
    this.key.position.set(4.5, 5.2, 4.2);
    this.scene.add(this.key);

    this.fill = new THREE.DirectionalLight(0x9cb6ce, 0.18);
    this.fill.position.set(-4, 1.8, -2.3);
    this.scene.add(this.fill);
  }

  setupGrounding() {
    const geometry = new THREE.CircleGeometry(6.5, 64);
    const material = new THREE.MeshBasicMaterial({
      color: 0x90a8bf,
      transparent: true,
      opacity: 0.05,
    });

    this.groundGlow = new THREE.Mesh(geometry, material);
    this.groundGlow.rotation.x = -Math.PI / 2;
    this.groundGlow.position.set(0, -1.08, 0.2);
    this.scene.add(this.groundGlow);
  }

  async loadModel(url) {
    const gltf = await this.loader.loadAsync(url);

    if (this.currentModel) {
      this.scene.remove(this.currentModel);
    }

    this.currentModel = gltf.scene;
    this.currentModel.position.set(0, -0.95, -0.08);
    this.currentModel.rotation.set(0, -0.34, 0);
    this.currentModel.scale.setScalar(1.24);
    this.scene.add(this.currentModel);
  }

  setWakeProgress(progress) {
    this.wakeT = THREE.MathUtils.clamp(progress, 0, 1);
  }

  animate() {
    requestAnimationFrame(this.animate);

    const idle = this.clock.getElapsedTime();
    const easedWake = 1 - Math.pow(1 - this.wakeT, 3);

    this.camera.position.lerpVectors(this.cameraStart, this.cameraEnd, easedWake);

    this.hemi.intensity = 0.34 + easedWake * 0.5;
    this.key.intensity = 0.28 + easedWake * 0.72;
    this.fill.intensity = 0.18 + easedWake * 0.35;
    this.groundGlow.material.opacity = 0.05 + easedWake * 0.11;

    if (this.currentModel) {
      const settledYaw = -0.34 + easedWake * 0.05;
      const idleYaw = Math.sin(idle * 0.23) * 0.02;
      this.currentModel.rotation.y = settledYaw + idleYaw;
    }

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  onResize() {
    this.resize();
  }

  destroy() {
    window.removeEventListener("resize", this.onResize);
    this.renderer.dispose();
  }
}
