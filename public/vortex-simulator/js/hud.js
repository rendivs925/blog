import { state } from './physics.js';

export function updateHUD() {
  const fmt = (n, d) => n.toFixed(d);

  document.getElementById('hud-lift').textContent = fmt(state.F_lift, 2) + ' N';
  document.getElementById('hud-power').textContent = fmt(state.P_harvest / 1000, 2) + ' kW';
  document.getElementById('hud-cop').textContent = fmt(state.COP, 2);
  document.getElementById('hud-dp').textContent = fmt(state.deltaP, 1) + ' Pa';
  document.getElementById('hud-rpm').textContent = Math.round(state.RPM) + ' rpm';
  document.getElementById('hud-hv').textContent = fmt(state.HV_kV, 1) + ' kV';

  const vortexEl = document.getElementById('hud-vortex');
  if (!state.vortexEstablished) {
    vortexEl.textContent = '—';
    vortexEl.style.color = '#b06040';
  } else {
    const pct = Math.round(state.vortexStability * 100);
    vortexEl.textContent = pct + '%';
    vortexEl.style.color = `hsl(${120 * pct / 100}, 50%, 55%)`;
  }

  document.getElementById('hud-input').textContent = fmt(state.P_motor + state.P_HV, 1) + ' W';
  document.getElementById('hud-loss').textContent = fmt(state.P_loss, 1) + ' W';
}
