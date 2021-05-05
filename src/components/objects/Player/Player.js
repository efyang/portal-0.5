import { Group } from 'three';
import * as THREE from 'three';
import * as CANNON from 'cannon';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './blenderExport.gltf';
import { globals } from 'globals'

class Player extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        this.name = 'Player';
        let mass = 50;

        // Construct the player model 
        const geometry = new THREE.BoxGeometry(0.5, 2, 0.5);
        const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        this.playerModel = new THREE.Mesh( geometry, material );
        this.add(this.playerModel);

        // Load object
        // const loader = new GLTFLoader();

        // // this.name = 'Player';
        // loader.load(MODEL, (gltf) => {
        //     // console.log(gltf.scene.children[0])
        //     // this.playerModel = gltf.scene.children[0]
        //     gltf.scene.scale.set(0.2,0.2,0.2) // scale here
        //     this.add(gltf.scene);
        // });

        /*
        // this utility function allows you to use any three.js
        // loader with promises and async/await
        function modelLoader(url) {
            return new Promise((resolve, reject) => {
            loader.load(url, data=> resolve(data), null, reject);
            });
        }

        let scene = this;
        async function main() {
            const gltfData = await modelLoader(URL),
            
            .add(gltf.scene);
            // this.playerModel = this.children[0];

        }
        main().catch(error => {
            console.error(error);
        });
        */

        // console.log(this)
        // this.playerModel = this.children[0];
        // console.log(this.playerModel)

        var slipperyMaterial = new CANNON.Material();
        slipperyMaterial.friction = 0.01;

        // define shape
        let physicsShape = new CANNON.Box(new CANNON.Vec3(0.5 / 2, 2 / 2, 0.5 / 2)); 
        // let physicsShape = new CANNON.Box(new CANNON.Vec3(0.5, 2, 0.5)); 

        // define the physical body attributes
        this.physicsBody = new CANNON.Body({ mass: mass, material: slipperyMaterial });
        this.physicsBody.addShape(physicsShape);
        this.physicsBody.position.set(0,5,0);
        this.physicsBody.linearDamping = 0.6;

        // keep the player upright
        this.physicsBody.angularDamping = 1

        // set additional properties
        this.physicsBody.inJump = false

        // construct the physical body
        this.physicsBody.updateMassProperties()
        globals.CANNON_WORLD.addBody(this.physicsBody);
        let physicsBody = this.physicsBody
        parent.addToUpdateList(this);

        // add collision event listener to regulate jumps
        this.physicsBody.addEventListener("collide", function(e){ 
            let EPS = 0.4
            // console.log(physicsBody.velocity.y)
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

        // define directions
        let cameraDirection = new THREE.Vector3()
        globals.MAIN_CAMERA.getWorldDirection(cameraDirection)
        const up = new THREE.Vector3(0, 1, 0)
        const forward = cameraDirection.projectOnPlane(up).normalize()
        const backward = forward.clone().negate()
        const left = up.clone().cross(forward).normalize()
        const right = left.clone().negate()

        // physics changes while jumping
        let jumpMultiplier = 1
        if (this.physicsBody.inJump) {
            jumpMultiplier = 0.3
        }

        if (!this.physicsBody.inJump) {
            this.physicsBody.linearDamping = 0.8
        } else {
            this.physicsBody.linearDamping = 0.5
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
            // console.log(this.physicsBody.inJump)
            if (!this.physicsBody.inJump) {
                this.physicsBody.inJump = true
                this.physicsBody.applyImpulse(up.clone().multiplyScalar(f * 0.2), this.physicsBody.position)
            }
        }

        // always look where the camera points
        this.physicsBody.quaternion.copy(globals.MAIN_CAMERA.quaternion)
        this.physicsBody.quaternion.x = 0
        this.physicsBody.quaternion.z = 0
        this.physicsBody.quaternion.normalize()

        // copy position and rotation so player model aligns with the physical body
        // if (this.playerModel) {
        //     this.playerModel.position.copy(this.physicsBody.position)
        //     this.playerModel.quaternion.copy(-this.physicsBody.quaternion)
        // }

        this.playerModel.position.copy(this.physicsBody.position)
        this.playerModel.quaternion.copy(this.physicsBody.quaternion)

        // set camera position to be at player
        // globals.MAIN_CAMERA.position.copy(this.physicsBody.position)
        globals.MAIN_CAMERA.position.copy(new THREE.Vector3(0, 10, 0));
    }
}


export default Player;