import * as THREE from 'three';
import { scene, camera, renderer, resizeRenderer, createLights, initOrbitControls, getOrbitControls } from './scene.js';
import { createScenery } from './entities/scenery.js';
import { createWaterfall, updateWaterfall } from './entities/waterfall.js';
import { initControls } from './systems/controls.js';
import { initGame, updateGame } from './systems/game.js';
import { initDevTools } from './systems/dev.js';
import * as TWEEN from 'tween';

// --- SCENE SETUP ---
const scenery = createScenery();
scene.add(scenery);
const waterfall = createWaterfall();
scene.add(waterfall);
createLights(scene);

// --- INITIALIZE SYSTEMS ---
initDevTools(scene);
initGame();
initControls(scene, camera);

// --- RENDERER & RESIZE ---
import { mountRenderer } from './scene.js';
mountRenderer(document.getElementById('game-container'));
window.addEventListener('resize', resizeRenderer);

// --- GAME LOOP ---
function animate() {
    requestAnimationFrame(animate); 
    
    const controls = getOrbitControls();
    if (controls?.enabled) {
        controls.update();
    }

    updateWaterfall(waterfall);
    updateGame();
    TWEEN.update(performance.now()); // drive tween-based animations with timestamp

    renderer.render(scene, camera);
}

// Start the animation loop
animate();

/* Tap To Play overlay interaction */
const overlay = document.getElementById('tap-start-overlay');
async function requestAnyFullscreen(el) {
  const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if (rfs) { try { await rfs.call(el); return true; } catch {} }
  return false;
}
function isFs() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}
function enterImmersiveFallback() {
  document.documentElement.classList.add('app-immersive');
  document.body.classList.add('app-immersive');
  document.getElementById('game-container')?.classList.add('app-immersive');
  document.getElementById('ui-container')?.classList.add('app-immersive');
  setTimeout(()=>{ try { window.scrollTo(0,1); } catch {} }, 50);
}
const tryFS = async () => {
  const targets = [document.documentElement, document.body, document.getElementById('game-container')].filter(Boolean);
  for (const t of targets) { if (await requestAnyFullscreen(t)) break; }
  if (!isFs()) enterImmersiveFallback();
};
const dismissOverlay = async () => {
  await tryFS();
  overlay?.classList.add('hidden');
};
overlay?.addEventListener('click', dismissOverlay, { once: true });
overlay?.addEventListener('touchstart', (e)=>{ e.preventDefault(); dismissOverlay(); }, { once: true, passive: false });