import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

const group = new THREE.Group();
let topDisc, bottomDisc, coilGroup, coilGlow, liftArrow, core, coreFlash, membrane;
let bFieldGlow, bFieldGlow2;
let hvTipTop, hvTipBot;
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

  // --- Halbach magnets: N52 NdFeB with epoxy coating ---
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

  // --- Ultra-realistic harvest coil: helical wire windings ---
  coilGroup = new THREE.Group();

  const wireMat = new THREE.MeshPhysicalMaterial({
    color: 0xdd8840,
    metalness: 1.0,
    roughness: 0.12,
    envMapIntensity: 1.0,
    clearcoat: 0.05,
    anisotropy: 0.5,
    anisotropyRotation: Math.PI / 2,
  });
  const insulationMat = new THREE.MeshBasicMaterial({
    color: 0x1a1510,
    transparent: true,
    opacity: 0.3,
  });

  const WIRE_R = PHYS.WIRE_RADIUS;
  const COIL_R = PHYS.COIL_RADIUS;
  const TURNS = PHYS.COIL_TURNS;
  const LAYERS = PHYS.COIL_LAYERS;

  for (let layer = 0; layer < LAYERS; layer++) {
    const layerR = COIL_R + layer * PHYS.WIRE_SPACING;
    const layerYBase = (layer - (LAYERS - 1) / 2) * WIRE_R * 3;
    for (let t = 0; t < TURNS; t++) {
      const u = t / TURNS;
      const yOffset = (u - 0.5) * WIRE_R * TURNS * 0.08;
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(layerR, WIRE_R, 8, 16),
        wireMat
      );
      mesh.position.y = layerYBase + yOffset;
      mesh.rotation.x = Math.PI / 2;
      mesh.rotation.z = u * 0.25;
      coilGroup.add(mesh);
    }
  }

  // Bobbin (coil former) — thin dark cylinder
  const bobbinMat = new THREE.MeshPhysicalMaterial({
    color: 0x181418,
    roughness: 0.8,
    metalness: 0.2,
  });
  const bobbin = new THREE.Mesh(
    new THREE.CylinderGeometry(
      COIL_R - WIRE_R * 2,
      COIL_R - WIRE_R * 2,
      WIRE_R * TURNS * 0.1 + 0.003,
      24, 1, true
    ),
    bobbinMat
  );
  bobbin.rotation.x = Math.PI / 2;
  coilGroup.add(bobbin);

  // Terminal posts
  const terminalMat = new THREE.MeshPhysicalMaterial({
    color: 0xccaa44,
    metalness: 0.9,
    roughness: 0.2,
  });
  for (let side = -1; side <= 1; side += 2) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.002, 0.002, 0.012, 8),
      terminalMat
    );
    post.position.set(COIL_R * side * 0.7, WIRE_R * TURNS * 0.04, COIL_R * 0.7);
    post.rotation.z = side * 0.2;
    coilGroup.add(post);
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.003, 8, 8),
      terminalMat
    );
    ball.position.set(COIL_R * side * 0.7, WIRE_R * TURNS * 0.04 + 0.007, COIL_R * 0.7);
    coilGroup.add(ball);
  }

  group.add(coilGroup);

  // Coil glow
  coilGlow = new THREE.PointLight(0xff8800, 0, 0.3);
  coilGlow.position.y = 0;
  group.add(coilGlow);

  // --- Mounting struts between discs ---
  const strutMat = new THREE.MeshPhysicalMaterial({
    color: 0x606870,
    metalness: 0.8,
    roughness: 0.3,
  });
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.003, 0.003, off * 2 - 0.01, 8),
      strutMat
    );
    strut.position.set(R * 0.92 * Math.cos(angle), 0, R * 0.92 * Math.sin(angle));
    group.add(strut);
  }

  // --- HV electrode tips ---
  const hvMat = new THREE.MeshPhysicalMaterial({
    color: 0x8888aa,
    metalness: 0.7,
    roughness: 0.15,
  });
  const tipGeo = new THREE.ConeGeometry(0.004, 0.012, 8);
  hvTipTop = new THREE.Mesh(tipGeo, hvMat);
  hvTipTop.position.y = off * 0.75;
  hvTipTop.rotation.x = 0;
  group.add(hvTipTop);
  hvTipBot = new THREE.Mesh(tipGeo.clone(), hvMat);
  hvTipBot.position.y = -off * 0.75;
  hvTipBot.rotation.x = Math.PI;
  group.add(hvTipBot);

  // HV corona glow
  const coronaMat = new THREE.MeshBasicMaterial({
    color: 0x6677cc,
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  for (let sign = -1; sign <= 1; sign += 2) {
    const corona = new THREE.Mesh(
      new THREE.SphereGeometry(0.008, 12, 12),
      coronaMat.clone()
    );
    corona.position.y = sign * off * 0.75;
    group.add(corona);
  }

  // --- Magnetic field glow halo ---
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

  // --- GAN convergence core + flash + discriminator membrane ---
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x66ccff,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
  });
  core = new THREE.Mesh(new THREE.SphereGeometry(0.005, 16, 16), coreMat);
  core.position.y = 0;
  group.add(core);

  // GAN flash sphere (for abrupt onsets)
  const flashMat = new THREE.MeshBasicMaterial({
    color: 0xccddff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });
  coreFlash = new THREE.Mesh(new THREE.SphereGeometry(0.012, 16, 16), flashMat);
  coreFlash.position.y = 0;
  group.add(coreFlash);

  // GAN discriminator membrane — torus barrier that flexes
  const membraneMat = new THREE.MeshBasicMaterial({
    color: 0x8866dd,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  membrane = new THREE.Mesh(
    new THREE.TorusGeometry(R * 0.3, 0.002, 16, 32),
    membraneMat
  );
  membrane.position.y = 0;
  membrane.rotation.x = Math.PI / 2;
  group.add(membrane);

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

export function updateScene(time, delta) {
  if (!initialized) return;

  const visRPM = Math.min(state.RPM, 3000);
  const visOmega = 2 * Math.PI * visRPM / 60;
  topDisc.rotation.y += visOmega * delta;
  bottomDisc.rotation.y -= visOmega * delta;

  const vs = state.vortexStability;
  const be = state.backEmf;

  // Coil windings glow from harvest
  const powerRatio = Math.min(1, state.P_harvest / 50000);
  const hue = 0.08 - powerRatio * 0.06;
  const sat = 0.6 + powerRatio * 0.3;
  const lit = 0.35 + powerRatio * 0.25;
  coilGroup.children.forEach(child => {
    if (child.isMesh && child.material && child.material.color) {
      child.material.color.setHSL(hue, sat, lit);
    }
  });

  // Back-EMF coil flicker
  const emfFlicker = 1 + (0.5 + 0.5 * Math.sin(time * 50 + be * 15)) * be * 0.4;
  const emi = powerRatio * 2 * emfFlicker;
  coilGroup.children.forEach(child => {
    if (child.isMesh && child.material && child.material.emissive) {
      child.material.emissive = new THREE.Color(0xff8800);
      child.material.emissiveIntensity = emi;
    }
  });
  coilGlow.intensity = powerRatio * 1.5 * emfFlicker;

  // HV corona pulsing
  const hvIntensity = (0.5 + 0.5 * Math.sin(time * 3 + state.HV_kV * 2)) * (state.HV_kV / 50) * 0.06;
  group.children.forEach(child => {
    if (child.isMesh && child.material && child.material.color &&
        child.material.color.getHex() === 0x6677cc) {
      child.material.opacity = hvIntensity;
    }
  });

  // B-field halo
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

  // --- GAN core: abrupt state switching ---
  const pa = state.pulseActive;
  const snap = state.ganTransition;
  const slot = state.ganSlot;
  const gen = state.ganGenerator;
  const disc = state.ganDiscriminator;
  const mStress = state.ganMembraneStress;
  const mFlash = state.ganMembraneFlash;

  // Core base: glows with generator buildup
  const genGlow = Math.min(1, gen / (disc + 0.01)) * vs;
  core.material.opacity = Math.min(1, 0.08 + genGlow * 0.5 + snap * 0.6);
  const baseScale = 0.4 + vs * 1.2 + genGlow * 0.8;
  core.scale.setScalar(Math.max(0.1, baseScale + snap * 2.0));

  const hueC = 0.58 - vs * 0.04 - snap * 0.1;
  const satC = 0.3 + genGlow * 0.4 + snap * 0.3;
  const litC = 0.4 + genGlow * 0.4 + snap * 0.5;
  core.material.color.setHSL(hueC, satC, litC);

  // Flash sphere: only visible during abrupt transitions
  if (snap > 0.5) {
    coreFlash.material.opacity = 0.7;
    coreFlash.scale.setScalar(1 + mFlash * 3);
    const hueF = slot === 0 ? 0.58 : (slot === 1 ? 0.78 : 0.08);
    coreFlash.material.color.setHSL(hueF, 0.6, 0.7);
  } else {
    coreFlash.material.opacity *= 0.85;
  }

  // Discriminator membrane: visible during generator buildup, flexes at trigger
  const membOp = Math.min(1, genGlow * 0.6 + snap * 0.8);
  membrane.material.opacity = membOp * 0.15;
  const membScale = 1 + mStress * 0.15;
  membrane.scale.set(membScale, membScale, 1);
  membrane.material.color.setHSL(
    0.72 - disc * 0.04,
    0.5,
    0.3 + disc * 0.2 + mFlash * 0.3
  );
  membrane.rotation.z = time * 0.5;
}

export function getCoilPosition() {
  return { x: 0, y: 0, z: 0 };
}
