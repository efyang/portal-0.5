import { Group } from 'three';
import * as THREE from 'three';
import * as CANNON from 'cannon';

class Player extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        this.name = 'Player';

        let mass = 50, radius = 1.3;

        const geometry = new THREE.BoxGeometry(0.5, 2, 0.5);
        const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        this.sphere = new THREE.Mesh( geometry, material );
        this.add(this.sphere)

        var slipperyMaterial = new CANNON.Material();
        slipperyMaterial.friction = 0.01;

        // let physicsMaterial = new CANNON.Material({friction: 0.0});
        let sphereShape = new CANNON.Box(new CANNON.Vec3(0.5, 2, 0.5));
        // let sphereShape = new CANNON.Sphere(1);
        //this.sphereBody = new CANNON.Body({ mass: mass, material: physicsMaterial });
        this.sphereBody = new CANNON.Body({ mass: mass, material: slipperyMaterial });
        // this.sphereBody = new CANNON.Body({ mass: mass});
        this.sphereBody.addShape(sphereShape);
        this.sphereBody.position.set(0,5,0);
        // this.sphereBody.linearDamping = 0.9;
        this.sphereBody.linearDamping = 0.6;
        // keep the player upright
        this.sphereBody.angularDamping = 1
        this.sphereBody.inJump = false
        this.sphereBody.updateMassProperties()
        parent.state.cworld.addBody(this.sphereBody);

        let sphereBody = this.sphereBody
        parent.addToUpdateList(this);

        // setup ev handler
        window.addEventListener("keydown", (e) => this.handleKeypress(e), false)

        this.sphereBody.addEventListener("collide", function(e){ 
            let EPS = 0.2
            if (Math.abs(sphereBody.velocity.y) > EPS) {return}
            this.inJump = false
        } );
    }

    update(timeStamp) {
        let v = this.sphereBody.velocity.clone()
        // always look where the camera points
        this.sphereBody.quaternion.copy(window.camera.quaternion)
        this.sphereBody.quaternion.x = 0
        this.sphereBody.quaternion.z = 0
        // copy position and rotation
        this.sphere.position.copy(this.sphereBody.position)
        this.sphere.quaternion.copy(this.sphereBody.quaternion)
        // set camera position to be at player
        window.camera.position.copy(this.sphereBody.position)

        this.sphereBody.velocity = v

        if (!this.sphereBody.inJump) {
            this.sphereBody.linearDamping = 0.6
        } else {
            this.sphereBody.linearDamping = 0.2
        }
    }

    handleKeypress(event) {
        // Ignore keypresses typed into a text box
        if (event.target.tagName === 'INPUT') {
            return;
        }

        // The vectors tom which each key code in this handler maps. (Change these if you like)
        const up = new THREE.Vector3(0, 1, 0)
        let cameraDirection = new THREE.Vector3()
        window.camera.getWorldDirection(cameraDirection)
        const forward = cameraDirection.projectOnPlane(up).normalize()
        const backward = forward.clone().negate()
        const left = up.clone().cross(forward).normalize()
        const right = left.clone().negate()

        let jumpMultiplier = 1
        if (this.sphereBody.inJump) {
            jumpMultiplier = 0.5
        }
        const v = 50 * this.sphereBody.mass * jumpMultiplier
        switch (event.code) {
            case 'KeyW':
                this.sphereBody.applyForce(forward.clone().multiplyScalar(v), this.sphereBody.position)
                break
            case 'KeyS':
                this.sphereBody.applyForce(backward.clone().multiplyScalar(v), this.sphereBody.position)
                break
            case 'KeyA':
                this.sphereBody.applyForce(left.clone().multiplyScalar(v), this.sphereBody.position)
                break
            case 'KeyD':
                this.sphereBody.applyForce(right.clone().multiplyScalar(v), this.sphereBody.position)
                break
            case 'Space':
                let EPS = 0.1
                if (this.sphereBody.inJump) {return}
                this.sphereBody.inJump = true
                this.sphereBody.applyImpulse(up.clone().multiplyScalar(v * 0.15), this.sphereBody.position)
                break
        }
    }
}

export default Player;