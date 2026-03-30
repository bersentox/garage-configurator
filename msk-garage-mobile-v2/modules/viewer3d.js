import * as THREE from "../../msk-garage-mobile/vendor/three/three.module.js";
import { GLTFLoader } from "../../msk-garage-mobile/vendor/three/GLTFLoader.js";

export class Viewer3D {
  constructor(container) {
    this.container = container;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b0d13);

    this.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 200);
    this.camera.position.set(0, 1.9, 6);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.container.append(this.renderer.domElement);

    this.loader = new GLTFLoader();
    this.currentModel = null;

    this.clock = new THREE.Clock();

    this.setupLighting();
    this.resize();
    this.animate = this.animate.bind(this);
    this.onResize = this.onResize.bind(this);
    window.addEventListener("resize", this.onResize);

    this.animate();
  }

  setupLighting() {
    const hemi = new THREE.HemisphereLight(0xdbe5ff, 0x10131a, 0.95);
    hemi.position.set(0, 8, 0);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(4, 6, 5);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0x8db5ff, 0.55);
    fill.position.set(-4, 2, -2);
    this.scene.add(fill);
  }

  async loadModel(url) {
    const gltf = await this.loader.loadAsync(url);

    if (this.currentModel) {
      this.scene.remove(this.currentModel);
    }

    this.currentModel = gltf.scene;
    this.currentModel.position.set(0, -0.9, 0);
    this.currentModel.rotation.set(0, -0.35, 0);
    this.currentModel.scale.setScalar(1.25);
    this.scene.add(this.currentModel);
  }

  animate() {
    requestAnimationFrame(this.animate);

    const elapsed = this.clock.getElapsedTime();
    if (this.currentModel) {
      this.currentModel.rotation.y = -0.35 + Math.sin(elapsed * 0.45) * 0.18;
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
