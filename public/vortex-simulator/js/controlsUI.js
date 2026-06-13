import { state, compute } from './physics.js';
import { updateHUD } from './hud.js';

let paused = false;
let orbitView = true;

export function setupControls(camera, controls) {
  const bind = (id, setter, display) => {
    const el = document.getElementById(id);
    const disp = document.getElementById(display || ('val-' + id.replace('ctrl-', '')));
    el.addEventListener('input', () => {
      const val = parseFloat(el.value);
      setter(val);
      if (disp) disp.textContent = el.value + (id.includes('hv') ? ' kV' : id.includes('load') ? '%' : id.includes('magnet') ? 'x' : id.includes('steer') ? '' : '');
      document.getElementById('val-magnet').textContent = (state.magnetStrength).toFixed(2) + 'x';
      compute();
      updateHUD();
    });
  };

  bind('ctrl-rpm', v => state.RPM = v);
  bind('ctrl-hv', v => state.HV_kV = v);
  bind('ctrl-load', v => state.coilLoad = v / 100);
  bind('ctrl-magnet', v => state.magnetStrength = v / 100);
  bind('ctrl-steerx', v => state.steerX = v / 100);
  bind('ctrl-steery', v => state.steerY = v / 100);

  // View buttons
  const setView = (pos) => {
    if (pos === 'top') {
      camera.position.set(0, 0.8, 0.001);
      controls.target.set(0, 0, 0);
      orbitView = false;
    } else if (pos === 'side') {
      camera.position.set(0.6, 0, 0);
      controls.target.set(0, 0, 0);
      orbitView = false;
    } else {
      camera.position.set(0.5, 0.3, 0.5);
      controls.target.set(0, 0, 0);
      orbitView = true;
    }
    controls.update();
  };

  document.getElementById('btn-top').addEventListener('click', () => setView('top'));
  document.getElementById('btn-side').addEventListener('click', () => setView('side'));
  document.getElementById('btn-orbit').addEventListener('click', () => setView('orbit'));

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'p') {
      paused = !paused;
      document.getElementById('btn-play').textContent = paused ? '⏸ PAUSED' : '▶ RUN';
    }
    if (e.key === 'r') {
      state.RPM = 5000;
      state.HV_kV = 25;
      state.coilLoad = 0.5;
      state.steerX = 0;
      state.steerY = 0;
      state.magnetStrength = 1.0;
      document.getElementById('ctrl-rpm').value = 5000;
      document.getElementById('ctrl-hv').value = 25;
      document.getElementById('ctrl-load').value = 50;
      document.getElementById('ctrl-magnet').value = 100;
      document.getElementById('ctrl-steerx').value = 0;
      document.getElementById('ctrl-steery').value = 0;
      document.getElementById('val-rpm').textContent = '5000';
      document.getElementById('val-hv').textContent = '25 kV';
      document.getElementById('val-load').textContent = '50%';
      document.getElementById('val-magnet').textContent = '1.00x';
      document.getElementById('val-steerx').textContent = '0.0';
      document.getElementById('val-steery').textContent = '0.0';
      paused = false;
      document.getElementById('btn-play').textContent = '▶ RUN';
      compute();
      updateHUD();
    }
  });

  document.getElementById('btn-play').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('btn-play').textContent = paused ? '⏸ PAUSED' : '▶ RUN';
  });

  compute();
  updateHUD();
}

export function isPaused() { return paused; }
