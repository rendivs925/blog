# Vortex Engine 3D Simulation Plan

## Overview

Build a scientific 3D interactive simulation of the Ultimate Vortex Engine using Three.js (CDN ES modules), served as a standalone static page under `public/vortex-simulator/`. The simulation visualizes counter-rotating discs with Halbach magnets, the vortex dipole in the superfluid vacuum, converging energy flow, and the parametric DCE pulse extraction — all driven by real physics equations from our research.

## Priority

**Scientific accuracy with real equations.** Every visual element maps to a physical quantity. The simulation is a tool for understanding the parameter space, not just eye candy.

---

## Architecture

### File Structure

```
public/vortex-simulator/
├── index.html              # Entry point, loads Three.js from CDN
├── js/
│   ├── main.js             # Scene setup, camera, renderer, animation loop, orchestration
│   ├── physics.js          # Physics model: all equations, state management, parameter limits
│   ├── sceneObjects.js     # Creates/updates 3D meshes: discs, magnets, coil, steering rings
│   ├── vortexLines.js      # Vortex dipole tube geometry with glow material
│   ├── particles.js        # Vacuum flow particle system (BufferGeometry, ~10k points)
│   ├── fields.js           # Pressure gradient color visualization (canvas texture or volume)
│   ├── dcePulse.js         # DCE parametric pulse flash animation
│   ├── controlsUI.js       # HTML slider/button UI panel
│   ├── hud.js              # Real-time data readout overlay
│   └── constants.js        # Physical constants (rho_vac, h, m, q, etc.)
├── css/
│   └── style.css           # Layout, control panel, HUD styling (dark theme)
```

### Module Dependency Flow

```
index.html
  └── main.js (importmap or script type="module")
        ├── physics.js       (pure computation, no Three.js dependency)
        ├── sceneObjects.js  (Three.js)
        ├── vortexLines.js   (Three.js)
        ├── particles.js     (Three.js)
        ├── fields.js        (Three.js)
        ├── dcePulse.js      (Three.js)
        ├── controlsUI.js    (DOM manipulation)
        ├── hud.js           (DOM manipulation)
        └── constants.js     (pure data)
```

---

## Physics Model (physics.js)

### State Variables

```js
// User-controlled inputs
let RPM = 5000;                // 0-10000
let HV_kV = 25;                // 0-50 kV
let coilLoad = 0.5;            // 0-1 (fraction of max load)
let steerX = 0;                // -1 to 1
let steerY = 0;                // -1 to 1
let magnetStrength = 1.0;      // 0-1.5x multiplier

// Computed state
let omega = 0;                 // rad/s
let B_eff = 0;                 // effective field (Tesla)
let deltaP = 0;                // vortex core pressure drop (Pa)
let P_harvest = 0;             // harvested power (W)
let P_motor = 0;               // motor input power (W)
let P_HV = 0;                  // HV supply power (W)
let F_lift = 0;                // total lift force (N)
let COP = 0;                   // coefficient of performance
let vortexEstablished = false; // true when topology threshold met
let vortexStability = 0;       // 0-1
```

### Core Equations

```js
function computePhysics() {
  // Angular velocity
  omega = 2 * Math.PI * RPM / 60;

  // Effective magnetic field (magnets + HV coupling)
  B_eff = magnetStrength * B_rem * (1 + alpha * (HV_kV / HV_max));

  // Critical rotation rate for vortex nucleation
  const omega_crit = (h / (m_e * R_disc * R_disc)) * Math.log(R_disc / a0)
                     / (1 + alpha_B * B_eff);

  // Is vortex established?
  vortexEstablished = omega > omega_crit;
  vortexStability = Math.min(1, (omega - omega_crit) / (omega_crit * 2));

  // Pressure drop in vortex core
  deltaP = 0.5 * rho_vac * omega * omega * R_disc * R_disc;

  // Lift force
  F_lift = A_disc * deltaP + mu0 * M_magnet * (B_eff / R_disc);

  // Harvest power
  P_harvest = eta * A_coil * omega * deltaP * coilLoad;

  // Motor power (bearing friction + windage + magnetic drag)
  const P_bearing = C_bearing * omega;
  const P_windage = C_windage * Math.pow(omega, 3);
  const P_mag_drag = C_mag * B_eff * B_eff * omega;
  P_motor = P_bearing + P_windage + P_mag_drag;

  // HV power loss
  P_HV = (HV_kV * 1000) * (HV_kV * 1000) / R_leakage;

  // COP
  COP = (P_harvest > 0) ? P_harvest / (P_motor + P_HV) : 0;
}
```

### Constants

All in `constants.js`:

```js
export const R_disc = 0.15;        // meters (prototype)
export const A_disc = Math.PI * R_disc * R_disc;
export const A_coil = 0.01;        // m^2
export const B_rem = 1.48;         // Tesla (N52)
export const R_leakage = 1e9;      // Ohms
export const rho_vac = 1e-9;       // observed vacuum density (kg/m^3)
export const h = 6.626e-34;        // Planck
export const m_e = 9.109e-31;      // electron mass
export const a0 = 1e-12;           // vortex core radius (m)
export const mu0 = 4 * Math.PI * 1e-7;
export const M_magnet = B_rem / mu0; // magnetization
export const eta = 0.85;           // harvest efficiency
export const alpha_B = 0.01;       // magnet-vacuum coupling coefficient
export const C_bearing = 1e-5;     // bearing friction coefficient
export const C_windage = 1e-8;     // windage coefficient
export const C_mag = 1e-10;        // magnetic drag coefficient
```

---

## Scene Objects (sceneObjects.js)

### What to create:

| Object | Geometry | Material | Purpose |
|--------|----------|----------|---------|
| Top disc | CylinderGeometry(r=0.15, h=0.003) | MeshPhysicalMaterial, metalness=0.9 | Counter-rotating disc (CW) |
| Bottom disc | Same | Same | Counter-rotating disc (CCW) |
| Magnets | BoxGeometry(0.02, 0.005, 0.01) × 12 per disc | MeshStandardMaterial, emissive | Halbach array ring |
| Harvest coil | TorusGeometry(r=0.1, tube=0.01) | MeshPhysicalMaterial, emissive gold | Focal point collector |
| Steering coil X | RingGeometry(r=0.2, tube=0.002) × 2 | LineBasicMaterial, wireframe | Lateral control |
| Steering coil Y | Same, rotated 90° | Same | Lateral control |
| Ground grid | GridHelper | Default | Spatial reference |
| Axis arrows | ArrowHelper | Default | Force vector display |
| Vortex lines | TubeGeometry (custom) | MeshBasicMaterial emissive | See vortexLines.js |
| Particles | BufferGeometry (10k points) | PointsMaterial | See particles.js |
| Pressure field | SphereGeometry (semi-transparent) | MeshBasicMaterial with opacity | See fields.js |

### Disc Rotation Animation

In the main animation loop:

```js
topDisc.rotation.y += omega * delta;       // CW
bottomDisc.rotation.y -= omega * delta;     // CCW
```

The rotation speed is real-time: if RPM = 5000, the disc visually rotates at 5000/60 = 83.3 RPS. For very high RPM, we may need to cap visual rotation to avoid aliasing (Nyquist: keep visual RPM ≤ 30 RPS = no more than 15 steps per revolution at 60fps).

---

## Vortex Lines (vortexLines.js)

### The Vortex Dipole Geometry

Two vortex lines, rendered as TubeGeometry:

- **Vortex 1:** Extends from center of top disc, curves through the gap, to center of bottom disc
- **Vortex 2:** The interlinked partner, offset and rotating around the first

The curve is a CatmullRomSpline3 with control points:

```js
// Vortex 1: axial line through both discs
const pts1 = [
  (0, 0, +discOffset + 0.05),     // above top disc
  (0, 0, +discOffset),            // top disc center
  (0, 0, 0),                      // gap (focal point)
  (0, 0, -discOffset),            // bottom disc center
  (0, 0, -discOffset - 0.05),     // below bottom disc
];

// Vortex 2: helical twist around vortex 1
// Control points rotate with time and offset
const twistAngle = time * omega * 0.5;
const twistRadius = 0.02 * vortexStrength;
const pts2 = pts1.map(p => {
  const [x, y, z] = p;
  const r = twistRadius * (1 - Math.abs(z) / maxZ); // taper at ends
  return (r * cos(twistAngle + z * k), r * sin(twistAngle + z * k), z);
});
```

### Visual Properties

| Vortex property | Mapped to visual |
|----------------|-----------------|
| Circulation strength (κ) | Tube radius (thicker = stronger) |
| Core pressure | Emissive color (blue = low, white = transition, orange = high) |
| Stability | Opacity (stable = opaque, unstable = flicker) |
| Axis direction | The tube curve direction |
| DCE trigger | Brief bright flash + expansion |

### Material

```js
new THREE.MeshBasicMaterial({
  color: 0x00aaff,
  transparent: true,
  opacity: 0.8,
  emissive: 0x0066ff,
  emissiveIntensity: 2.0,
});
```

Plus post-processing bloom from EffectComposer for the glow.

---

## Particle System (particles.js)

### Purpose

Show vacuum energy flow converging into the vortex core. ~10,000 particles flowing radially inward and axially toward the gap.

### Particle Initialization

Particles spawn on a cylindrical shell around the discs (radius = 2 × R_disc, height = 1m). Each particle has:

```js
{
  position: Vector3,         // current position
  velocity: Vector3,         // current velocity
  initialRadius: number,     // spawn radius (for respawn)
  initialHeight: number,     // spawn height
  lifetime: number,          // 0-1
  seed: number,              // random offset
}
```

### Velocity Update Per Frame

```js
function updateParticle(p, delta) {
  // Radial component: inward flow proportional to 1/r
  const r = Math.sqrt(p.position.x * p.position.x + p.position.z * p.position.z);
  const radialDir = new Vector3(-p.position.x / r, 0, -p.position.z / r);
  const radialSpeed = vortexStrength * (1 / (r + 0.01));
  
  // Axial component: toward the gap (y=0)
  const axialDir = new Vector3(0, -Math.sign(p.position.y), 0);
  const axialSpeed = vortexStrength * 0.5 / (1 + Math.abs(p.position.y));
  
  // Add turbulence
  const turb = turbulence * random();
  
  // Combine
  p.velocity = radialDir * radialSpeed + axialDir * axialSpeed + turb;
  p.position += p.velocity * delta;
  
  // Lifespan
  p.lifetime -= delta / maxLifetime;
  
  // Respawn if dead or past center
  if (p.lifetime <= 0 || r < 0.005) {
    respawn(p);
  }
}
```

### Visual Properties

- Color: blue-white (cold vacuum flow) transitioning to warm near core
- Size: larger at outer edge (more diffuse), smaller near core (concentrated)
- Opacity: higher near core

### Particle Count Optimization

- 10,000 particles minimum for smooth look
- Use `THREE.Points` with `BufferGeometry`
- Update positions with `setAttribute` each frame
- Use `drawRange` if using a fixed buffer with reuse

---

## Field Display (fields.js)

### Pressure Gradient Visualization

Option: Use a translucent sphere/dome around the assembly with a canvas texture showing pressure:

- Red: ambient vacuum pressure (high)
- Blue: vortex core (low pressure)
- Gradient in between showing pressure drop

```js
// Canvas-based texture
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
// Render color based on ΔP from center
// Apply as texture to a dome/sphere
```

Alternatively: a simpler approach using a plane below the discs with a dynamic canvas texture showing the pressure field in cross-section. This is easier to implement and more readable.

---

## DCE Pulse (dcePulse.js)

### Trigger

The DCE pulse fires when:
1. Vortex is established
2. Coil load > threshold
3. (Optionally) on a periodic timer based on vortex resonance frequency

### Visual Animation

```js
function triggerPulse() {
  // Expanding sphere from the focal point
  const pulse = new THREE.Mesh(
    new THREE.SphereGeometry(0.01, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 1,
    })
  );
  scene.add(pulse);
  
  // Animate: scale up and fade out over 0.5s
  const startTime = performance.now();
  function animatePulse() {
    const t = (performance.now() - startTime) / 500; // 0 to 1
    if (t >= 1) { scene.remove(pulse); return; }
    const s = 1 + t * 5; // scale factor
    pulse.scale.set(s, s, s);
    pulse.material.opacity = 1 - t;
    requestAnimationFrame(animatePulse);
  }
  animatePulse();
  
  // Also trigger a brief bright flash on the harvest coil
  coil.material.emissiveIntensity = 5;
  setTimeout(() => { coil.material.emissiveIntensity = 0.5; }, 200);
  
  // Particle burst from focal point
  emitBurstParticles(500);
}
```

---

## Controls UI (controlsUI.js)

### Control Panel Layout

```
┌──────────────────────────────────────────────┐
│  ⚡ VORTEX ENGINE SIMULATOR v1.0             │
├──────────────────────────────────────────────┤
│  ┌─ PRIMARY ─────────────────────────────┐   │
│  │ RPM    [━━━━━━━━━●━━━]  5,000        │   │
│  │ HV     [━━━━●━━━━━━━━]  25 kV         │   │
│  │ LOAD   [━━━━━━●━━━━━]  50%            │   │
│  └────────────────────────────────────────┘   │
│  ┌─ STEERING ────────────────────────────┐   │
│  │ STEER X [━━━━━━━●━━━]  0.0           │   │
│  │ STEER Y [━━━━━━━●━━━]  0.0           │   │
│  └────────────────────────────────────────┘   │
│  ┌─ MAGNET ──────────────────────────────┐   │
│  │ MAGNET  [━━━●━━━━━━━━]  1.0×          │   │
│  └────────────────────────────────────────┘   │
│  ┌─ VIEW ────────────────────────────────┐   │
│  │ [ORBIT] [TOP] [SIDE] [COCKPIT]        │   │
│  │ [▶ RUN]  [⏸ PAUSE]  [↺ RESET]         │   │
│  └────────────────────────────────────────┘   │
│  [vortex established]  [COP: 4.7]             │
└──────────────────────────────────────────────┘
```

### Implementation

Pure HTML/CSS, no external library. Use `<input type="range">` with custom styling. Event listeners update the physics state and trigger re-render.

```js
RPM_slider.addEventListener('input', () => {
  physics.RPM = parseFloat(RPM_slider.value);
  RPM_display.textContent = physics.RPM;
  physics.compute();
  hud.update(physics);
});
```

---

## HUD (hud.js)

### Real-time Data Display

Overlaid on the 3D scene (positioned with CSS, fixed on screen):

```
┌────────────────────┐
│ LIFT:  12.4 N      │
│ POWER: 3.2 kW      │
│ COP:   4.7         │
│ ΔP:    850 Pa      │
│ RPM:   5,000       │
│ VORTEX: ✅         │
└────────────────────┘
```

Updated every frame from the physics state.

---

## Scene Setup (main.js)

### Camera

```js
const camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 100);
camera.position.set(1.5, 1.0, 1.5);
```

### Controls

```js
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);
```

### Lights

```js
const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(2, 5, 3);
const pointLight = new THREE.PointLight(0x00aaff, 2, 2);
pointLight.position.set(0, 0, 0); // vortex core glow
```

### Post-Processing

```js
import { EffectComposer } from '...';
import { RenderPass } from '...';
import { UnrealBloomPass } from '...';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.5, 0.4, 0.85);
composer.addPass(bloom);
```

### Animation Loop

```js
function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  if (!paused) {
    physics.compute();
    sceneObjects.update(physics, time);
    vortexLines.update(physics, time);
    particles.update(physics, delta);
    fields.update(physics);
    hud.update(physics);
  }
  
  controls.update();
  composer.render();
}
```

---

## CSS Theme (css/style.css)

Dark scientific theme:

```css
body {
  margin: 0;
  overflow: hidden;
  background: #0a0a1a;
  font-family: 'JetBrains Mono', monospace;
  color: #c0d0ff;
}

#controls-panel {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(10, 10, 30, 0.85);
  border: 1px solid rgba(0, 170, 255, 0.3);
  border-radius: 12px;
  padding: 16px 24px;
  width: 600px;
  backdrop-filter: blur(8px);
}

#hud {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(10, 10, 30, 0.85);
  border: 1px solid rgba(0, 170, 255, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.6;
}

input[type="range"] {
  width: 200px;
  accent-color: #00aaff;
}
```

---

## Development Steps

### Phase 1: Foundation (do first)

1. Create `public/vortex-simulator/` directory structure
2. Write `index.html` with Three.js CDN importmap
3. Write `constants.js` and `physics.js` — get the equations working in the console
4. Write `main.js` — Three.js scene, camera, lights, ground grid, axis helpers
5. Write `sceneObjects.js` — two discs with magnets, harvest coil, steering coils
6. Verify: basic scene renders, discs rotate at correct RPM, physics state updates

### Phase 2: Core Visualization (do second)

7. Write `vortexLines.js` — TubeGeometry for vortex dipole
8. Write `particles.js` — 10k particles flowing inward
9. Write `fields.js` — pressure gradient visualization
10. Write `controlsUI.js` — slider controls, play/pause/reset, view presets
11. Write `hud.js` — real-time data readout
12. Verify: full interactive simulation working

### Phase 3: Polish (do third)

13. Write `dcePulse.js` — parametric pulse flash animation
14. Add post-processing bloom effect
15. Add steering coil deflection visualization
16. Add camera view presets (top, side, orbit, cockpit)
17. Add "preset" scenarios (low power, high lift, max COP, etc.)
18. Polish CSS and responsive layout

### Phase 4: Verification

19. Test at various screen sizes
20. Verify physics equations produce correct values
21. Verify controls update visuals in real-time
22. Test with browser devtools for performance (60fps target)

---

## CDN Three.js Import Strategy

Use importmap in `index.html`:

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"
  }
}
</script>
```

Then all modules can import normally:
```js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
```

---

## Future Enhancement Possibilities

- **Parameter presets:** "Low RPM / Max COP" / "High Lift" / "Self-Sustaining" buttons
- **Energy flow heatmap:** 2D color plot showing energy density cross-section
- **Export data:** CSV export of parameter sweeps
- **VR/AR support:** Three.js has VR support built in
- **Multi-engine array:** Simulate 3+ engine configuration for full 6-DOF control
- **Wireless power visualization:** Show vortex coupling to remote receiver coil
