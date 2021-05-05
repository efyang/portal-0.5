/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, WebGLRenderTarget, PerspectiveCamera, Vector3, Vector2 } from 'three';
import { LineBasicMaterial, Line, BufferGeometry, BufferAttribute } from 'three';
import {PointerLockControls} from 'three/examples/jsm/controls/PointerLockControls.js';
import { Crosshair } from 'crosshair'
import { MainScene } from 'scenes';
import {initPhysics} from './physics.js';
import { consts, globals } from 'globals';

const Stats = require("stats.js");
const controls = new PointerLockControls(globals.MAIN_CAMERA, document.body)
// const scene = new MainScene(globals.CANNON_WORLD, globals.CONTROLS);
const scene = new MainScene(controls);

// Set up camera
/*
globals.MAIN_CAMERA.position.set(0, 10, 0);
globals.MAIN_CAMERA.lookAt(new Vector3(0, 0, 0));*/

// add a crosshair to the scene
const crosshair = new Crosshair()

globals.MAIN_CAMERA.add(crosshair);
scene.add(globals.MAIN_CAMERA)

// Set up renderer, canvas, and minor CSS adjustments
globals.RENDERER.setPixelRatio(window.devicePixelRatio);
const canvas = globals.RENDERER.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

// lock camera controls on mouseclick
window.addEventListener( 'click', function () {
    controls.lock();
} );


// window.addEventListener("keydown", (event) => handleKeypress(event, appData), false)
let stats = new Stats();
document.body.appendChild(stats.dom);
// Render loop


function renderPortal(thisIndex, pairIndex) {
    let portal = globals.PORTALS[thisIndex]
    let pairPortal = globals.PORTALS[pairIndex]
    if (portal === null || pairPortal === null) {
        return
    }

    let renderer = globals.RENDERER
    let portalCamera = globals.MAIN_CAMERA.clone()

    // ensure that uniforms and render target are correctly sized
    const { width, height } = renderer.domElement
    portal.mesh.material.uniforms.ww.value = width
    portal.mesh.material.uniforms.wh.value = height
    globals.PORTAL_TARGETS[thisIndex].setSize(width, height)
    globals.PORTAL_TMP_TARGETS[thisIndex].setSize(width, height)

    // stencil optimization - only render parts of scene multiple
    // times when it is going to be viewed by the portal

    renderer.clearStencil()
    renderer.autoClearStencil = false
    renderer.render(portal.mesh, globals.MAIN_CAMERA)

    for (let i = 0; i < consts.RECURSIVE_PORTAL_LEVELS; i++) {
        portal.teleportObject3D(portalCamera)
    }

    renderer.localClippingEnabled = true
    for (let level = 0; level < consts.RECURSIVE_PORTAL_LEVELS; level++) {
        pairPortal.teleportObject3D(portalCamera)
        // necessary so that we properly render recursion (otherwise the other portal might block)
        portal.visible = true
        pairPortal.visible = false
        renderer.clippingPlanes = [portal.plane.clone()]
        renderer.setRenderTarget(globals.PORTAL_TMP_TARGETS[thisIndex])
        renderer.render(scene, portalCamera)

        // need to do the swap operation:
        // https://stackoverflow.com/questions/54048816/how-to-switch-the-texture-of-render-target-in-three-js
        // cannot render to texture while also using texture, so have to create another temp render target
        let swap = globals.PORTAL_TARGETS[thisIndex]
        globals.PORTAL_TARGETS[thisIndex] = globals.PORTAL_TMP_TARGETS[thisIndex]
        globals.PORTAL_TMP_TARGETS[thisIndex] = swap
        portal.mesh.material.uniforms.texture1.value = globals.PORTAL_TARGETS[thisIndex].texture
        portal.mesh.material.needsUpdate = true
    }

    portal.visible = true
    pairPortal.visible = true
}


const onAnimationFrameHandler = (timeStamp) => {
    // controls.update();
    renderPortal(0, 1)
    renderPortal(1, 0)

    // finally, render to screen
    let renderer = globals.RENDERER
    renderer.setRenderTarget(null)
    renderer.localClippingEnabled = false
    renderer.clippingPlanes = []
    renderer.render(scene, globals.MAIN_CAMERA)

    // globals.RENDERER.render(appData.scene, appData.camera);
    stats.update();
    scene.update && scene.update(timeStamp);
    window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerWidth, innerHeight } = window;
    globals.RENDERER.setSize(innerWidth, innerHeight);
    globals.MAIN_CAMERA.aspect = innerWidth / innerHeight;
    globals.MAIN_CAMERA.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);