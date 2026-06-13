import { state, compute } from './physics.js';
import { updateHUD } from './hud.js';

let paused = false;

const display = {
  'ctrl-rpm':   v => `${Number(v).toLocaleString()}`,
  'ctrl-hv':    v => `${v} kV`,
  'ctrl-load':  v => `${v}%`,
  'ctrl-magnet': v => `${(v / 100).toFixed(2)}x`,
  'ctrl-steerx': v => `${(v / 100).toFixed(2)}`,
  'ctrl-steery': v => `${(v / 100).toFixed(2)}`,
  'ctrl-speed': v => `${(v / 100).toFixed(2)}x`,
};

export function setupControls(camera, controls) {
  for (const [id, fmt] of Object.entries(display)) {
    const el = document.getElementById(id);
    const valId = id.replace('ctrl-', 'val-');
    const disp = document.getElementById(valId);
    el.addEventListener('input', () => {
      const v = parseFloat(el.value);
      if (id === 'ctrl-rpm') state.RPM = v;
      else if (id === 'ctrl-hv') state.HV_kV = v;
      else if (id === 'ctrl-load') state.coilLoad = v / 100;
      else if (id === 'ctrl-magnet') state.magnetStrength = v / 100;
      else if (id === 'ctrl-steerx') state.steerX = v / 100;
      else if (id === 'ctrl-steery') state.steerY = v / 100;
      else if (id === 'ctrl-speed') state.timeScale = v / 100;
      if (disp) disp.textContent = fmt(v);
      compute();
      updateHUD();
    });
  }

  const setView = (pos) => {
    if (pos === 'top') {
      camera.position.set(0, 0.7, 0.001);
      controls.target.set(0, 0, 0);
    } else if (pos === 'side') {
      camera.position.set(0.55, 0, 0);
      controls.target.set(0, 0, 0);
    } else {
      camera.position.set(0.45, 0.28, 0.45);
      controls.target.set(0, 0, 0);
    }
    controls.update();
  };

  const buttons = ['btn-orbit', 'btn-top', 'btn-side'];
  const views = ['orbit', 'top', 'side'];

  buttons.forEach((id, i) => {
    document.getElementById(id).addEventListener('click', () => {
      buttons.forEach(b => document.getElementById(b).classList.remove('active'));
      document.getElementById(id).classList.add('active');
      setView(views[i]);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'p') {
      e.preventDefault();
      paused = !paused;
      document.getElementById('btn-play').textContent = paused ? 'PAUSED' : 'RUN';
    }
    if (e.key === 'r') resetControls(camera, controls);
  });

  document.getElementById('btn-play').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('btn-play').textContent = paused ? 'PAUSED' : 'RUN';
  });

  compute();
  updateHUD();
}

function resetControls(camera, controls) {
  state.RPM = 5000;
  state.HV_kV = 25;
  state.coilLoad = 0.5;
  state.steerX = 0;
  state.steerY = 0;
  state.magnetStrength = 1.0;
  state.timeScale = 1;

  const v = (id) => document.getElementById(id);
  v('ctrl-rpm').value = 5000;
  v('ctrl-hv').value = 25;
  v('ctrl-load').value = 50;
  v('ctrl-magnet').value = 100;
  v('ctrl-steerx').value = 0;
  v('ctrl-steery').value = 0;
  v('ctrl-speed').value = 100;
  v('val-rpm').textContent = '5,000';
  v('val-hv').textContent = '25 kV';
  v('val-load').textContent = '50%';
  v('val-magnet').textContent = '1.00x';
  v('val-steerx').textContent = '0.00';
  v('val-steery').textContent = '0.00';
  v('val-speed').textContent = '1.00x';

  paused = false;
  v('btn-play').textContent = 'RUN';

  document.getElementById('btn-orbit').classList.add('active');
  document.getElementById('btn-top').classList.remove('active');
  document.getElementById('btn-side').classList.remove('active');

  camera.position.set(0.45, 0.28, 0.45);
  controls.target.set(0, 0, 0);
  controls.update();

  compute();
  updateHUD();
}

export function isPaused() { return paused; }
