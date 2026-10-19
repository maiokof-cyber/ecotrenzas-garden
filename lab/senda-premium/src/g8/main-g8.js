import './g8.css';
import {mountGame} from '../g4/GardenG4UI.js';
import {TrackG8PixiScene} from './TrackG8PixiScene.js';
import {TrackG3CanvasScene} from '../g3/TrackG3CanvasScene.js';
import {installG7Sensory} from '../g7/Sensory.mjs';
import {installG8World} from './WorldUI.mjs';
// Engine and economy identical to certified G7. Depth effects are isolated in scene/UI layers.
mountGame(TrackG8PixiScene,TrackG3CanvasScene);
const sensory=installG7Sensory();
const world=installG8World();
window.__GARDEN_G7_TEST__={snapshot:()=>sensory.diagnostics()};
window.__GARDEN_G8_TEST__={snapshot:()=>({world:world.diagnostics(),sound:sensory.diagnostics()})};
