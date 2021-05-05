import * as physics from '../physics'
import { WebGLRenderer, WebGLRenderTarget, PerspectiveCamera } from 'three';

export default {

    /***********************************************************
    * DEBUGGING
    ***********************************************************/
    DEBUG: true,

    /***********************************************************
    * WORLD
    ***********************************************************/
    MAIN_CAMERA: new PerspectiveCamera(),
    RENDERER: new WebGLRenderer({ antialias: true }),
    PORTAL_TARGETS: [new WebGLRenderTarget(1, 1), new WebGLRenderTarget(1, 1)],
    PORTAL_TMP_TARGETS: [new WebGLRenderTarget(1, 1), new WebGLRenderTarget(1, 1)],
    PORTALS: [null, null],
    CANNON_WORLD: physics.initPhysics(),
}
