import './g9.css';
import { mountGame } from '../g4/GardenG4UI.js';
import { TrackG9PixiScene } from './TrackG9PixiScene.js';
import { TrackG3CanvasScene } from '../g3/TrackG3CanvasScene.js';
import { installG7Sensory } from '../g7/Sensory.mjs';
import { installG8World } from '../g8/WorldUI.mjs';
import { installG9WorldUI } from './WorldG9UI.js';
// Shared gameplay, atlas and G6 cards. Sprite layers have NO currency or sales authority.
mountGame(TrackG9PixiScene,TrackG3CanvasScene);
const sensory=installG7Sensory();
const world=installG8World();
const artUI=installG9WorldUI();
window.__GARDEN_G8_TEST__={snapshot:()=>({world:world.diagnostics(),sound:sensory.diagnostics()})};
window.__GARDEN_G9_TEST__={snapshot:()=>({world:world.diagnostics(),sound:sensory.diagnostics(),artUI:artUI.diagnostics()})};
