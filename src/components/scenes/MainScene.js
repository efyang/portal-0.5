import * as Dat from 'dat.gui';
import { Scene, Color, Vector2, Vector3, Raycaster} from 'three';
import * as THREE from 'three';
import { Player, Portal, EnvironmentCube2 } from 'objects';
import { BasicLights } from 'lights';
import { consts, globals } from 'globals';


class MainScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // defines intersectable objects for setting portals
        this.intersectObj = [];

        // load meshes from json file to scene
        const files = consts.FILES;
        for (let filename of files) {
            let path = 'src/components/Jsons/' + filename + '.json';
            // load JSON data; then proceed
            this.getJSON(path).then(data => {
                for (let i = 0; i < data.geometries.length; i++) {
                    let geometries = data.geometries[i]
                    let matrix = data.object.children[i].matrix
                    let position = new Vector3(matrix[12], matrix[13], matrix[14])
                    let cube = new EnvironmentCube2(this, geometries, position);
                    this.add(cube);
                    this.intersectObj.push(cube.children[0]);
                }
            })
        }

        // Add other meshes to scene
        const lights = new BasicLights();
        const player = new Player(this);
        this.add(lights, player)

        // set initial portals
        // TODO: try removing these later on to test single portal cases
        globals.PORTALS[0] = new Portal(this,
            new Vector3(5, 1.1, 0),
            new Vector3(1, 0, 0).normalize(), // normal of surface
            new Vector3(0, 1, 0).normalize(),
            null,
            null,
            'orange')

        globals.PORTALS[1] = new Portal(this,
            new Vector3(8, 1.1, 0),
            new Vector3(-1, 0, 0).normalize(), // normal of surface
            new Vector3(0, 1, 0).normalize(),
            globals.PORTALS[0],
            null,
            'blue')

        globals.PORTALS[0].output = globals.PORTALS[1]
        this.add(globals.PORTALS[0], globals.PORTALS[1])

        // construct portals
        window.addEventListener("mousedown", (event) => {
            // if (!this.state.controls.isLocked) { return; }
            if (!globals.CONTROLS.isLocked) { return; }

            // create raycaster
            let mouse = new Vector2(0,0)
            const raycaster = new Raycaster();
            raycaster.setFromCamera( mouse, globals.MAIN_CAMERA );

            // define playerUpDirection
            let playerUpDirection = new THREE.Vector3(0,1,0)
            playerUpDirection.applyQuaternion(globals.MAIN_CAMERA.quaternion)

            const intersects = raycaster.intersectObjects( this.intersectObj );
            if (intersects.length > 0) {
                const point = intersects[0].point;
                const normal = intersects[0].face.normal.clone().normalize()
                const depthDir = playerUpDirection.clone().projectOnPlane(normal).normalize()
                const widthDir = depthDir.clone().cross(normal)
                const portal_width = consts.PORTAL_WIDTH
                const portal_depth = consts.PORTAL_DEPTH

                // the 4 corners of the new portal that will be at this point
                let EPS = consts.PORTAL_EPS * 2;
                let portalPoints = [point.clone().add(depthDir.clone().multiplyScalar(portal_depth/2 + EPS).add(widthDir.clone().multiplyScalar(portal_width/2 + EPS))), 
                                    point.clone().add(depthDir.clone().multiplyScalar(-portal_depth/2 - EPS).add(widthDir.clone().multiplyScalar(portal_width/2 + EPS))), 
                                    point.clone().add(depthDir.clone().multiplyScalar(-portal_depth/2 - EPS).add(widthDir.clone().multiplyScalar(-portal_width/2 - EPS))), 
                                    point.clone().add(depthDir.clone().multiplyScalar(portal_depth/2 + EPS).add(widthDir.clone().multiplyScalar(-portal_width/2 - EPS)))]
                
                                    for (let p of portalPoints) {
                    if (!this.validPortalPoint(p, normal, intersects[0].object)) {
                        return;
                    }
                }

                // get points along the edge of the new portal to check for overlap against the other portal
                let edgePoints = this.getEdgePoints(portalPoints);

                if (event.button == 0) {           // left click
                    // check that this new portal does not overlap with the other portal when they are on the same surface
                    if (intersects[0].object == globals.PORTALS[1].hostObjects && !this.portalsNotOverlapping(portalPoints, edgePoints, globals.PORTALS[1].portalPoints) ) {
                        return;
                    }

                    // delete the old portal this new one is replacing
                    globals.PORTALS[0].mesh.geometry.dispose();
                    globals.PORTALS[0].mesh.material.dispose();
                    this.remove(globals.PORTALS[0]);

                    // create new portal
                    globals.PORTALS[0] = new Portal(this,
                        point,
                        normal, // normal of surface
                        playerUpDirection,
                        globals.PORTALS[1],
                        intersects[0].object,
                        'orange',
                        portalPoints)
                    this.add(globals.PORTALS[0])
                    globals.PORTALS[1].output = globals.PORTALS[0]
                    globals.PORTALS[0] = globals.PORTALS[0]

                } else if (event.button == 2) {    // right click
                    // check that this new portal does not overlap with the other portal when they are on the same surface
                    if (intersects[0].object == globals.PORTALS[0].hostObjects && !this.portalsNotOverlapping(portalPoints, edgePoints, globals.PORTALS[0].portalPoints) ) {
                        return;
                    }

                    // delete the old portal this new one is replacing
                    globals.PORTALS[1].mesh.geometry.dispose();
                    globals.PORTALS[1].mesh.material.dispose();
                    this.remove(globals.PORTALS[1]);

                    // create new portal
                    globals.PORTALS[1] = new Portal(this,
                        point,
                        normal, // normal of surface
                        playerUpDirection,
                        globals.PORTALS[0],
                        intersects[0].object,
                        'blue',
                        portalPoints)
                    this.add(globals.PORTALS[1])
                    globals.PORTALS[0].output = globals.PORTALS[1]
                    globals.PORTALS[1] = globals.PORTALS[1]
                }
            }
        })
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { updateList } = this.state;
        const timeStep=1/60
        globals.CANNON_WORLD.step(timeStep)
        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }

    validPortalPoint(point, normal, object) {

        // check that no intersectable objects are directly in front of point
        const raycaster = new Raycaster();
        let behindPoint = point.clone().add(normal.clone().multiplyScalar(-0.1))
        raycaster.set(behindPoint, normal)
        let intersects = raycaster.intersectObjects( this.intersectObj );

        // if there is no intersect or if there is another object in the way, then return false
        if (intersects.length == 0 ||  intersects[0].object != object) {
            return false
        }

        // check that the same intersectable object is directly behind the point
        let frontPoint = point.clone().add(normal.clone().multiplyScalar(0.1))
        raycaster.set(frontPoint, normal.clone().multiplyScalar(-1))
        intersects = raycaster.intersectObjects( this.intersectObj );

        // if there is no intersect or if there is another object in the way, then return false
        if (intersects.length == 0 || intersects[0].object != object) {
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
                // console.log("INVALID PLACEMENT (corner)")
                return false;
            }
        }
        for (let p of edgePoints) {
            if (this.pointInPortal(p, otherPortalPoints)) {
                // console.log("INVALID PLACEMENT (edge)")
                return false;
            }
        }

        return true;
    }

    // return JSON data from any file path (asynchronous)
    getJSON(path) {
        return fetch(path).then(response => response.json());
    }
}

export default MainScene;
