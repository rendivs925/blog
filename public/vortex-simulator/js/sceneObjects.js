import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

const group = new THREE.Group();
let topDisc, bottomDisc, wireGroup, coilGlow, liftArrow, core, coreFlash, membrane;
let bFieldGlow, bFieldGlow2;
let hvTipTop, hvTipBot;
let initialized = false;

export function buildScene(scene) {
  const R = PHYS.R_DISC;
  const H = PHYS.H_DISC;
  const off = PHYS.DISC_OFFSET;

  // --- PART 1: Machined titanium discs with engineering details ---
  const discMat = new THREE.MeshPhysicalMaterial({
    color: 0x7a8a9a,
    metalness: 0.95,
    roughness: 0.18,
    envMapIntensity: 1.2,
    clearcoat: 0.08,
    clearcoatRoughness: 0.35,
  });

  // Main disc body with bevel using LatheGeometry profile
  // Profile: [inner, top] -> [outer, top-bevel] -> [outer, -top+bevel] -> [inner, -top]
  const bevel = 0.001;
  const discPts = [
    new THREE.Vector2(0.005, H / 2 + 0.002),
    new THREE.Vector2(0.008, H / 2 + 0.001),
    new THREE.Vector2(R - bevel, H / 2),
    new THREE.Vector2(R, H / 2 - bevel),
    new THREE.Vector2(R, -H / 2 + bevel),
    new THREE.Vector2(R - bevel, -H / 2),
    new THREE.Vector2(0.008, -H / 2 - 0.001),
    new THREE.Vector2(0.005, -H / 2 - 0.002),
  ];
  const discGeo = new THREE.LatheGeometry(discPts, 48);

  topDisc = new THREE.Mesh(discGeo, discMat);
  topDisc.position.y = off;
  bottomDisc = new THREE.Mesh(discGeo.clone(), discMat.clone());
  bottomDisc.position.y = -off;
  group.add(topDisc);
  group.add(bottomDisc);

  // Central spindle hub on each disc
  const hubMat = new THREE.MeshPhysicalMaterial({
    color: 0x6a7a8a,
    metalness: 0.9,
    roughness: 0.25,
  });
  for (let sign = -1; sign <= 1; sign += 2) {
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.015, 0.004, 16),
      hubMat
    );
    hub.position.y = sign * off + sign * (H / 2 + 0.002);
    group.add(hub);
  }

  // Bolt holes (6× M3 counterbore pattern)
  const boltMat = new THREE.MeshPhysicalMaterial({
    color: 0x202428,
    metalness: 0.6,
    roughness: 0.5,
  });
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
    const bx = R * 0.55 * Math.cos(angle);
    const bz = R * 0.55 * Math.sin(angle);
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.004, H * 2, 8),
      boltMat
    );
    bolt.position.set(bx, 0, bz);
    topDisc.add(bolt);
    const bolt2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.004, H * 2, 8),
      boltMat
    );
    bolt2.position.set(bx, 0, bz);
    bottomDisc.add(bolt2);
  }

  // --- PART 2: N52 NdFeB magnets with realistic shape ---
  const magMat = new THREE.MeshPhysicalMaterial({
    color: 0x222022,
    metalness: 0.55,
    roughness: 0.55,
    clearcoat: 0.3,
    clearcoatRoughness: 0.15,
    envMapIntensity: 0.5,
  });

  // Beveled magnet — box with slightly smaller top/bottom faces
  // Using a custom approach: CylinderGeometry with 4 radial segments
  // approximating a rectangular form with chamfered vertical edges
  const mW = PHYS.MAGNET_W;
  const mH = PHYS.MAGNET_H;
  const mD = PHYS.MAGNET_D;
  const bevelR = 0.002;

  // Create magnet via BoxGeometry with small edge chamfer cylinders
  const magGeo = new THREE.BoxGeometry(mW - bevelR * 2, mH, mD - bevelR * 2);
  const chamferMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a181a,
    metalness: 0.5,
    roughness: 0.6,
  });

  // Pole marking — paint dots (small colored cylinders)
  const poleGeo = new THREE.CylinderGeometry(0.0025, 0.0025, 0.0005, 8);
  const nMat = new THREE.MeshBasicMaterial({ color: 0xdd3333 });
  const sMat = new THREE.MeshBasicMaterial({ color: 0x3355cc });

  function buildMagnet(angle, yPos, disc, isNorth) {
    const mag = new THREE.Group();
    const body = new THREE.Mesh(magGeo, magMat);
    body.position.set(0, 0, 0);
    mag.add(body);

    // Chamfer edges — small cylinders at corners
    for (let cx = -1; cx <= 1; cx += 2) {
      for (let cz = -1; cz <= 1; cz += 2) {
        const chamfer = new THREE.Mesh(
          new THREE.CylinderGeometry(bevelR, bevelR, mH, 6),
          chamferMat
        );
        chamfer.position.set(cx * (mW / 2 - bevelR / 2), 0, cz * (mD / 2 - bevelR / 2));
        chamfer.rotation.x = Math.PI / 2;
        mag.add(chamfer);
      }
    }

    // Pole paint dot on top/bottom face
    const pole = new THREE.Mesh(poleGeo, isNorth ? nMat : sMat);
    pole.position.set(0, isNorth ? mH / 2 + 0.0005 : -mH / 2 - 0.0005, 0);
    mag.add(pole);

    // Small polarity marking ring
    const ringMat = new THREE.MeshBasicMaterial({
      color: isNorth ? 0xdd3333 : 0x3355cc,
      transparent: true,
      opacity: 0.3,
    });
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.002, 0.004, 12),
      ringMat
    );
    ring.position.set(0, isNorth ? mH / 2 + 0.0005 : -mH / 2 - 0.0005, 0);
    ring.rotation.x = isNorth ? 0 : Math.PI;
    mag.add(ring);

    mag.position.set(
      PHYS.MAGNET_RADIUS * Math.cos(angle),
      yPos,
      PHYS.MAGNET_RADIUS * Math.sin(angle)
    );
    mag.rotation.y = -angle;
    disc.add(mag);
  }

  for (let i = 0; i < PHYS.MAGNET_COUNT; i++) {
    const angle = (i / PHYS.MAGNET_COUNT) * Math.PI * 2;
    buildMagnet(angle, 0, topDisc, i % 2 === 0);
  }
  for (let i = 0; i < PHYS.MAGNET_COUNT; i++) {
    const angle = (i / PHYS.MAGNET_COUNT) * Math.PI * 2 + Math.PI / PHYS.MAGNET_COUNT;
    buildMagnet(angle, 0, bottomDisc, i % 2 !== 0);
  }

  // --- PART 3: Ultra-realistic harvest coil assembly ---
  coilGlow = new THREE.PointLight(0xff8800, 0, 0.3);
  coilGlow.position.y = 0;
  group.add(coilGlow);

  const coilGroup = new THREE.Group();
  wireGroup = new THREE.Group();

  const wireMat = new THREE.MeshPhysicalMaterial({
    color: 0xcc7730,
    metalness: 1.0,
    roughness: 0.1,
    envMapIntensity: 1.0,
    clearcoat: 0.05,
    anisotropy: 0.6,
    anisotropyRotation: Math.PI / 2,
  });

  const WR = PHYS.WIRE_RADIUS;
  const CR = PHYS.COIL_RADIUS;
  const TURNS = 24;
  const LAYERS = 3;

  // Helical winding — 3 layers × 24 turns
  for (let layer = 0; layer < LAYERS; layer++) {
    const layerR = CR + layer * WR * 2.5;
    const layerYBase = (layer - (LAYERS - 1) / 2) * WR * 2.5;
    for (let t = 0; t < TURNS; t++) {
      const u = t / TURNS;
      const yOff = (u - 0.5) * WR * TURNS * 0.06;
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(layerR, WR, 8, 16),
        wireMat
      );
      mesh.position.y = layerYBase + yOff;
      mesh.rotation.x = Math.PI / 2;
      mesh.rotation.z = u * 0.3;
      mesh.userData.isWire = true;
      wireGroup.add(mesh);
    }
  }
  coilGroup.add(wireGroup);

  // Enamel insulation visible between layers (thin dark spacer ring)
  for (let layer = 0; layer < LAYERS - 1; layer++) {
    const spacerR = CR + (layer + 0.5) * WR * 2.5;
    const spacer = new THREE.Mesh(
      new THREE.TorusGeometry(spacerR, WR * 0.3, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0x181210, transparent: true, opacity: 0.15 })
    );
    spacer.position.y = 0;
    spacer.rotation.x = Math.PI / 2;
    coilGroup.add(spacer);
  }

  // Bobbin with end flanges
  const bobbinMat = new THREE.MeshPhysicalMaterial({
    color: 0x181418,
    roughness: 0.8,
    metalness: 0.15,
  });
  const bobbinCore = new THREE.Mesh(
    new THREE.CylinderGeometry(CR - WR * 2, CR - WR * 2, WR * 6, 24, 1, true),
    bobbinMat
  );
  bobbinCore.rotation.x = Math.PI / 2;
  coilGroup.add(bobbinCore);

  // Bobbin flanges
  for (let side = -1; side <= 1; side += 2) {
    const flange = new THREE.Mesh(
      new THREE.RingGeometry(CR - WR * 2, CR + LAYERS * WR * 2.5 + WR, 24),
      bobbinMat
    );
    flange.position.y = side * WR * 3;
    flange.rotation.x = -Math.PI / 2;
    coilGroup.add(flange);
  }

  // Winding binding bands (3 bands holding the coil)
  const bandMat = new THREE.MeshPhysicalMaterial({
    color: 0x282018,
    roughness: 0.7,
    metalness: 0.3,
  });
  for (let i = 0; i < 3; i++) {
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(CR + LAYERS * WR * 2.5 + WR * 0.5, WR * 0.4, 8, 24),
      bandMat
    );
    band.position.y = (i - 1) * WR * 4;
    band.rotation.x = Math.PI / 2;
    coilGroup.add(band);
  }

  // Lead wires (2 wires exiting downward)
  const leadMat = new THREE.MeshPhysicalMaterial({
    color: 0xcc8844,
    metalness: 0.8,
    roughness: 0.3,
  });
  for (let side = -1; side <= 1; side += 2) {
    const lead = new THREE.Mesh(
      new THREE.CylinderGeometry(WR * 0.8, WR * 0.8, 0.035, 6),
      leadMat
    );
    lead.position.set(CR * 0.5 * side + 0.005, -0.018, CR * 0.6);
    lead.rotation.z = side * 0.4;
    lead.rotation.x = 0.2;
    coilGroup.add(lead);
  }

  // Terminal block
  const termMat = new THREE.MeshPhysicalMaterial({
    color: 0xbbaa44,
    metalness: 0.85,
    roughness: 0.2,
  });
  for (let side = -1; side <= 1; side += 2) {
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(0.006, 0.004, 0.006),
      termMat
    );
    block.position.set(CR * 0.5 * side + 0.005, -0.028, CR * 0.65);
    coilGroup.add(block);
  }

  group.add(coilGroup);

  // --- Mounting struts (4× titanium) ---
  const strutMat = new THREE.MeshPhysicalMaterial({
    color: 0x586068,
    metalness: 0.8,
    roughness: 0.3,
  });
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const sR = R * 0.92;
    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.003, 0.003, off * 2 - 0.01, 8),
      strutMat
    );
    strut.position.set(sR * Math.cos(angle), 0, sR * Math.sin(angle));
    // Strut end caps
    for (let cap = -1; cap <= 1; cap += 2) {
      const capMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.004, 6, 6),
        strutMat
      );
      capMesh.position.set(sR * Math.cos(angle), cap * (off - 0.005), sR * Math.sin(angle));
      group.add(capMesh);
    }
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
  group.add(hvTipTop);
  hvTipBot = new THREE.Mesh(tipGeo.clone(), hvMat);
  hvTipBot.position.y = -off * 0.75;
  hvTipBot.rotation.x = Math.PI;
  group.add(hvTipBot);

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

  // --- Magnetic field halo rings ---
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

  // --- GAN core assembly ---
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x66ccff,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
  });
  core = new THREE.Mesh(new THREE.SphereGeometry(0.005, 16, 16), coreMat);
  core.position.y = 0;
  group.add(core);

  const flashMat = new THREE.MeshBasicMaterial({
    color: 0xccddff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });
  coreFlash = new THREE.Mesh(new THREE.SphereGeometry(0.012, 16, 16), flashMat);
  coreFlash.position.y = 0;
  group.add(coreFlash);

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
  const powerRatio = Math.min(1, state.P_harvest / 50000);
  const hue = 0.08 - powerRatio * 0.06;
  const sat = 0.6 + powerRatio * 0.3;
  const lit = 0.35 + powerRatio * 0.25;
  const emfFlicker = 1 + (0.5 + 0.5 * Math.sin(time * 50 + be * 15)) * be * 0.4;
  const emi = powerRatio * 2 * emfFlicker;

  // Only wire coils glow with harvest power, not structural parts
  wireGroup.children.forEach(child => {
    if (child.isMesh && child.material && child.material.color) {
      child.material.color.setHSL(hue, sat, lit);
      child.material.emissive = new THREE.Color(0xff8800);
      child.material.emissiveIntensity = emi;
    }
  });
  coilGlow.intensity = powerRatio * 1.5 * emfFlicker;

  // HV corona
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

  // --- GAN core ---
  const pa = state.pulseActive;
  const snap = state.ganTransition;
  const slot = state.ganSlot;
  const gen = state.ganGenerator;
  const disc = state.ganDiscriminator;
  const mStress = state.ganMembraneStress;
  const mFlash = state.ganMembraneFlash;

  const genGlow = Math.min(1, gen / (disc + 0.01)) * vs;
  core.material.opacity = Math.min(1, 0.08 + genGlow * 0.5 + snap * 0.6);
  const baseScale = 0.4 + vs * 1.2 + genGlow * 0.8;
  core.scale.setScalar(Math.max(0.1, baseScale + snap * 2.0));
  core.material.color.setHSL(0.58 - vs * 0.04 - snap * 0.1, 0.3 + genGlow * 0.4 + snap * 0.3, 0.4 + genGlow * 0.4 + snap * 0.5);

  if (snap > 0.5) {
    coreFlash.material.opacity = 0.7;
    coreFlash.scale.setScalar(1 + mFlash * 3);
    coreFlash.material.color.setHSL(slot === 0 ? 0.58 : (slot === 1 ? 0.78 : 0.08), 0.6, 0.7);
  } else {
    coreFlash.material.opacity *= 0.85;
  }

  const membOp = Math.min(1, genGlow * 0.6 + snap * 0.8);
  membrane.material.opacity = membOp * 0.15;
  membrane.scale.set(1 + mStress * 0.15, 1 + mStress * 0.15, 1);
  membrane.material.color.setHSL(0.72 - disc * 0.04, 0.5, 0.3 + disc * 0.2 + mFlash * 0.3);
  membrane.rotation.z = time * 0.5;
}
