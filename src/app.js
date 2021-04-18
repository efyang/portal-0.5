/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3 } from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {PointerLockControls} from 'three/examples/jsm/controls/PointerLockControls.js';
import { MainScene } from 'scenes';
import {initPhysics} from './physics.js';

class AppData {
    constructor() {
        // initialize physics
        this.cworld = initPhysics();

        // Initialize core ThreeJS components
        this.scene = new MainScene(this.cworld);
        this.camera = new PerspectiveCamera();
        window.camera = this.camera
        this.renderer = new WebGLRenderer({ antialias: true });
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
    appData.renderer.render(appData.scene, appData.camera);
    appData.scene.update && appData.scene.update(timeStamp);
    window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    appData.renderer.setSize(innerWidth, innerHeight);
    appData.camera.aspect = innerWidth / innerHeight;
    appData.camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);