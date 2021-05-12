import * as physics from '../physics'
import { WebGLRenderer, WebGLRenderTarget, PerspectiveCamera, AudioListener, AudioLoader, Vector3 } from 'three';
import {PointerLockControls} from 'three/examples/jsm/controls/PointerLockControls.js';

const camera = new PerspectiveCamera();

export default {
    N_ASSETS_LOADED: 0,
     /***********************************************************
    * PORTALS
    ***********************************************************/
    PORTAL_RECURSION_LEVELS: 7,

    /***********************************************************
    * DEBUGGING
    ***********************************************************/
    DEBUG: false,

    /***********************************************************
    * WORLD
    ***********************************************************/
    MAIN_CAMERA: camera,
    PORTAL_TARGETS: [new WebGLRenderTarget(1, 1), new WebGLRenderTarget(1, 1)],
    PORTAL_TMP_TARGETS: [new WebGLRenderTarget(1, 1), new WebGLRenderTarget(1, 1)],
    PORTALS: [null, null],
    CANNON_WORLD: physics.initPhysics(),
    CONTROLS: new PointerLockControls(camera, document.body),
    BG_PLAYER: null,
    PLAYER_RESPAWN_POS: new Vector3(0, 5, 0),

    /***********************************************************
    * AUDIO
    ***********************************************************/
    LISTENER: new AudioListener(),
    AUDIO_LOADER: new AudioLoader(),
}
