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
    this.baseCameraDistanceStart = 6;
    this.baseCameraDistanceEnd = 5.2;
    this.baseModelYaw = -0.22;
    this.targetYawOffset = 0;
    this.currentYawOffset = 0;
    this.targetTilt = 0;
    this.currentTilt = 0;
    this.targetZoom = 1;
    this.currentZoom = 1;
    this.interactionInfluence = 0;
    this.lastDragX = 0;
    this.lastDragY = 0;
    this.isDragging = false;
    this.isPinching = false;
    this.lastPinchDistance = 0;

    this.setupLighting();
    this.setupGrounding();
    this.resize();

    this.animate = this.animate.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    window.addEventListener("resize", this.onResize);
    this.attachControls();

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

  attachControls() {
    const el = this.renderer.domElement;
    el.style.touchAction = "none";
    el.addEventListener("pointerdown", this.onPointerDown, { passive: true });
    el.addEventListener("pointermove", this.onPointerMove, { passive: true });
    el.addEventListener("pointerup", this.onPointerUp, { passive: true });
    el.addEventListener("pointercancel", this.onPointerUp, { passive: true });
    el.addEventListener("touchstart", this.onTouchStart, { passive: false });
    el.addEventListener("touchmove", this.onTouchMove, { passive: false });
    el.addEventListener("touchend", this.onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", this.onTouchEnd, { passive: true });
  }

  onPointerDown(event) {
    if (event.pointerType === "touch" && event.isPrimary === false) return;
    this.isDragging = true;
    this.lastDragX = event.clientX;
    this.lastDragY = event.clientY;
    this.interactionInfluence = 1;
  }

  onPointerMove(event) {
    if (!this.isDragging || this.isPinching) return;
    const dx = event.clientX - this.lastDragX;
    const dy = event.clientY - this.lastDragY;
    this.lastDragX = event.clientX;
    this.lastDragY = event.clientY;

    this.targetYawOffset = THREE.MathUtils.clamp(this.targetYawOffset + dx * 0.0042, -0.9, 0.9);
    this.targetTilt = THREE.MathUtils.clamp(this.targetTilt + dy * 0.0018, -0.09, 0.08);
    this.interactionInfluence = 1;
  }

  onPointerUp() {
    this.isDragging = false;
  }

  getTouchDistance(touchA, touchB) {
    return Math.hypot(touchA.clientX - touchB.clientX, touchA.clientY - touchB.clientY);
  }

  onTouchStart(event) {
    if (event.touches.length === 2) {
      this.isPinching = true;
      this.isDragging = false;
      this.lastPinchDistance = this.getTouchDistance(event.touches[0], event.touches[1]);
      this.interactionInfluence = 1;
      event.preventDefault();
    }
  }

  onTouchMove(event) {
    if (event.touches.length !== 2 || !this.isPinching) return;
    const nextDistance = this.getTouchDistance(event.touches[0], event.touches[1]);
    if (this.lastPinchDistance > 0) {
      const pinchRatio = this.lastPinchDistance / nextDistance;
      this.targetZoom = THREE.MathUtils.clamp(this.targetZoom * pinchRatio, 0.88, 1.17);
      this.interactionInfluence = 1;
    }
    this.lastPinchDistance = nextDistance;
    event.preventDefault();
  }

  onTouchEnd(event) {
    if (event.touches.length < 2) {
      this.isPinching = false;
      this.lastPinchDistance = 0;
    }
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
    this.baseCameraDistanceEnd = distance;
    this.baseCameraDistanceStart = distance + 0.75;

    this.lookTargetEnd.set(
      this.boundsCenter.x,
      this.boundsCenter.y + this.boundsSize.y * 0.18,
      this.boundsCenter.z,
    );
    this.lookTargetStart.copy(this.lookTargetEnd).add(new THREE.Vector3(0, this.boundsSize.y * 0.08, 0));

    this.cameraEnd.copy(this.lookTargetEnd).addScaledVector(this.frameDirection, this.baseCameraDistanceEnd);
    this.cameraStart.copy(this.lookTargetStart).addScaledVector(this.frameDirection, this.baseCameraDistanceStart);
  }

  setWakeProgress(progress) {
    this.wakeT = THREE.MathUtils.clamp(progress, 0, 1);
  }

  animate() {
    requestAnimationFrame(this.animate);

    const idle = this.clock.getElapsedTime();
    const easedWake = 1 - Math.pow(1 - this.wakeT, 3);
    const baseDistance = THREE.MathUtils.lerp(this.baseCameraDistanceStart, this.baseCameraDistanceEnd, easedWake);

    this.liveLookTarget.lerpVectors(this.lookTargetStart, this.lookTargetEnd, easedWake);
    this.currentYawOffset = THREE.MathUtils.lerp(this.currentYawOffset, this.targetYawOffset, 0.08);
    this.currentTilt = THREE.MathUtils.lerp(this.currentTilt, this.targetTilt, 0.08);
    this.currentZoom = THREE.MathUtils.lerp(this.currentZoom, this.targetZoom, 0.08);
    this.interactionInfluence = Math.max(0, this.interactionInfluence - 0.018);

    const effectiveDistance = baseDistance * this.currentZoom;
    this.camera.position.copy(this.liveLookTarget).addScaledVector(this.frameDirection, effectiveDistance);
    this.camera.lookAt(this.liveLookTarget);

    this.hemi.intensity = 0.34 + easedWake * 0.5;
    this.key.intensity = 0.28 + easedWake * 0.72;
    this.fill.intensity = 0.18 + easedWake * 0.35;
    this.groundGlow.material.opacity = 0.05 + easedWake * 0.11;

    if (this.currentModel) {
      const idleYaw = Math.sin(idle * 0.19) * 0.018 * (1 - this.interactionInfluence);
      this.modelRoot.rotation.y = this.baseModelYaw + this.currentYawOffset + idleYaw;
      this.modelRoot.rotation.x = this.currentTilt;
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
    const el = this.renderer.domElement;
    el.removeEventListener("pointerdown", this.onPointerDown);
    el.removeEventListener("pointermove", this.onPointerMove);
    el.removeEventListener("pointerup", this.onPointerUp);
    el.removeEventListener("pointercancel", this.onPointerUp);
    el.removeEventListener("touchstart", this.onTouchStart);
    el.removeEventListener("touchmove", this.onTouchMove);
    el.removeEventListener("touchend", this.onTouchEnd);
    el.removeEventListener("touchcancel", this.onTouchEnd);
    this.renderer.dispose();
  }
}
