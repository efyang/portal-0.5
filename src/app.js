/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, WebGLRenderTarget, PerspectiveCamera, Vector3, Vector2 } from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {PointerLockControls} from 'three/examples/jsm/controls/PointerLockControls.js';
import { MainScene } from 'scenes';
import {initPhysics} from './physics.js';

class AppData {
    constructor() {
        // initialize physics
        this.cworld = initPhysics();

        // Initialize core ThreeJS components
        this.camera = new PerspectiveCamera();
        window.camera = this.camera
        this.renderer = new WebGLRenderer({ antialias: true });

        let screenSize = new Vector2()
        this.renderer.getSize(screenSize)
        const width = screenSize.x
        const height = screenSize.y
        this.portal1Target = new WebGLRenderTarget(width, height)
        this.portal2Target = new WebGLRenderTarget(width, height)

        this.scene = new MainScene(this.cworld, this.portal1Target, this.portal2Target);
    }
}

const appData = new AppData()

// Set up camera
appData.camera.position.set(0, 10, 0);
appData.camera.lookAt(new Vector3(0, 0, 0));

// Set up renderer, canvas, and minor CSS adjustments
appData.renderer.setPixelRatio(window.devicePixelRatio);
const canvas = appData.renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

// Set up controls
const controls = new PointerLockControls(appData.camera, document.body);
window.addEventListener( 'click', function () {
    controls.lock();
} );
// controls.lock();

// window.addEventListener("keydown", (event) => handleKeypress(event, appData), false)

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    // controls.update();
    let renderer = appData.renderer
    let portal1Camera = window.camera.clone()
    let portal2Camera = window.camera.clone()

    const { width, height } = appData.renderer.domElement;
    appData.scene.portal1.mesh.material.uniforms.ww.value = width
    appData.scene.portal1.mesh.material.uniforms.wh.value = height
    appData.scene.portal2.mesh.material.uniforms.ww.value = width
    appData.scene.portal2.mesh.material.uniforms.wh.value = height

    appData.scene.portal1.mesh.material.colorWrite = false
    appData.scene.portal2.mesh.material.colorWrite = false
    appData.scene.portal1.teleportObject3D(portal1Camera)
    appData.scene.portal2.teleportObject3D(portal2Camera)

    // render the per-camera views
    renderer.localClippingEnabled = true
    renderer.setRenderTarget(appData.portal1Target)
    renderer.clippingPlanes = [appData.scene.portal2.plane.clone()]
    renderer.render(appData.scene, portal1Camera)
    renderer.setRenderTarget(appData.portal2Target)
    renderer.clippingPlanes = [appData.scene.portal1.plane.clone()]
    renderer.render(appData.scene, portal2Camera)

    appData.scene.portal1.mesh.material.colorWrite = true
    appData.scene.portal2.mesh.material.colorWrite = true

    /*
    // try to render another level of portal 2
    renderer.setRenderTarget(appData.portal2Target)
    renderer.clippingPlanes = [appData.scene.portal1.plane.clone()]
    renderer.render(appData.scene, portal2Camera)*/

    // finally, render to screen
    renderer.setRenderTarget(null)
    renderer.localClippingEnabled = false
    renderer.clippingPlanes = []
    renderer.render(appData.scene, window.camera)

    // appData.renderer.render(appData.scene, appData.camera);
    appData.scene.update && appData.scene.update(timeStamp);
    window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerWidth, innerHeight } = window;
    appData.renderer.setSize(innerWidth, innerHeight);
    appData.portal1Target.setSize(innerWidth, innerHeight);
    appData.portal2Target.setSize(innerWidth, innerHeight);
    appData.camera.aspect = innerWidth / innerHeight;
    appData.camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);