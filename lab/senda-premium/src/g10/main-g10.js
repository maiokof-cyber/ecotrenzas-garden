import '../g9/g9.css';
import './g10.css';
import {mountGame} from '../g4/GardenG4UI.js';
import {TrackG10PixiScene} from './TrackG10PixiScene.js';
import {TrackG3CanvasScene} from '../g3/TrackG3CanvasScene.js';
import {installG7Sensory} from '../g7/Sensory.mjs';
import {installG8World} from '../g8/WorldUI.mjs';
import {installG9WorldUI} from '../g9/WorldG9UI.js';
import {installG10WorldUI} from './WorldG10UI.js';
// All XP, coins, collection and CRM behavior stays exclusively in inherited systems.
mountGame(TrackG10PixiScene,TrackG3CanvasScene);
const sensory=installG7Sensory();
const world=installG8World();
const g9ui=installG9WorldUI();
const g10ui=installG10WorldUI();
window.__GARDEN_G8_TEST__={snapshot:()=>({world:world.diagnostics(),sound:sensory.diagnostics()})};
window.__GARDEN_G10_TEST__={snapshot:()=>({world:world.diagnostics(),sound:sensory.diagnostics(),g9ui:g9ui.diagnostics(),g10ui:g10ui.diagnostics()})};
