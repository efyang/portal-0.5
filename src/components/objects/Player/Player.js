import { Group, Vector3 } from 'three';
import * as THREE from 'three';
import * as CANNON from 'cannon';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { globals, consts } from 'globals'
import {SkeletonUtils} from 'three/examples/jsm/utils/SkeletonUtils';
import { playSound } from '../../../audio';

class Player extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        this.name = 'Player';
        let mass = 50;

        this.wasInJump = false;
        this.shouldPlayJumpSound = false;
        this.counter = 0;

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
        this.animationActions = {}
        this.modelReady = false;
        this.lastAction = null;
        this.currAction = null;
        this.mesh = null;
        this.lastTimeStamp = 0;
        const loader = new FBXLoader();

        consts.PLAYER_MODEL.then((fbx) => {
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
        }).then(() => {
            let animationPromises = []
            for (let index in consts.PLAYER_ANIMATIONS) {
                const anim = consts.PLAYER_ANIMATIONS[index]
                anim.then((anim) => {
                    const animationAction = this.mixers.clipAction(anim.animations[0])
                    this.animationActions[index] = animationAction
                })
                animationPromises.push(anim)
            }
            Promise.all(animationPromises).then(() => this.modelReady = true)
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
        this.parent = parent
        parent.addToUpdateList(this);

        // normal collision events don't happen consistently - will stop once an object is stable on the ground
        // so need to check contacts to detect if grounded or not
        // https://github.com/schteppe/cannon.js/issues/313

        let upVector = new CANNON.Vec3(0, 1, 0);
        let contactNormal = new CANNON.Vec3(0, 0, 0);
        globals.CANNON_WORLD.addEventListener("postStep", (e) => {
            this.physicsBody.inJump = true;
            if (globals.CANNON_WORLD.contacts.length > 0) {
                for (let contact of globals.CANNON_WORLD.contacts) {
                    if (contact.bi.id == this.physicsBody.id || contact.bj.id == this.physicsBody.id) {
                        // console.log(contact.ni)
                        if(contact.bi.id == this.physicsBody.id) {
                            // contact.ni.negate(contactNormal);
                            contactNormal = -1 * contact.ni
                        } else {
                            // contact.ni.copy(contactNormal);
                            contactNormal = contact.ni
                        }
                        this.physicsBody.inJump = (contactNormal.dot(upVector) <= 0.5);
                    }
                }
            }
        })

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
        // for player sounds
        if (!this.hadCollisions) {
            this.hadCollisions = false
        }

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
            jumpMultiplier = 0.01
        }

        if (!this.physicsBody.inJump) {
            this.physicsBody.linearDamping = 0.999
        } else {
            this.physicsBody.linearDamping = 0.1
        }

        // regulates speed when multiple directions are pressed 
        let movementDirections = this.controller["KeyW"].pressed + this.controller["KeyS"].pressed + this.controller["KeyA"].pressed + this.controller["KeyD"].pressed;
        let movementMultiplier = 1
        if (movementDirections == 2) {
            movementMultiplier = (1 / Math.sqrt(movementDirections))
        }

        // apply forces in WASD directions when pressed
        const f = 25 * this.physicsBody.mass * jumpMultiplier;
        
        // if (this.controller["KeyW"].pressed || this.controller["KeyA"].pressed || this.controller["KeyS"].pressed || this.controller["KeyD"].pressed) { 
        //     if (this.counter % 30 == 0 && !this.physicsBody.inJump) {
        //         this.playWalkingSound()
        //     }
        // }

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

        let shouldJump = false;
        // handle jumping when space bar is pressed
        if (this.controller["Space"].pressed && !this.physicsBody.inJump) {
            shouldJump = true;
        
        }
        // update lastTimeStampInJump
        if (this.wasInJump && !this.physicsBody.inJump) {
            this.playLandingSound()
        }
        this.wasInJump = this.physicsBody.inJump;

        if (shouldJump) {
            this.shouldPlayJumpSound = !this.shouldPlayJumpSound;
            this.physicsBody.inJump = true
            this.physicsBody.applyImpulse(up.clone().multiplyScalar(f * 0.15), this.physicsBody.position)
            if (this.shouldPlayJumpSound && this.physicsBody.inJump) {
                this.playJumpSound()
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
        let action = this.animationActions.ANIM_STANDING_IDLE
        if (this.modelReady) {
            if (this.physicsBody.inJump) {
                action = this.animationActions.ANIM_FALLING_IDLE
            } else if (this.controller["KeyW"].pressed && this.controller["KeyD"].pressed && this.controller["KeyA"].pressed && this.controller["KeyS"].pressed) {
                action = this.animationActions.ANIM_STANDING_IDLE
            } else if (this.controller["KeyW"].pressed && this.controller["KeyS"].pressed) {
                action = this.animationActions.ANIM_STANDING_IDLE
                if (this.controller["KeyD"].pressed) {
                    action = this.animationActions.ANIM_RIGHT_STRAFE
                } else if (this.controller["KeyA"].pressed) {
                    action = this.animationActions.ANIM_LEFT_STRAFE
                }
            } else if (this.controller["KeyA"].pressed && this.controller["KeyD"].pressed) {
                action = this.animationActions.ANIM_STANDING_IDLE
                if (this.controller["KeyW"].pressed) {
                    action = this.animationActions.ANIM_STATIONARY_RUNNING
                } else if (this.controller["KeyS"].pressed) {
                    action = this.animationActions.ANIM_BACKWARD_RUNNING
                }
            } else{
                if (this.controller["KeyW"].pressed) { action = this.animationActions.ANIM_STATIONARY_RUNNING }
                if (this.controller["KeyS"].pressed) { action = this.animationActions.ANIM_BACKWARD_RUNNING}
                if (this.controller["KeyD"].pressed) { action = this.animationActions.ANIM_RIGHT_STRAFE}
                if (this.controller["KeyA"].pressed) { action = this.animationActions.ANIM_LEFT_STRAFE}
            }

            this.setAction(action)
            this.mixers.update(timeElapsedS);
        }

        this.counter += 1;

        // fall respawn
        if (this.physicsBody.position.y < -100) {
            this.physicsBody.position.copy(globals.PLAYER_RESPAWN_POS)
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

    playLandingSound() {
        playSound(consts.LANDING_SOUND, false, 0.1)
    }

    playJumpSound() {
        playSound(consts.JUMP_SOUND, false, 0.05)
    }

    playWalkingSound() {
        playSound(consts.WALKING_SOUND, false, 0.001)
    }
}


export default Player;