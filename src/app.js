/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { Crosshair } from 'crosshair'
import { MainScene } from 'scenes';
import { consts, globals } from 'globals';
import BackgroundMP3 from '../assets/sounds/BackgroundMusic.mp3'
import { Audio } from 'three';

const Stats = require("stats.js");
const scene = new MainScene();

// add a crosshair to the scene
const crosshair = new Crosshair()
globals.MAIN_CAMERA.add(crosshair);

// create a global audio source
const sound = new Audio( globals.LISTENER );

// load a sound and set it as the Audio object's buffer
globals.AUDIO_LOADER.load( BackgroundMP3, function( buffer ) {
    sound.setBuffer( buffer );
    sound.setLoop( true );
    sound.setVolume( 0.1 );
    sound.play();
});

globals.MAIN_CAMERA.add( globals.LISTENER );
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
    globals.CONTROLS.lock();
} );


// window.addEventListener("keydown", (event) => handleKeypress(event, appData), false)
let stats = new Stats();
document.body.appendChild(stats.dom);
// Render loop


function renderPortal(thisIndex, pairIndex) {
    if (globals.PORTALS[thisIndex] === null || globals.PORTALS[pairIndex] === null) {
        return
    }

    let renderer = globals.RENDERER
    let portalCamera = globals.MAIN_CAMERA.clone()

    // ensure that uniforms and render target are correctly sized
    const { width, height } = renderer.domElement
    globals.PORTALS[thisIndex].mesh.material.uniforms.ww.value = width
    globals.PORTALS[thisIndex].mesh.material.uniforms.wh.value = height
    globals.PORTAL_TARGETS[thisIndex].setSize(width, height)
    globals.PORTAL_TMP_TARGETS[thisIndex].setSize(width, height)

    for (let i = 0; i < globals.PORTAL_RECURSION_LEVELS; i++) {
        globals.PORTALS[thisIndex].teleportObject3D(portalCamera)
    }

    // hide the portal for the farthest iteration - texture is currently garbage
    globals.PORTALS[thisIndex].visible = false
    globals.PORTALS[pairIndex].visible = false
    renderer.localClippingEnabled = true
    for (let level = 0; level < globals.PORTAL_RECURSION_LEVELS; level++) {
        // necessary so that we properly render recursion (otherwise the other portal might block)
        renderer.clippingPlanes = [globals.PORTALS[pairIndex].plane.clone()]
        renderer.setRenderTarget(globals.PORTAL_TMP_TARGETS[thisIndex])
        renderer.render(scene, portalCamera)

        // need to do the swap operation:
        // https://stackoverflow.com/questions/54048816/how-to-switch-the-texture-of-render-target-in-three-js
        // cannot render to texture while also using texture, so have to create another temp render target
        let swap = globals.PORTAL_TARGETS[thisIndex]
        globals.PORTAL_TARGETS[thisIndex] = globals.PORTAL_TMP_TARGETS[thisIndex]
        globals.PORTAL_TMP_TARGETS[thisIndex] = swap
        globals.PORTALS[thisIndex].mesh.material.uniforms.texture1.value = globals.PORTAL_TARGETS[thisIndex].texture
        globals.PORTALS[pairIndex].teleportObject3D(portalCamera)
        
        // show this portal to itself on subsequent iterations
        globals.PORTALS[thisIndex].visible = true
    }

    globals.PORTALS[thisIndex].visible = true
    globals.PORTALS[pairIndex].visible = true
}

const onAnimationFrameHandler = (timeStamp) => {
    let renderer = globals.RENDERER

    // don't show the crosshair when rendering portals
    crosshair.visible = false

    // only show player model when rendering portals
    // don't show the clone model when rendering portals
    let cloneVisible = false
    if (globals.PLAYER && globals.PLAYER.mesh) {
        globals.PLAYER.mesh.visible = true
        cloneVisible = globals.PLAYER.meshClone.visible
        globals.PLAYER.meshClone.visible = false
    }

    // stencil optimization - only render parts of scene multiple
    // times when it is going to be viewed by the portal
    renderer.clearStencil()
    renderer.autoClearStencil = false
    if (globals.PORTALS[0])
        renderer.render(globals.PORTALS[0].mesh, globals.MAIN_CAMERA)
    if (globals.PORTALS[1])
        renderer.render(globals.PORTALS[1].mesh, globals.MAIN_CAMERA)
    renderPortal(0, 1)
    renderPortal(1, 0)

    crosshair.visible = true
    if (globals.PLAYER && globals.PLAYER.mesh) {
        globals.PLAYER.mesh.visible = false
        globals.PLAYER.meshClone.visible = cloneVisible
    }

    if (globals.PORTALS[0] === null && globals.PORTALS[1] !== null) {
        globals.PORTALS[1].mesh.visible = false
    }
    if (globals.PORTALS[0] !== null && globals.PORTALS[1] === null) {
        globals.PORTALS[0].mesh.visible = false
    }
    if (globals.PORTALS[0] !== null && globals.PORTALS[1] !== null) {
        globals.PORTALS[0].mesh.visible = true
        globals.PORTALS[1].mesh.visible = true
    }

    // handle debug visibility
    if (globals.PORTALS[0]) {
        globals.PORTALS[0].debugMeshes.visible = globals.DEBUG
    }
    if (globals.PORTALS[1]) {
        globals.PORTALS[1].debugMeshes.visible = globals.DEBUG
    }

    // finally, render to screen
    renderer.setRenderTarget(null)
    renderer.localClippingEnabled = false
    renderer.clippingPlanes = []
    renderer.render(scene, globals.MAIN_CAMERA)

    // globals.RENDERER.render(appData.scene, appData.camera);
    stats.update();
    scene.update && scene.update(timeStamp);

    const timeStep = 1/60
    globals.CANNON_WORLD.step(timeStep)
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