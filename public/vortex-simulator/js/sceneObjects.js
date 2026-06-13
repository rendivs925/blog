import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

const group = new THREE.Group();
let topDisc, bottomDisc, coil, coilGlow, liftArrow, core, bFieldGlow, bFieldGlow2;
let initialized = false;

export function buildScene(scene) {
  const R = PHYS.R_DISC;
  const off = PHYS.DISC_OFFSET;

  // --- Discs: machined titanium ---
  const discGeo = new THREE.CylinderGeometry(R, R, PHYS.H_DISC, 48);
  const discMat = new THREE.MeshPhysicalMaterial({
    color: 0x8898a8,
    metalness: 0.95,
    roughness: 0.15,
    envMapIntensity: 1.2,
    clearcoat: 0.1,
    clearcoatRoughness: 0.3,
  });

  topDisc = new THREE.Mesh(discGeo, discMat);
  topDisc.position.y = off;
  bottomDisc = new THREE.Mesh(discGeo.clone(), discMat.clone());
  bottomDisc.position.y = -off;
  group.add(topDisc);
  group.add(bottomDisc);

  // --- Halbach magnets: ultra-realistic N52 NdFeB ---
  // Real N52 magnets have a dark warm-gray sintered body
  // with a glossy epoxy coating giving subtle reflections
  const magMat = new THREE.MeshPhysicalMaterial({
    color: 0x2a2825,
    metalness: 0.6,
    roughness: 0.5,
    clearcoat: 0.25,
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.6,
  });
  const magGeo = new THREE.BoxGeometry(PHYS.MAGNET_W, PHYS.MAGNET_H, PHYS.MAGNET_D);
  const poleGeo = new THREE.SphereGeometry(0.002, 8, 8);
  const nMat = new THREE.MeshBasicMaterial({ color: 0xcc3333 });
  const sMat = new THREE.MeshBasicMaterial({ color: 0x3355cc });

  for (let i = 0; i < PHYS.MAGNET_COUNT; i++) {
    const angle = (i / PHYS.MAGNET_COUNT) * Math.PI * 2;
    const mag = new THREE.Mesh(magGeo, magMat);
    mag.position.set(PHYS.MAGNET_RADIUS * Math.cos(angle), 0, PHYS.MAGNET_RADIUS * Math.sin(angle));
    mag.rotation.y = -angle;
    const pole = new THREE.Mesh(poleGeo, i % 2 === 0 ? nMat : sMat);
    pole.position.set(0, PHYS.MAGNET_H / 2 + 0.001, 0);
    mag.add(pole);
    topDisc.add(mag);
  }

  for (let i = 0; i < PHYS.MAGNET_COUNT; i++) {
    const angle = (i / PHYS.MAGNET_COUNT) * Math.PI * 2 + Math.PI / PHYS.MAGNET_COUNT;
    const mag = new THREE.Mesh(magGeo.clone(), magMat);
    mag.position.set(PHYS.MAGNET_RADIUS * Math.cos(angle), 0, PHYS.MAGNET_RADIUS * Math.sin(angle));
    mag.rotation.y = -angle;
    const pole = new THREE.Mesh(poleGeo, i % 2 === 0 ? sMat : nMat);
    pole.position.set(0, -PHYS.MAGNET_H / 2 - 0.001, 0);
    mag.add(pole);
    bottomDisc.add(mag);
  }

  // --- Harvest coil: ultra-realistic copper ---
  // Copper has a warm orange-red metallic tone with
  // anisotropic reflections from drawn/wound wire
  const coilMat = new THREE.MeshPhysicalMaterial({
    color: 0xdd8840,
    metalness: 1.0,
    roughness: 0.12,
    envMapIntensity: 1.0,
    clearcoat: 0.05,
    anisotropy: 0.5,
    anisotropyRotation: Math.PI / 2,
  });
  coil = new THREE.Mesh(
    new THREE.TorusGeometry(PHYS.COIL_RADIUS, PHYS.COIL_TUBE, 24, 48),
    coilMat
  );
  coil.rotation.x = Math.PI / 2;
  group.add(coil);

  coilGlow = new THREE.PointLight(0xff8800, 0, 0.3);
  coilGlow.position.y = 0;
  group.add(coilGlow);

  // --- Magnetic field glow halo ---
  // Represents the Halbach-concentrated field extending from the disc
  // A faint double-donut shape showing the flux lines
  const bFieldMat = new THREE.MeshBasicMaterial({
    color: 0x4488cc,
    transparent: true,
    opacity: 0.04,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const bFieldGeo = new THREE.TorusGeometry(R * 0.95, 0.003, 16, 48);
  bFieldGlow = new THREE.Mesh(bFieldGeo, bFieldMat);
  bFieldGlow.position.y = off + 0.005;
  group.add(bFieldGlow);

  bFieldGlow2 = new THREE.Mesh(bFieldGeo.clone(), bFieldMat.clone());
  bFieldGlow2.position.y = -off - 0.005;
  group.add(bFieldGlow2);

  // --- Convergence core ---
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x66ccff,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
  });
  core = new THREE.Mesh(new THREE.SphereGeometry(0.005, 16, 16), coreMat);
  core.position.y = 0;
  group.add(core);

  // --- Lift arrow ---
  liftArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, -0.35, 0),
    0.04, 0x50a080, 0.05, 0.025
  );
  group.add(liftArrow);

  scene.add(group);
  initialized = true;
}

export function updateScene(time) {
  if (!initialized) return;

  const visRPM = Math.min(state.RPM, 3000);
  const visOmega = 2 * Math.PI * visRPM / 60;
  topDisc.rotation.y += visOmega * 0.016;
  bottomDisc.rotation.y -= visOmega * 0.016;

  const vs = state.vortexStability;
  const be = state.backEmf;

  // Coil appearance from harvest power
  const powerRatio = Math.min(1, state.P_harvest / 50000);
  const hue = 0.08 - powerRatio * 0.06;
  const sat = 0.6 + powerRatio * 0.3;
  const lit = 0.35 + powerRatio * 0.25;
  coil.material.color.setHSL(hue, sat, lit);

  // Back-EMF coil flicker
  const emfFlicker = 1 + (0.5 + 0.5 * Math.sin(time * 50 + be * 15)) * be * 0.4;
  coil.material.emissive = new THREE.Color(0xff8800);
  coil.material.emissiveIntensity = powerRatio * 2 * emfFlicker;
  coilGlow.intensity = powerRatio * 1.5 * emfFlicker;

  // B-field halo: glows with magnetic field strength and rotation
  const bNorm = Math.min(1, state.B_eff / 2);
  const bPulse = 0.5 + 0.5 * Math.sin(time * visOmega * 0.1 + be * 3);
  bFieldGlow.material.opacity = 0.02 + bNorm * 0.06 * bPulse;
  bFieldGlow.material.color.setHSL(0.58 - bNorm * 0.04, 0.5, 0.3 + bNorm * 0.3);
  bFieldGlow.rotation.y = time * visOmega * 0.5;
  bFieldGlow2.material.opacity = (0.02 + bNorm * 0.06 * bPulse) * 0.5;
  bFieldGlow2.material.color.copy(bFieldGlow.material.color);

  // Lift arrow
  const liftMag = Math.min(state.F_lift / 50, 1);
  liftArrow.setLength(0.04 + liftMag * 0.35, 0.05, 0.025);
  liftArrow.setColor(new THREE.Color(0x50a080).lerp(new THREE.Color(0xc08040), liftMag));

  // --- Convergence core ---
  const pulseCav = state.pulseActive
    ? Math.sin(state.pulsePhase * Math.PI) * 0.8
    : 0;
  const pulseSnap = state.pulseActive
    ? Math.sin(state.pulsePhase * Math.PI * 2) * 0.3 * (1 - state.pulsePhase)
    : 0;

  const beShimmer = Math.sin(time * 35 + be * 12) * be * 0.25;
  const beThrob = (0.5 + 0.5 * Math.sin(time * 8 + be * 20)) * be * 0.35;

  core.material.opacity = Math.min(1, 0.1 + vs * 0.4 + pulseCav * 0.4 + beShimmer * 0.1);

  const baseScale = 0.5 + vs * 1.5 + Math.sin(time * 5) * vs * 0.15;
  core.scale.setScalar(Math.max(0.1, baseScale + pulseCav * 2.5 + pulseSnap * 1.5 + beThrob * 0.6 + beShimmer * 0.3));

  core.material.color.setHSL(
    0.58 - vs * 0.04 - pulseCav * 0.08,
    0.4 + pulseCav * 0.4,
    0.5 + pulseCav * 0.4
  );
}
