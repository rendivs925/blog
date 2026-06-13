import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';
import { burstParticles } from './particles.js';

let sceneRef = null;
let pumpRing;

// GAN pulse state machine
// Discrete abrupt-state transitions (no smooth sine)
const G_IDLE = 0;
const G_FLASH = 1;
const G_HOLD = 2;
const G_OFF = 3;
const G_AFTER = 4;

let ganState = G_IDLE;
let ganTimer = 0;
const GAN_STATE_TIME = [999, 0.04, 0.18, 0.03, 0.15];
const COLOR_SLOT = [0x44ddff, 0xdd88ff, 0xff8844];

// Pulse visual geometry
let pulseGroup = null;
let ganWeb;
let timeAccum = 0;

export function buildPulse(scene) {
  sceneRef = scene;

  const pumpMat = new THREE.MeshBasicMaterial({
    color: 0x4488bb,
    transparent: true,
    opacity: 0.04,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  pumpRing = new THREE.Mesh(
    new THREE.RingGeometry(0.005, 0.12, 64),
    pumpMat
  );
  pumpRing.rotation.x = -Math.PI / 2;
  pumpRing.position.y = 0;
  scene.add(pumpRing);

  // GAN web/plasma filament structure (3 intersecting rings)
  const webMat = new THREE.MeshBasicMaterial({
    color: 0x8866ee,
    transparent: true,
    opacity: 0,
    wireframe: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  ganWeb = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.03, 0.001, 8, 24),
      webMat.clone()
    );
    ring.rotation.x = Math.PI / 3 + i * Math.PI / 3;
    ring.rotation.y = i * Math.PI * 0.4;
    ganWeb.add(ring);
  }
  ganWeb.position.y = 0;
  scene.add(ganWeb);
}

function triggerGANPulse() {
  if (state.pulseActive) return;
  if (!sceneRef) return;

  state.ganSlot = Math.floor(Math.random() * 3);
  state.ganGenerator = 0;
  state.ganDiscriminator *= 0.65;
  state.ganMembraneFlash = 1;
  state.ganMembraneStress = 1;
  state.ganTransition = 1;
  state.pulseActive = true;
  state.pulsePhase = 0;
  state.pulseSnap = 1;
  state.pulseEnergyRelease = Math.min(250, state.P_harvest * 0.2 + 30);

  pulseGroup = new THREE.Group();

  const slotCol = COLOR_SLOT[state.ganSlot];
  const sphereMat = new THREE.MeshBasicMaterial({
    color: slotCol,
    transparent: true, opacity: 0.6,
    wireframe: true, blending: THREE.AdditiveBlending,
  });
  const sphereGeo = new THREE.SphereGeometry(0.008, 16, 16);
  const s1 = new THREE.Mesh(sphereGeo, sphereMat);
  s1.position.y = 0.025;
  pulseGroup.add(s1);
  const s2 = new THREE.Mesh(sphereGeo.clone(), sphereMat.clone());
  s2.position.y = -0.025;
  pulseGroup.add(s2);

  const ringMat = new THREE.MeshBasicMaterial({
    color: slotCol,
    transparent: true, opacity: 0.5,
    side: THREE.DoubleSide, depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.003, 0.01, 48), ringMat
  );
  ring.rotation.x = -Math.PI / 2;
  pulseGroup.add(ring);

  const flashMat = new THREE.MeshBasicMaterial({
    color: slotCol,
    transparent: true, opacity: 1,
    blending: THREE.AdditiveBlending,
  });
  const flash = new THREE.Mesh(new THREE.SphereGeometry(0.005, 12, 12), flashMat);
  pulseGroup.add(flash);

  const flashLight = new THREE.PointLight(slotCol, 0, 0.5);
  pulseGroup.add(flashLight);

  sceneRef.add(pulseGroup);
  burstParticles(400);
}

export function updateGAN(delta) {
  if (!sceneRef) return;
  timeAccum += delta;

  const vs = state.vortexStability;
  const di = state.dceIntensity;

  if (ganState === G_IDLE) {
    state.ganGenerator += delta * (di * PHYS.GAN_ACCUM_RATE + 0.1);
    state.ganDiscriminator += (0.8 + di * PHYS.GAN_DISC_LEARN - state.ganDiscriminator) * delta * 2;
    state.ganGenerator = Math.min(state.ganGenerator, 2);
    state.ganMembraneStress = Math.min(1, state.ganGenerator / (state.ganDiscriminator + 0.01));

    const noise = (Math.random() - 0.5) * PHYS.GAN_NOISE;
    if (state.ganGenerator > state.ganDiscriminator + noise && vs > 0.1 && !state.pulseActive) {
      ganState = G_FLASH;
      ganTimer = 0;
      triggerGANPulse();
    }
  } else {
    ganTimer += delta;
    if (ganTimer > GAN_STATE_TIME[ganState]) {
      ganTimer = 0;
      ganState = (ganState + 1) % 5;

      if (ganState === G_HOLD) {
        state.ganTransition = 1;
        state.pulseSnap = 1;
      } else if (ganState === G_OFF) {
        state.ganTransition = 0;
        state.pulseSnap = 0;
        state.pulseActive = false;
      } else if (ganState === G_AFTER) {
        state.ganMembraneFlash = 0;
      } else if (ganState === G_IDLE) {
        // FULL cleanup: remove + dispose pulse group at end of cycle
        if (pulseGroup) {
          sceneRef.remove(pulseGroup);
          pulseGroup.children.forEach(c => {
            if (c.geometry) c.geometry.dispose();
            if (c.material) c.material.dispose();
          });
          pulseGroup = null;
        }
        state.ganMembraneStress = 0;
      }
    }

    if (ganState === G_FLASH || ganState === G_HOLD) {
      state.pulseActive = true;
      state.pulseSnap = 1;
    }

    state.pulsePhase = Math.min(ganTimer / GAN_STATE_TIME[ganState], 1);
    state.ganMembraneFlash = ganState === G_FLASH ? 1 :
      ganState === G_HOLD ? 0.5 :
      ganState === G_OFF ? 0.8 : 0.1;
  }

  // Pulse visuals: persist through FLASH + HOLD (visible), + OFF + AFTER (fading)
  if (pulseGroup) {
    if (ganState === G_FLASH) {
      const t = Math.min(ganTimer / GAN_STATE_TIME[G_FLASH], 1);
      const s = 1 + t * 6;
      pulseGroup.children[0].scale.set(s, s, s);
      pulseGroup.children[0].material.opacity = 0.6 * (1 - t * 0.5);
      pulseGroup.children[1].scale.set(s * 0.85, s * 0.85, s * 0.85);
      pulseGroup.children[1].material.opacity = 0.4 * (1 - t * 0.5);
      const ringScale = 1 + t * 5;
      pulseGroup.children[2].scale.set(ringScale, ringScale, 1);
      pulseGroup.children[2].material.opacity = 0.5;
      pulseGroup.children[3].scale.setScalar(1 + t * 8);
      pulseGroup.children[3].material.opacity = 1 - t * 0.5;
      pulseGroup.children[4].intensity = 1 - t * 0.5;
    } else if (ganState === G_HOLD) {
      pulseGroup.children[0].material.opacity = 0.3;
      pulseGroup.children[1].material.opacity = 0.2;
      pulseGroup.children[2].material.opacity = 0.4;
      pulseGroup.children[3].material.opacity = 0.5;
      pulseGroup.children[4].intensity = 0.5;
    } else if (ganState === G_OFF) {
      // Snap off visual persists through G_OFF duration
      pulseGroup.children.forEach((c, i) => {
        if (c.material) c.material.opacity = 0;
      });
      pulseGroup.children[4].intensity = 0;
    } else if (ganState === G_AFTER) {
      // Group still in scene but invisible, will be removed at G_IDLE
      pulseGroup.children.forEach((c, i) => {
        if (c.material) c.material.opacity = 0;
      });
      pulseGroup.children[4].intensity = 0;
    }
  }

  // GAN web/plasma filaments
  const webOp = Math.min(1, state.ganMembraneStress * 0.6 + state.pulseSnap * 0.5);
  ganWeb.children.forEach((ring, i) => {
    ring.material.opacity = webOp * 0.2;
    const rhythm = (Math.sin(timeAccum * 2 + i * 2) * 0.5 + 0.5) * webOp * 0.3;
    ring.material.color.setHSL(0.72 + state.pulseSnap * 0.1 - i * 0.05, 0.5, 0.3 + rhythm);
    ring.scale.setScalar(1 + state.ganMembraneFlash * 0.2);
    ring.rotation.z += delta * (0.5 + state.pulseSnap * 2);
  });
}

export function updatePumpWave() {
  const vs = state.vortexStability;
  const be = state.backEmf;
  const genNorm = Math.min(1, state.ganGenerator / (state.ganDiscriminator + 0.01));
  const t = performance.now() * 0.001;
  pumpRing.material.opacity = 0.02 + vs * 0.08 + be * 0.06 + genNorm * 0.12;
  const scale = 1 + vs * Math.sin(t * 3 + be * 5) * (0.12 + be * 0.08) + genNorm * 0.1;
  pumpRing.scale.set(scale, 1, 1 + vs * Math.cos(t * 3 + be * 5) * (0.12 + be * 0.08) + genNorm * 0.1);
}
