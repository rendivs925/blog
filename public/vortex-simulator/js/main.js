import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { state, compute, getStatus } from './physics.js';
import { buildScene, updateScene } from './sceneObjects.js';
import { buildVortex, updateVortex } from './vortexLines.js';
import { buildParticles, updateParticles } from './particles.js';
import { buildFields, updateFields } from './fields.js';
import { buildPulse, updatePumpWave, updateGAN } from './dcePulse.js';
import { updateHUD } from './hud.js';
import { setupControls, isPaused } from './controlsUI.js';

const container = document.getElementById('scene-container');
const w = container.clientWidth;
const h = container.clientHeight;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x08080e);

const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 10);
camera.position.set(0.45, 0.28, 0.45);

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setSize(w, h);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
container.appendChild(renderer.domElement);

// Environment: higher quality procedural studio lighting
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment()).texture;
pmrem.dispose();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 0, 0);
controls.minDistance = 0.2;
controls.maxDistance = 1.8;

// Post-processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(w, h),
  0.1, 0.3, 0.2
);
composer.addPass(bloomPass);

const fxaaPass = new ShaderPass(FXAAShader);
fxaaPass.uniforms['resolution'].value.set(1 / w, 1 / h);
composer.addPass(fxaaPass);

// Lighting
const ambient = new THREE.AmbientLight(0x304060, 0.8);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
keyLight.position.set(0.8, 1.5, 1.0);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x6080c0, 0.6);
fillLight.position.set(-0.6, 0.3, -0.8);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0x80a0ff, 0.4);
rimLight.position.set(0, -0.8, 0);
scene.add(rimLight);

// Build systems
buildScene(scene);
buildVortex(scene);
buildParticles(scene);
buildFields(scene);
buildPulse(scene);

setupControls(camera, controls);

const statusEl = document.getElementById('status-text');
statusEl.className = 'status-idle';

const clock = new THREE.Clock();
let simTime = 0;
let perfCounter = 0;

function animate() {
  requestAnimationFrame(animate);

  if (document.hidden) {
    clock.getDelta();
    return;
  }

  const rawDelta = Math.min(clock.getDelta(), 0.05);
  perfCounter++;

  if (!isPaused()) {
    const delta = rawDelta * state.timeScale;
    if (delta > 0) {
      simTime += delta;

      compute();
      updateScene(simTime, delta);
      updateVortex(simTime, delta);
      updateParticles(delta);
      updateGAN(delta);

      if (perfCounter % 2 === 0) updateFields(simTime);

      updatePumpWave();
      updateHUD();

      const status = getStatus();
      statusEl.textContent = status.text;
      statusEl.className = status.cls;
    }
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
  fxaaPass.uniforms['resolution'].value.set(1 / w2, 1 / h2);
});
