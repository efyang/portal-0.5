import { Group } from 'three';
import * as THREE from 'three';
import * as CANNON from 'cannon';

class Player extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        this.name = 'Player';

        let mass = 5, radius = 1.3;

        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        this.sphere = new THREE.Mesh( geometry, material );
        this.add(this.sphere)

        let sphereShape = new CANNON.Sphere(radius);
        this.sphereBody = new CANNON.Body({ mass: mass });
        this.sphereBody.addShape(sphereShape);
        this.sphereBody.position.set(0,5,0);
        this.sphereBody.linearDamping = 0.1;
        parent.state.cworld.addBody(this.sphereBody);

        parent.addToUpdateList(this);

        // setup ev handler
        window.addEventListener("keydown", (e) => this.handleKeypress(e), false)
    }

    update(timeStamp) {
        // copy position
        this.sphere.position.copy(this.sphereBody.position)
        // set camera position to be at player
        window.camera.position.copy(this.sphereBody.position)
    }

    handleKeypress(event) {
        // Ignore keypresses typed into a text box
        if (event.target.tagName === 'INPUT') {
            return;
        }

        // The vectors tom which each key code in this handler maps. (Change these if you like)
        const keys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space']
        if (!(keys.includes(event.code))) return;

        const up = new THREE.Vector3(0, 1, 0)
        let cameraDirection = new THREE.Vector3()
        window.camera.getWorldDirection(cameraDirection)
        const forward = cameraDirection.projectOnPlane(up).normalize()
        const backward = forward.clone().negate()
        const left = up.clone().cross(forward).normalize()
        const right = left.clone().negate()

        const keyMap = {};
        keyMap['KeyW'] = forward
        keyMap['KeyS'] = backward
        keyMap['KeyA'] = left
        keyMap['KeyD'] = right
        keyMap['Space'] = up

        const v = 10

        this.sphereBody.applyForce(keyMap[event.code].clone().multiplyScalar(v), this.sphereBody.position)
    }
}

export default Player;