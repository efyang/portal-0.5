import * as Dat from 'dat.gui';
import { Scene, Color, Vector2, Vector3, Raycaster, Box3, Audio} from 'three';
import PortalGunFireMP3 from '../../../assets/sounds/PortalGunFire.mp3'
import PortalGunErrorMP3 from '../../../assets/sounds/PortalGunError.mp3'
import TeleportMP3 from '../../../assets/sounds/Teleport.mp3'
import * as THREE from 'three';
import { Player, Portal, EnvironmentCube2 } from 'objects';
import { BasicLights } from 'lights';
import { consts, globals } from 'globals';
import 'regenerator-runtime/runtime'

import SCENE_JSON from '../jsons/scene6.json'

class MainScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            updateList: [],
        };
        const debugFolder = this.state.gui.addFolder("debug")
        debugFolder.add({debug: globals.DEBUG}, "debug")
            .onChange((v) => globals.DEBUG = v)
        const portalsFolder = this.state.gui.addFolder("portals")
        portalsFolder.add({"Portal Recursion Level": globals.PORTAL_RECURSION_LEVELS}, "Portal Recursion Level", 1, 10, 1)
            .onChange((v) => globals.PORTAL_RECURSION_LEVELS = v)
        
        globals.MAIN_CAMERA.position.copy(new Vector3(0, 5, 0))

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        this.intersectObjects = [];

        // defines environmental objects for setting portals and for collision groups
        this.environmentObjects = [];

        // deifnes the dynamic objects for collision groups
        this.dynamicObjects = []

        this.debugMeshes = []

        // load meshes from json file to scene
        // load JSON data; then proceed
        const data = SCENE_JSON
        for (let i = 0; i < data.geometries.length; i++) {
            let geometries = data.geometries[i]
            let object = data.object.children[i]
            let matrix = object.matrix
            let name = object.name
            let placeable = 1
            if (name.split("_")[0] == "unplaceable") {
                placeable = 0
            }
            let position = new Vector3(matrix[12], matrix[13], matrix[14])
            let cube = new EnvironmentCube2(this, geometries, position, placeable, matrix);
            this.add(cube);

            // console.log(object)
            this.environmentObjects.push(cube);
            this.intersectObjects.push(cube.children[0])
        
            // just instantiate physics on load to not deal with async
            cube.physicsBody.collisionFilterGroup = consts.CGROUP_ENVIRONMENT
            cube.physicsBody.collisionFilterMask = consts.CGROUP_DYNAMIC
        }

        // Add other meshes to scene
        const lights = new BasicLights(this);
        const player = new Player(this);
        globals.PLAYER = player
        this.add(lights, player)
        this.dynamicObjects.push(player)

        for (let d of this.dynamicObjects) {
            d.physicsBody.collisionFilterGroup = consts.CGROUP_DYNAMIC 
            d.physicsBody.collisionFilterMask = consts.CGROUP_ALL
        }

        // add event listener to construct portals
        window.addEventListener("mousedown", (e) => this.handleMouseDown(e), false);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { updateList } = this.state;
        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
        
        for (const mesh of this.debugMeshes) {
            mesh.visible = globals.DEBUG
        }

        // teleport sound
        const TeleportSound = new Audio( globals.LISTENER );

        for (let d of this.dynamicObjects) {
            let pos = new Vector3(d.physicsBody.position.x, d.physicsBody.position.y, d.physicsBody.position.z)
            // let bb = new Box3(new Vector3().copy(d.physicsBody.aabb.lowerBound), new Vector3().copy(d.physicsBody.aabb.upperBound))
            d.physicsBody.collisionFilterMask = consts.CGROUP_ALL
            if (globals.PORTALS[0] === null || globals.PORTALS[1] === null) {
                continue
            }
            d.meshClone.visible = false
            let CDBB_isOverlap = false;
            for (let p = 0; p < globals.PORTALS.length; p++) {
                // collision disable, might be partially intersecting with portal
                if (globals.PORTALS[p].CDBB.containsPoint(pos)) {
                    d.physicsBody.collisionFilterMask &= ~globals.PORTALS[p].hostObjects.physicsBody.collisionFilterGroup
                    // show the clone
                    if (p == 0 || (p > 0 && !CDBB_isOverlap)) {
                        CDBB_isOverlap = true;
                        globals.PORTALS[p].teleportObject3D(d.meshClone)
                        d.meshClone.visible = true
                    }
                }
                
                // should teleport
                if (globals.PORTALS[p].STBB.containsPoint(pos)) {
                    globals.PORTALS[p].teleportPhysicalObject(d)
                    globals.PORTALS[p].teleportObject3D(globals.MAIN_CAMERA)
                    this.playTeleportSound(TeleportSound)

                    // fix camera rotation
                    // create a new basis with up as the up
                    // https://danielilett.com/2020-01-03-tut4-4-portal-momentum/
                    let up = new THREE.Vector3(0, 1, 0)
                    let cameraForward = new THREE.Vector3()
                    globals.MAIN_CAMERA.getWorldDirection(cameraForward)
                    cameraForward.normalize()
                    let cameraRight = cameraForward.clone().cross(up).normalize()
                    let cameraUp = cameraRight.clone().cross(cameraForward).normalize()
                    let cameraMat = new THREE.Matrix4().makeBasis(cameraRight, cameraUp, cameraForward.negate())
                    globals.MAIN_CAMERA.quaternion.setFromRotationMatrix(cameraMat)

                    d.physicsBody.collisionFilterMask |= globals.PORTALS[p].hostObjects.physicsBody.collisionFilterGroup
                    d.physicsBody.collisionFilterMask &= ~globals.PORTALS[1 - p].hostObjects.physicsBody.collisionFilterGroup
                    break
                }
            }
        }

    }

    validPortalPoint(point, normal, object) {

        // check that no intersectable objects are directly in front of point
        const raycaster = new Raycaster();
        let behindPoint = point.clone().add(normal.clone().multiplyScalar(-0.1))
        raycaster.set(behindPoint, normal)
        let intersects = raycaster.intersectObjects( this.intersectObjects );
        console.log(intersects)

        // if there is no intersect or if there is another object in the way, then return false
        if (intersects.length == 0 ||  intersects[0].object != object) {
            console.log("HERE1")
            return false
        }

        // check that the same intersectable object is directly behind the point
        let frontPoint = point.clone().add(normal.clone().multiplyScalar(0.1))
        raycaster.set(frontPoint, normal.clone().multiplyScalar(-1))
        intersects = raycaster.intersectObjects( this.intersectObjects );

        // if there is no intersect or if there is another object in the way, then return false
        if (intersects.length == 0 || intersects[0].object != object) {
            console.log("HERE2")
            return false
        }

        // have to also check if there is another face occupying the same space. The distance between the first and second intersects will be negligible
        // but the objects will be different.
        if (intersects.length > 1 && intersects[0].distance - intersects[1].distance < 0.001 && intersects[1].object != object) {
            return false
        }
        
        return true
    }

    // formula from here: https://math.stackexchange.com/questions/190111/how-to-check-if-a-point-is-inside-a-rectangle
    pointInPortal(point, portal) {
        let areaOfRect = this.computeTriangleArea(portal[0], portal[1], portal[2]) + this.computeTriangleArea(portal[2], portal[3], portal[0])

        let sumOfAreas = 0
        for (let i = 0; i < portal.length-1; i++) {
            sumOfAreas += this.computeTriangleArea(point, portal[i], portal[i+1])
        }   
        sumOfAreas += this.computeTriangleArea(point, portal[portal.length-1], portal[0])
        return (sumOfAreas <= areaOfRect)
    }

    // formula from here: https://math.stackexchange.com/questions/128991/how-to-calculate-the-area-of-a-3d-triangle
    computeTriangleArea(p1, p2, p3) {
        let v1 = p1.clone().sub(p2)
        let v2 = p1.clone().sub(p3)
        let xAB = v1.x;
        let yAB = v1.y;
        let zAB = v1.z;
        
        let xAC = v2.x;
        let yAC = v2.y;
        let zAC = v2.z;

        let sqrtTerm = Math.sqrt(Math.pow((yAB * zAC - zAB * yAC),2) + Math.pow((zAB * xAC - xAB * zAC),2) + Math.pow((xAB * yAC - yAB * xAC),2))

        return (0.5 * sqrtTerm)
    }

    // retrieves points along the edges of a portal to check for portal overlaps
    // points is an array of 4 corner points of a portal
    getEdgePoints(points) {
        let edgePoints = []

        for(let i = 0; i < points.length-1; i++) {
            let vec = points[i+1].clone().sub(points[i]);
            for (let j = 0; j < 10; j++) {
                edgePoints.push(points[i].clone().add(vec.clone().multiplyScalar((j+1)/11)));
            }
        }

        let vec = points[0].clone().sub(points[points.length-1]);
        for (let j = 0; j < 10; j++) {
            edgePoints.push(points[points.length-1].clone().add(vec.clone().multiplyScalar((j+1)/11)));
        }

        return edgePoints;
    }

    // check if new portal that will contain portalPoints and edgePoints overlaps with the other portal's corner points 'otherPortalPoints'
    portalsNotOverlapping(portalPoints, edgePoints, otherPortalPoints) {
        for (let p of portalPoints) {
            if (this.pointInPortal(p, otherPortalPoints)) {
                console.log("INVALID PLACEMENT (corner)")
                return false;
            }
        }
        for (let p of edgePoints) {
            if (this.pointInPortal(p, otherPortalPoints)) {
                console.log("INVALID PLACEMENT (edge)")
                return false;
            }
        }

        return true;
    }

    // deletes the portal with index portalIndex from the scene
    deletePortal(portalIndex) {
        globals.PORTALS[portalIndex].mesh.geometry.dispose();
        globals.PORTALS[portalIndex].mesh.material.dispose();
        if (globals.PORTALS[portalIndex].hostObjects !== null) {
            // mark this object as collideable with portal 0 bb objects
            globals.PORTALS[portalIndex].hostObjects.physicsBody.collisionFilterGroup &= ~consts.CGROUP_PORTAL_HOST_CDISABLE[portalIndex]
            // add back to environment group only if collideable with both portal objects
            if (!(globals.PORTALS[portalIndex].hostObjects.physicsBody.collisionFilterGroup & consts.CGROUP_PORTAL_HOST_CDISABLE[0]) &&
                !(globals.PORTALS[portalIndex].hostObjects.physicsBody.collisionFilterGroup & consts.CGROUP_PORTAL_HOST_CDISABLE[1])) {
                globals.PORTALS[portalIndex].hostObjects.physicsBody.collisionFilterGroup |= consts.CGROUP_ENVIRONMENT
            }
        }
        this.remove(globals.PORTALS[portalIndex]);
    }

    // creates a new portal and adds it to the scene
    createPortal(thisPortalIndex, otherPortalIndex, point, normal, hostObject, playerUpDirection, portalPoints) {
        let color = consts.PORTAL_COLORS[thisPortalIndex]

        globals.PORTALS[thisPortalIndex] = new Portal(this,
            point,
            normal, // normal of surface
            playerUpDirection,
            globals.PORTALS[otherPortalIndex],
            hostObject,
            color,
            portalPoints)
        this.add(globals.PORTALS[thisPortalIndex])
        globals.PORTALS[thisPortalIndex].hostObjects.physicsBody.collisionFilterGroup |= consts.CGROUP_PORTAL_HOST_CDISABLE[thisPortalIndex]
        // remove this object from the environment group
        globals.PORTALS[thisPortalIndex].hostObjects.physicsBody.collisionFilterGroup &= ~consts.CGROUP_ENVIRONMENT
        if (globals.PORTALS[otherPortalIndex] !== null) {
            globals.PORTALS[otherPortalIndex].output = globals.PORTALS[thisPortalIndex]
        }
    }

    // handle portal placements on mouse clicks
    handleMouseDown(e) {
        // if (!this.state.controls.isLocked) { return; }
        if (!globals.CONTROLS.isLocked) { return; }

        // for portal sounds
        const PortalSound = new Audio( globals.LISTENER );

        // create raycaster
        let mouse = new Vector2(0,0)
        const raycaster = new Raycaster();
        raycaster.setFromCamera( mouse, globals.MAIN_CAMERA );

        // define playerUpDirection
        let playerUpDirection = new THREE.Vector3(0,1,0)
        playerUpDirection.applyQuaternion(globals.MAIN_CAMERA.quaternion)

        const intersects = raycaster.intersectObjects( this.intersectObjects );
        if (intersects.length > 0) {
            console.log(intersects)
            if (!intersects[0].object.parent.placeable) {
                this.playPortalGunErrorSound(PortalSound)  
                return;
            }
            const point = intersects[0].point;
            const normal = intersects[0].face.normal.clone().normalize()
            const depthDir = playerUpDirection.clone().projectOnPlane(normal).normalize()
            const widthDir = depthDir.clone().cross(normal)
            const portal_width = consts.PORTAL_WIDTH
            const portal_depth = consts.PORTAL_DEPTH

            // the 4 corners of the new portal that will be at this point
            let EPS = consts.PORTAL_EPS * 3;
            let portalPoints = [point.clone().add(depthDir.clone().multiplyScalar(portal_depth/2 + EPS).add(widthDir.clone().multiplyScalar(portal_width/2 + EPS))), 
                                point.clone().add(depthDir.clone().multiplyScalar(-portal_depth/2 - EPS).add(widthDir.clone().multiplyScalar(portal_width/2 + EPS))), 
                                point.clone().add(depthDir.clone().multiplyScalar(-portal_depth/2 - EPS).add(widthDir.clone().multiplyScalar(-portal_width/2 - EPS))), 
                                point.clone().add(depthDir.clone().multiplyScalar(portal_depth/2 + EPS).add(widthDir.clone().multiplyScalar(-portal_width/2 - EPS)))]
            
            for (let p of portalPoints) {
                if (!this.validPortalPoint(p, normal, intersects[0].object)) {
                    this.playPortalGunErrorSound(PortalSound)
                    console.log("HERE")
                    return;
                }
            }

            // get points along the edge of the new portal to check for overlap against the other portal
            let edgePoints = this.getEdgePoints(portalPoints);

            if (e.button == 0) {           // left click
                // check that this new portal does not overlap with the other portal when they are on the same surface
                if (globals.PORTALS[1] !== null &&
                    intersects[0].object.parent == globals.PORTALS[1].hostObjects &&
                    !this.portalsNotOverlapping(portalPoints, edgePoints, globals.PORTALS[1].portalPoints) ) {
                    this.playPortalGunErrorSound(PortalSound)
                    return;
                }
                // delete the old portal this new one is replacing
                if (globals.PORTALS[0] !== null) {
                    this.deletePortal(0);
                }
                this.createPortal(0, 1, point, normal, intersects[0].object.parent, playerUpDirection, portalPoints)
            } else if (e.button == 2) {    // right click
                // check that this new portal does not overlap with the other portal when they are on the same surface
                if (globals.PORTALS[0] !== null &&
                    intersects[0].object.parent == globals.PORTALS[0].hostObjects &&
                    !this.portalsNotOverlapping(portalPoints, edgePoints, globals.PORTALS[0].portalPoints) ) {
                    this.playPortalGunErrorSound(PortalSound)
                    return;
                }
                // delete the old portal this new one is replacing
                if (globals.PORTALS[1] !== null) {
                    this.deletePortal(1)
                }
                this.createPortal(1, 0, point, normal, intersects[0].object.parent, playerUpDirection, portalPoints)
            }

            this.playPortalGunFireSound(PortalSound)
        }
    }

    playPortalGunFireSound(sound) {
        globals.AUDIO_LOADER.load( PortalGunFireMP3, function( buffer ) {
            sound.setBuffer( buffer );
            sound.setVolume( 0.2 );
            sound.play();
        });
    }

    playPortalGunErrorSound(sound) {
        globals.AUDIO_LOADER.load( PortalGunErrorMP3, function( buffer ) {
            sound.setBuffer( buffer );
            // sound.setLoop( true );
            sound.setVolume( 0.2 );
            sound.play();
        });
    }

    playTeleportSound(sound) {
        globals.AUDIO_LOADER.load( TeleportMP3, function( buffer ) {
            sound.setBuffer( buffer );
            // sound.setLoop( true );
            sound.setVolume( 0.2 );
            sound.play();
        });
    }
}

export default MainScene;
