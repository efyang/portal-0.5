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

        var regularMaterial = new CANNON.Material();
        regularMaterial.friction = 0.3;

        // define shape
        let physicsShape = new CANNON.Box(new CANNON.Vec3(0.5, 2, 0.5)); 

        // define the physical body attributes
        this.physicsBody = new CANNON.Body({ mass: mass, material: slipperyMaterial });
        // this.physicsBody = new CANNON.Body({ mass: mass, material: regularMaterial });
        this.physicsBody.addShape(physicsShape);
        this.physicsBody.position.set(0,5,0);
        this.physicsBody.linearDamping = 0.6;

        // keep the player upright
        this.physicsBody.angularDamping = 1
        this.physicsBody.inJump = false
        this.physicsBody.updateMassProperties()
        parent.state.cworld.addBody(this.physicsBody);

        let physicsBody = this.physicsBody
        parent.addToUpdateList(this);

        this.physicsBody.addEventListener("collide", function(e){ 
            let EPS = 0.2
            if (Math.abs(physicsBody.velocity.y) > EPS) {return}
            this.inJump = false
        } );

        // for movement
        this.controller = {
            "KeyW": {pressed: false},
            "KeyS": {pressed: false},
            "KeyA": {pressed: false},
            "KeyD": {pressed: false},
            "Space": {pressed: false},
        }

        window.addEventListener("keydown", (e) => {
            if(this.controller[e.code]){
                this.controller[e.code].pressed = true;
            }
        })
        window.addEventListener("keyup", (e) => {
            if(this.controller[e.code]){
                this.controller[e.code].pressed = false;
            }
        })

    }

    update(timeStamp) {
        // handle movement
        const up = new THREE.Vector3(0, 1, 0)
        let cameraDirection = new THREE.Vector3()
        window.camera.getWorldDirection(cameraDirection)
        const forward = cameraDirection.projectOnPlane(up).normalize()
        const backward = forward.clone().negate()
        const left = up.clone().cross(forward).normalize()
        const right = left.clone().negate()

        let jumpMultiplier = 1
        if (this.physicsBody.inJump) {
            jumpMultiplier = 0.5
        }

        // regulates speed when multiple directions are pressed 
        let movementDirections = 0
        Object.keys(this.controller).forEach(key=> {
            if (this.controller[key].pressed) {
                movementDirections += 1;
            }
        })
        if (this.controller["Space"].pressed) {
            movementDirections -= 1;
        }
        let movementMultiplier = 1
        if (movementDirections > 0) {
            movementMultiplier = (1 / Math.sqrt(movementDirections))
        }

        const f = 50 * this.physicsBody.mass * jumpMultiplier * movementMultiplier;
        
        if (this.controller["KeyW"].pressed) {
            this.physicsBody.applyForce(forward.clone().multiplyScalar(f), this.physicsBody.position)
        }
        if (this.controller["KeyS"].pressed) {
            this.physicsBody.applyForce(backward.clone().multiplyScalar(f), this.physicsBody.position)
        }
        if (this.controller["KeyA"].pressed) {
            this.physicsBody.applyForce(left.clone().multiplyScalar(f), this.physicsBody.position)
        }
        if (this.controller["KeyD"].pressed) {
            this.physicsBody.applyForce(right.clone().multiplyScalar(f), this.physicsBody.position)
        }
        if (this.controller["Space"].pressed) {
            let EPS = 0.1
            if (this.physicsBody.inJump) {return} 
            this.physicsBody.inJump = true
            this.physicsBody.applyImpulse(up.clone().multiplyScalar(f * 0.10), this.physicsBody.position)
        }

        let v = this.physicsBody.velocity.clone()
        // always look where the camera points
        this.physicsBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), window.camera.quaternion.y);

        // this.physicsBody.quaternion.copy(window.camera.quaternion)
        // this.physicsBody.quaternion.x = 0
        // this.physicsBody.quaternion.z = 0

        // copy position and rotation
        this.sphere.position.copy(this.physicsBody.position)
        this.sphere.quaternion.copy(this.physicsBody.quaternion)
        // set camera position to be at player
        // window.camera.position.copy(this.physicsBody.position)

        this.physicsBody.velocity = v

        if (!this.physicsBody.inJump) {
            this.physicsBody.linearDamping = 0.8
        } else {
            this.physicsBody.linearDamping = 0.3
        }
    }
}

export default Player;