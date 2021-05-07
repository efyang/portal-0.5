import { Group, Vector3 } from 'three';
import * as THREE from 'three';
import * as CANNON from 'cannon';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import MODEL from './blenderExport.gltf';
import { globals } from 'globals'
import {SkeletonUtils} from 'three/examples/jsm/utils/SkeletonUtils';

class Player extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        this.name = 'Player';
        let mass = 50;

        // Construct the player model 
        // const geometry = new THREE.BoxGeometry(0.5, 2, 0.5);
        // const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        // this.mesh = new THREE.Mesh( geometry, material );
        // this.add(this.mesh);
        // this.meshClone = this.mesh.clone()
        // this.add(this.meshClone)
        // this.meshClone.visible = false

        // adapted from https://sbcode.net/threejs/fbx-animation/
        this.mixers = null;
        this.animationActions = [];
        this.modelReady = false;
        this.lastAction = null;
        this.currAction = null;
        this.mesh = null;
        this.lastTimeStamp = 0;
        const loader = new FBXLoader();

        loader.load('src/components/objects/Player/models/xbot.fbx', (fbx) => {
            fbx.scale.setScalar(0.007);
            this.mixers = new THREE.AnimationMixer(fbx)
            fbx.traverse(c => {
                c.castShadow = true;
            })
            this.mesh = fbx
            this.meshClone = this.mesh.clone()
            this.meshClone.visible = false
            this.add(this.mesh);  
            this.add(this.meshClone)
            
            loader.load('src/components/objects/Player/models/Idle.fbx', (idleAnim) => {
                console.log("loaded idle")
                let animationAction = this.mixers.clipAction(idleAnim.animations[0])
                this.animationActions.push(animationAction)

                loader.load('src/components/objects/Player/models/Jump.fbx', (jumpAnim) => {
                    console.log("loaded jump")
                    let animationAction = this.mixers.clipAction(jumpAnim.animations[0])
                    this.animationActions.push(animationAction)
                
                    loader.load('src/components/objects/Player/models/StationaryRunning.fbx', (runningAnim) => {
                        console.log("loaded running")
                        let animationAction = this.mixers.clipAction(runningAnim.animations[0])
                        this.animationActions.push(animationAction)
                        this.modelReady = true;
                        
                        loader.load('src/components/objects/Player/models/RunningBackward.fbx', (runningAnim) => {
                            console.log("loaded running")
                            let animationAction = this.mixers.clipAction(runningAnim.animations[0])
                            this.animationActions.push(animationAction)
                            this.modelReady = true;

                            loader.load('src/components/objects/Player/models/RightStrafe.fbx', (runningAnim) => {
                                console.log("loaded running")
                                let animationAction = this.mixers.clipAction(runningAnim.animations[0])
                                this.animationActions.push(animationAction)
                                this.modelReady = true;

                                loader.load('src/components/objects/Player/models/LeftStrafe.fbx', (runningAnim) => {
                                    console.log("loaded running")
                                    let animationAction = this.mixers.clipAction(runningAnim.animations[0])
                                    this.animationActions.push(animationAction)
                                    this.modelReady = true;
                                })
                            })
                        })
                    })
                })
            })
        })

        var slipperyMaterial = new CANNON.Material();
        slipperyMaterial.friction = 0.00;

        // define shape
        let physicsShape = new CANNON.Box(new CANNON.Vec3(0.5 / 2, 2 / 2, 0.5 / 2)); 
        // let physicsShape = new CANNON.Box(new CANNON.Vec3(0.5, 2, 0.5)); 

        // define the physical body attributes
        this.physicsBody = new CANNON.Body({ mass: mass, material: slipperyMaterial });
        this.physicsBody.addShape(physicsShape);
        this.physicsBody.position.set(0,5,0);
        this.physicsBody.linearDamping = 0.9;

        // keep the player upright
        this.physicsBody.angularDamping = 1

        // set additional properties
        this.physicsBody.inJump = true

        // construct the physical body
        this.physicsBody.updateMassProperties()
        globals.CANNON_WORLD.addBody(this.physicsBody);
        let physicsBody = this.physicsBody
        parent.addToUpdateList(this);

        // add collision event listener to regulate jumps
        this.physicsBody.addEventListener("collide", function(e){ 
            //let EPS = 0.4
            // console.log(physicsBody.velocity.y)
            //if (Math.abs(physicsBody.velocity.y) <= EPS) {
            this.inJump = false
            //}
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

        let animationIndex = 0

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
            jumpMultiplier = 0.1
        }

        if (!this.physicsBody.inJump) {
            this.physicsBody.linearDamping = 0.999
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
        if (this.mesh) {
            this.mesh.position.copy(this.physicsBody.position).add(new Vector3(0,-1,0))
            this.mesh.quaternion.copy(this.physicsBody.quaternion)
            this.mesh.quaternion.multiply(new THREE.Quaternion(0,50,0)).normalize()

            this.remove(this.meshClone)
            this.meshClone = SkeletonUtils.clone(this.mesh)
            this.add(this.meshClone)
        }

        // set camera position to be at player
        globals.MAIN_CAMERA.position.copy(this.physicsBody.position)

        // handle model movements
        const timeElapsedS = (timeStamp - this.lastTimeStamp) * 0.001;
        this.lastTimeStamp = timeStamp;
        if (this.modelReady) {
            // if (this.physicsBody.inJump) { animationIndex = 1}
            if (this.controller["KeyW"].pressed) { animationIndex = 2}
            if (this.controller["KeyS"].pressed) { animationIndex = 3}
            if (this.controller["KeyD"].pressed) { animationIndex = 4}
            if (this.controller["KeyA"].pressed) { animationIndex = 5}

            let action = this.animationActions[animationIndex];
            this.setAction(action)
            this.mixers.update(timeElapsedS);
        }
    }

    setAction(action) {
        if (action != this.activeAction) {
            this.lastAction = this.activeAction;
            this.activeAction = action;
            let fadeDuration = 0.01
            if (this.lastAction) {
                fadeDuration = 0.8
                this.lastAction.fadeOut(fadeDuration)
            }
            this.activeAction.reset()
            this.activeAction.fadeIn(fadeDuration)
            this.activeAction.play()
        }
    }
}


export default Player;