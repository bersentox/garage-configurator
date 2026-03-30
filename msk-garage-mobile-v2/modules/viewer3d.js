import * as THREE from "../../msk-garage-mobile/vendor/three/three.module.js";
import { GLTFLoader } from "../../msk-garage-mobile/vendor/three/GLTFLoader.js";

export class Viewer3D {
  constructor(container) {
    this.container = container;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 250);
    this.cameraStart = new THREE.Vector3(0, 2.05, 5.95);
    this.cameraEnd = new THREE.Vector3(0, 1.86, 5.32);
    this.lookTargetStart = new THREE.Vector3(0, -0.2, 0);
    this.lookTargetEnd = new THREE.Vector3(0, -0.35, 0);
    this.camera.position.copy(this.cameraStart);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x000000, 0);
    this.container.append(this.renderer.domElement);

    this.loader = new GLTFLoader();
    this.currentModel = null;
    this.modelRoot = new THREE.Group();
    this.scene.add(this.modelRoot);

    this.clock = new THREE.Clock();
    this.wakeT = 0;
    this.boundsBox = new THREE.Box3();
    this.boundsSize = new THREE.Vector3();
    this.boundsCenter = new THREE.Vector3();
    this.liveLookTarget = new THREE.Vector3();
    this.frameDirection = new THREE.Vector3(0.04, 0.09, 1).normalize();

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
    this.groundGlow.position.set(0, -1.12, 0.15);
    this.scene.add(this.groundGlow);
  }

  async loadModel(url) {
    const gltf = await this.loader.loadAsync(url);

    this.modelRoot.clear();

    this.currentModel = gltf.scene;
    this.currentModel.rotation.set(0, 0, 0);
    this.currentModel.scale.setScalar(1);
    this.currentModel.position.set(0, 0, 0);

    this.boundsBox.setFromObject(this.currentModel);
    this.boundsBox.getCenter(this.boundsCenter);
    this.boundsBox.getSize(this.boundsSize);

    this.currentModel.position.x -= this.boundsCenter.x;
    this.currentModel.position.z -= this.boundsCenter.z;
    this.currentModel.position.y -= this.boundsBox.min.y;

    const dominantSpan = Math.max(this.boundsSize.x, this.boundsSize.z);
    const targetSpan = 3.8;
    const scale = dominantSpan > 0 ? targetSpan / dominantSpan : 1;
    this.currentModel.scale.setScalar(scale);

    this.modelRoot.add(this.currentModel);
    this.modelRoot.position.set(0, -1.12, 0);
    this.modelRoot.rotation.set(0, -0.22, 0);

    this.refreshFraming();
  }

  refreshFraming() {
    this.boundsBox.setFromObject(this.modelRoot);
    this.boundsBox.getCenter(this.boundsCenter);
    this.boundsBox.getSize(this.boundsSize);

    const halfVerticalFov = THREE.MathUtils.degToRad(this.camera.fov * 0.5);
    const fitHeightDistance = (this.boundsSize.y * 0.5) / Math.tan(halfVerticalFov);
    const fitWidthDistance = (this.boundsSize.x * 0.5) / (Math.tan(halfVerticalFov) * this.camera.aspect);
    const distance = Math.max(fitHeightDistance, fitWidthDistance) * 1.3;

    this.lookTargetEnd.set(
      this.boundsCenter.x,
      this.boundsCenter.y + this.boundsSize.y * 0.18,
      this.boundsCenter.z,
    );
    this.lookTargetStart.copy(this.lookTargetEnd).add(new THREE.Vector3(0, this.boundsSize.y * 0.08, 0));

    this.cameraEnd.copy(this.lookTargetEnd).addScaledVector(this.frameDirection, distance);
    this.cameraStart.copy(this.lookTargetStart).addScaledVector(this.frameDirection, distance + 0.75);
  }

  setWakeProgress(progress) {
    this.wakeT = THREE.MathUtils.clamp(progress, 0, 1);
  }

  animate() {
    requestAnimationFrame(this.animate);

    const idle = this.clock.getElapsedTime();
    const easedWake = 1 - Math.pow(1 - this.wakeT, 3);

    this.camera.position.lerpVectors(this.cameraStart, this.cameraEnd, easedWake);
    this.liveLookTarget.lerpVectors(this.lookTargetStart, this.lookTargetEnd, easedWake);
    this.camera.lookAt(this.liveLookTarget);

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
    if (this.currentModel) {
      this.refreshFraming();
    }
  }

  onResize() {
    this.resize();
  }

  destroy() {
    window.removeEventListener("resize", this.onResize);
    this.renderer.dispose();
  }
}
