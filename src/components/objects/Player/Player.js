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
        this.playerModel = new THREE.Mesh( geometry, material );
        this.add(this.playerModel)

        var slipperyMaterial = new CANNON.Material();
        slipperyMaterial.friction = 0.01;

        var regularMaterial = new CANNON.Material();
        regularMaterial.friction = 0.05;

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

        // add collision event listener to regulate jumps
        this.physicsBody.addEventListener("collide", function(e){ 
            let EPS = 0.4
            if (Math.abs(physicsBody.velocity.y) <= EPS) {
                this.inJump = false
            }
        } );

        // for movement
        this.controller = {
            "KeyW": {pressed: false},
            "KeyS": {pressed: false},
            "KeyA": {pressed: false},
            "KeyD": {pressed: false},
            "Space": {pressed: false},
        }

        // handlers to detect movement using WASD
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

    // updates performed at each timestep
    update(timeStamp) {

        // update movement
        const up = new THREE.Vector3(0, 1, 0)
        let cameraDirection = new THREE.Vector3()
        window.camera.getWorldDirection(cameraDirection)
        const forward = cameraDirection.projectOnPlane(up).normalize()
        const backward = forward.clone().negate()
        const left = up.clone().cross(forward).normalize()
        const right = left.clone().negate()

        let jumpMultiplier = 1
        if (this.physicsBody.inJump) {
            jumpMultiplier = 0.4
        }

        // regulates speed when multiple directions are pressed 
        let movementDirections = this.controller["KeyW"].pressed + this.controller["KeyS"].pressed + this.controller["KeyA"].pressed + this.controller["KeyD"].pressed;
        let movementMultiplier = 1
        if (movementDirections == 2) {
            movementMultiplier = (1 / Math.sqrt(movementDirections))
        }

        // apply forces in WASD directions when pressed
        const f = 25 * this.physicsBody.mass * jumpMultiplier;
        
        if (this.controller["KeyW"].pressed) {
            this.physicsBody.applyForce(forward.clone().multiplyScalar(f * movementMultiplier), this.physicsBody.position)
        }
        if (this.controller["KeyS"].pressed) {
            this.physicsBody.applyForce(backward.clone().multiplyScalar(f * movementMultiplier), this.physicsBody.position)
        }
        if (this.controller["KeyA"].pressed) {
            this.physicsBody.applyForce(left.clone().multiplyScalar(f * movementMultiplier), this.physicsBody.position)
        }
        if (this.controller["KeyD"].pressed) {
            this.physicsBody.applyForce(right.clone().multiplyScalar(f * movementMultiplier), this.physicsBody.position)
        }

        // handle jumping when space bar is pressed
        if (this.controller["Space"].pressed) {
            if (!this.physicsBody.inJump) {
                this.physicsBody.inJump = true
                this.physicsBody.applyImpulse(up.clone().multiplyScalar(f * 0.2), this.physicsBody.position)
            }
        }

        let v = this.physicsBody.velocity.clone()
        // always look where the camera points
        this.physicsBody.quaternion.copy(window.camera.quaternion)
        this.physicsBody.quaternion.x = 0
        this.physicsBody.quaternion.z = 0
        this.physicsBody.quaternion.normalize()

        // copy position and rotation so player model aligns with the physical body
        this.playerModel.position.copy(this.physicsBody.position)
        this.playerModel.quaternion.copy(this.physicsBody.quaternion)

        // set camera position to be at player
        window.camera.position.copy(this.physicsBody.position)

        this.physicsBody.velocity = v

        if (!this.physicsBody.inJump) {
            this.physicsBody.linearDamping = 0.8
        } else {
            this.physicsBody.linearDamping = 0.3
        }
    }
}

export default Player;