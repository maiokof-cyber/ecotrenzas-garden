import './g7.css';
import {mountGame} from '../g4/GardenG4UI.js';
import {TrackG3PixiScene} from '../g3/TrackG3PixiScene.js';
import {TrackG3CanvasScene} from '../g3/TrackG3CanvasScene.js';
import {installG7Sensory} from './Sensory.mjs';
// Preserve the certified G6 game engine, cards and Pixi renderer unchanged.
mountGame(TrackG3PixiScene,TrackG3CanvasScene);
const sensory=installG7Sensory();
window.__GARDEN_G7_TEST__={snapshot:()=>sensory.diagnostics()};
