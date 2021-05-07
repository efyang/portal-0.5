import { Group, Vector3, Audio } from 'three';
import * as THREE from 'three';
import * as CANNON from 'cannon';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { globals } from 'globals'
import {SkeletonUtils} from 'three/examples/jsm/utils/SkeletonUtils';
import JumpGruntMP3 from '../../../../assets/sounds/JumpGrunt.mp3'
import LandingMP3 from '../../../../assets/sounds/Landing.mp3'
import WalkingMP3 from '../../../../assets/sounds/Walking.mp3'

class Player extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        this.name = 'Player';
        let mass = 50;

        this.lastTimeStampInJump = false;
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
            
            loader.load('src/components/objects/Player/models/StandingIdle.fbx', (idleAnim) => {
                let animationAction = this.mixers.clipAction(idleAnim.animations[0])
                this.animationActions.push(animationAction)

                loader.load('src/components/objects/Player/models/Jump.fbx', (jumpAnim) => {
                    let animationAction = this.mixers.clipAction(jumpAnim.animations[0])
                    this.animationActions.push(animationAction)
                
                    loader.load('src/components/objects/Player/models/StationaryRunning.fbx', (runningAnim) => {
                        let animationAction = this.mixers.clipAction(runningAnim.animations[0])
                        this.animationActions.push(animationAction)
                        
                        loader.load('src/components/objects/Player/models/RunningBackward.fbx', (runningAnim) => {
                            let animationAction = this.mixers.clipAction(runningAnim.animations[0])
                            this.animationActions.push(animationAction)

                            loader.load('src/components/objects/Player/models/RightStrafe.fbx', (runningAnim) => {
                                let animationAction = this.mixers.clipAction(runningAnim.animations[0])
                                this.animationActions.push(animationAction)

                                loader.load('src/components/objects/Player/models/LeftStrafe.fbx', (runningAnim) => {
                                    let animationAction = this.mixers.clipAction(runningAnim.animations[0])
                                    this.animationActions.push(animationAction)

                                    loader.load('src/components/objects/Player/models/FallingIdle.fbx', (runningAnim) => {
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

        // normal collision events don't happen consistently - will stop once an object is stable on the ground
        // so need to check contacts to detect if grounded or not
        // https://github.com/schteppe/cannon.js/issues/313

        let upVector = new CANNON.Vec3(0, 1, 0);
        let contactNormal = new CANNON.Vec3(0, 0, 0);
        globals.CANNON_WORLD.addEventListener("postStep", (e) => {
            this.physicsBody.inJump = true
            if (globals.CANNON_WORLD.contacts.length > 0) {
                for (let contact of globals.CANNON_WORLD.contacts) {
                    // console.log(contact)
                    if (contact.bi.id == this.physicsBody.id || contact.bj.id == this.physicsBody.id) {
                        this.physicsBody.inJump = false
                        if(contact.bi.id == this.physicsBody.id) {
                            contact.ni.negate(contactNormal);
                        } else {
                            contact.ni.copy(contactNormal);
                        }
                        this.physicsBody.inJump = contactNormal.dot(upVector) <= 0.5;
                        
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
        const JumpSound = new Audio( globals.LISTENER );
        const LandingSound = new Audio( globals.LISTENER );
        const WalkingSound = new Audio( globals.LISTENER );

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
        
        // if (this.controller["KeyW"].pressed || this.controller["KeyA"].pressed || this.controller["KeyS"].pressed || this.controller["KeyD"].pressed) { 
        //     if (this.counter % 30 == 0 && !this.physicsBody.inJump) {
        //         this.playWalkingSound(WalkingSound)
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

        // handle jumping when space bar is pressed
        if (this.controller["Space"].pressed && !this.physicsBody.inJump) {
            this.physicsBody.inJump = true
            this.physicsBody.applyImpulse(up.clone().multiplyScalar(f * 0.15), this.physicsBody.position)
            // if (!this.lastTimeStampInJump && this.physicsBody.inJump) {
            //     this.playJumpSound(JumpSound)
            // }
            this.playJumpSound(JumpSound)
            console.log("HERE")
        }
        // update lastTimeStampInJump
        if (this.lastTimeStampInJump && !this.physicsBody.inJump) {
            this.playLandingSound(LandingSound)
        }
        this.lastTimeStampInJump = this.physicsBody.inJump;

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
        let animationIndex = 0
        if (this.modelReady) {
            if (this.physicsBody.inJump) {
                animationIndex = 6;
            } else if (this.controller["KeyW"].pressed && this.controller["KeyD"].pressed && this.controller["KeyA"].pressed && this.controller["KeyS"].pressed) {
                animationIndex = 0
            } else if (this.controller["KeyW"].pressed && this.controller["KeyS"].pressed) {
                animationIndex = 0;
                if (this.controller["KeyD"].pressed) {
                    animationIndex = 4
                } else if (this.controller["KeyA"].pressed) {
                    animationIndex = 5
                }
            } else if (this.controller["KeyA"].pressed && this.controller["KeyD"].pressed) {
                animationIndex = 0;
                if (this.controller["KeyW"].pressed) {
                    animationIndex = 2
                } else if (this.controller["KeyS"].pressed) {
                    animationIndex = 3
                }
            } else{
                if (this.controller["KeyW"].pressed) { animationIndex = 2}
                if (this.controller["KeyS"].pressed) { animationIndex = 3}
                if (this.controller["KeyD"].pressed) { animationIndex = 4}
                if (this.controller["KeyA"].pressed) { animationIndex = 5}
            }

            let action = this.animationActions[animationIndex];
            this.setAction(action)
            this.mixers.update(timeElapsedS);
        }

        this.counter += 1;
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

    playLandingSound(sound) {
        globals.AUDIO_LOADER.load( LandingMP3, function( buffer ) {
            sound.setBuffer( buffer );
            sound.setVolume( 0.03 );
            sound.play();
        });
    }

    playJumpSound(sound) {
        globals.AUDIO_LOADER.load( JumpGruntMP3, function( buffer ) {
            sound.setBuffer( buffer );
            sound.setVolume( 0.01 );
            sound.play();
        });
    }

    playWalkingSound(sound) {
        globals.AUDIO_LOADER.load( WalkingMP3, function( buffer ) {
            sound.setBuffer( buffer );
            sound.setVolume( 0.001 );
            sound.play();
        });
    }
}


export default Player;