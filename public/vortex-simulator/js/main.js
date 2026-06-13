import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { PHYS } from './constants.js';
import { state, compute, getStatus } from './physics.js';
import { buildScene, updateScene } from './sceneObjects.js';
import { buildVortex, updateVortex } from './vortexLines.js';
import { buildParticles, updateParticles } from './particles.js';
import { buildFields, updateFields } from './fields.js';
import { buildPulse, updatePulse, checkAndTriggerPulse, updatePumpWave } from './dcePulse.js';
import { updateHUD } from './hud.js';
import { setupControls, isPaused } from './controlsUI.js';

const container = document.getElementById('scene-container');
const w = container.clientWidth;
const h = container.clientHeight;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a1a);
scene.fog = new THREE.Fog(0x0a0a1a, 1.5, 3);

const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 10);
camera.position.set(0.5, 0.3, 0.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);
controls.minDistance = 0.2;
controls.maxDistance = 2;

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(w, h),
  0.25, 0.5, 0.4
);
composer.addPass(bloomPass);

// Lights
const ambient = new THREE.AmbientLight(0x334466, 0.6);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(1, 2, 1);
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0x4488ff, 0.4);
fillLight.position.set(-1, 0, -1);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0x00aaff, 0.3);
rimLight.position.set(0, -1, 0);
scene.add(rimLight);

// Ground grid
const grid = new THREE.GridHelper(1.2, 20, 0x224488, 0x112244);
scene.add(grid);

// Axis helper
const axes = new THREE.AxesHelper(0.3);
scene.add(axes);

// Build systems
buildScene(scene);
buildVortex(scene);
buildParticles(scene);
buildFields(scene);
buildPulse(scene);

// Setup controls after scene is ready
setupControls(camera, controls);

// Status text
const statusEl = document.getElementById('status-text');
statusEl.className = 'status-idle';

const clock = new THREE.Clock();
let pulseTimer = 0;
let perfCounter = 0;

function animate() {
  requestAnimationFrame(animate);

  if (document.hidden) {
    clock.getDelta();
    return;
  }

  const delta = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;
  perfCounter++;

  if (!isPaused()) {
    compute();
    updateScene(time);
    updateVortex(time);
    updateParticles(delta);
    updatePulse();

    // Throttle CPU-heavy field update to every 3rd frame
    if (perfCounter % 3 === 0) updateFields();

    pulseTimer += delta;
    if (pulseTimer > PHYS.DCE_PULSE_INTERVAL) {
      checkAndTriggerPulse(time);
      pulseTimer = 0;
    }

    updatePumpWave();
    updateHUD();

    const status = getStatus();
    statusEl.textContent = status.text;
    statusEl.className = status.cls;
  }

  controls.update();
  composer.render();
}

animate();

window.addEventListener('resize', () => {
  const w2 = container.clientWidth;
  const h2 = container.clientHeight;
  camera.aspect = w2 / h2;
  camera.updateProjectionMatrix();
  renderer.setSize(w2, h2);
  composer.setSize(w2, h2);
});
