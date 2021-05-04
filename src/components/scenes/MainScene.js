import * as Dat from 'dat.gui';
import { Scene, Color, Vector2, Vector3, Raycaster} from 'three';
import * as THREE from 'three';
import { Floor, Crosshair, Player, Portal, EnvironmentCube2, PlayerModel } from 'objects';
import { BasicLights } from 'lights';
import { consts, globals } from 'globals';


class MainScene extends Scene {
    constructor(cworld, controls) {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            cworld: cworld,
            updateList: [],
            controls: controls,
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        const lights = new BasicLights();
        const player = new Player(this);
        this.add(lights, player)

        // defines intersectable objects
        this.intersectObj = [];

        // const room = new EnvironmentRoom(this)    
        // console.log(room);
        // this.add(room)

        const files = consts.FILES;
        let filename;

        // return JSON data from any file path (asynchronous)
        function getJSON(path) {
            return fetch(path).then(response => response.json());
        }

        /*
        for (filename of files) {
            let path = 'src/components/Jsons/' + filename + '.json';
            // load JSON data; then proceed
            getJSON(path).then(data => {
                // console.log(data.geometries[0].width)
                let geometries = data.geometries[0]
                let matrix = data.object.matrix
                let position = new Vector3(matrix[12], matrix[13], matrix[14])
                let cube = new EnvironmentCube2(this, geometries, position);
                this.add(cube);
                this.intersectObj.push(cube.children[0]);
            })
        }
        */

        // load scene meshes from json file
        for (filename of files) {
            let path = 'src/components/Jsons/' + filename + '.json';
            // load JSON data; then proceed
            getJSON(path).then(data => {
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
      

        // set portals
        this.portal1 = new Portal(this,
            new Vector3(5, 1.1, 0),
            new Vector3(1, 0, 0).normalize(), // normal of surface
            new Vector3(0, 1, 0).normalize(),
            null,
            null,
            'orange')

        this.portal2 = new Portal(this,
            new Vector3(8, 1.1, 0),
            new Vector3(-1, 0, 0).normalize(), // normal of surface
            new Vector3(0, 1, 0).normalize(),
            this.portal1,
            null,
            'blue')

        this.portal1.output = this.portal2
        this.add(this.portal1, this.portal2)
        
        // console.log(floor)
        
/*
        this.portal1 = new Portal(this,
            new Vector3(5, 1, 0),
            new Vector3(-1, 0, 0).normalize(), // normal of surface
            new Vector3(0, 1, 0).normalize(),
            null,
            floor,
            portal1Target.texture)

        this.portal2 = new Portal(this,
            new Vector3(8, 1, 0),
            new Vector3(1, 0, 1).normalize(), // normal of surface
            new Vector3(0, 2, 1).normalize(),
            this.portal1,
            floor,
            portal2Target.texture)

        this.portal1.output = this.portal2
        this.add(this.portal1, this.portal2)
*/
        /*
        // do some test points and vectors through the portals
        // test directional transform
        let dv = new Vector3(1, 2, 3).normalize()
        const inputHelper = new THREE.ArrowHelper(dv, new Vector3(4, 1, 0), 1, 0xffff00)
        this.add(inputHelper)

        let dout = this.portal1.getTeleportedDirectionalVector(dv)
        const outputHelper = new THREE.ArrowHelper(dout, new Vector3(8, 1, 0).add(new Vector3(1, 0, 1).normalize()), 1, 0xff00ff)
        this.add(outputHelper)
        
        // test point transform
        const geometry = new THREE.SphereGeometry( 0.1, 32, 32 );
        const material = new THREE.MeshBasicMaterial( {color: 0x00ffff} );
        const sphere1 = new THREE.Mesh( geometry, material );
        const sphere2 = new THREE.Mesh( geometry, material );
        let p1 = new Vector3(5, 1, 0).add(new Vector3(-1, 0.5, 0.3))
        let p2 = this.portal1.getTeleportedPositionalVector(p1)
        sphere1.position.copy(p1)
        sphere2.position.copy(p2)
        this.add(sphere1, sphere2)

        // test object transform
        let objectpos = new Vector3(5, 1, 0).add(new Vector3(-1, -0.5, -0.3))
        const objectGroup = new THREE.Group()
        let arrowObject1 = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), objectpos, 0.5, 0xff0000)
        let arrowObject2 = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), objectpos, 0.5, 0x00ff00)
        let arrowObject3 = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), objectpos, 0.5, 0x0000ff)
        const sphere3 = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( {color: 0xffffff} ) );
        sphere3.position.copy(objectpos)
        objectGroup.add(arrowObject1, arrowObject2, arrowObject3, sphere3)
        this.add(objectGroup)
        const objectGroup2 = objectGroup.clone()
        this.portal1.teleportObject3D(objectGroup2)
        this.add(objectGroup2)*/

        // Populate GUI
        // this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
        
        this.portal1Points = []
        this.portal2Point = []

        // construct portals
        window.addEventListener("mousedown", (event) => {
            if (!this.state.controls.isLocked) { return; }

            // create raycaster
            let mouse = new Vector2(0,0)
            const raycaster = new Raycaster();
            raycaster.setFromCamera( mouse, window.camera );

            // define playerUpDirection
            let playerUpDirection = new THREE.Vector3(0,1,0)
            playerUpDirection.applyQuaternion(window.camera.quaternion)

            const intersects = raycaster.intersectObjects( this.intersectObj );
            if (intersects.length > 0) {
                const point = intersects[0].point;
                const normal = intersects[0].face.normal.clone().normalize()
                const depthDir = playerUpDirection.clone().projectOnPlane(normal).normalize()
                const widthDir = depthDir.clone().cross(normal)
                const portal_width = consts.PORTAL_WIDTH
                const portal_depth = consts.PORTAL_DEPTH

                let EPS = 0.02

                // the 4 corners of the portal that will be at this point
                let portalPoints = [point.clone().add(depthDir.clone().multiplyScalar(portal_depth/2 + EPS).add(widthDir.clone().multiplyScalar(portal_width/2 + EPS))), 
                                    point.clone().add(depthDir.clone().multiplyScalar(-portal_depth/2 - EPS).add(widthDir.clone().multiplyScalar(portal_width/2 + EPS))), 
                                    point.clone().add(depthDir.clone().multiplyScalar(-portal_depth/2 - EPS).add(widthDir.clone().multiplyScalar(-portal_width/2 - EPS))), 
                                    point.clone().add(depthDir.clone().multiplyScalar(portal_depth/2 + EPS).add(widthDir.clone().multiplyScalar(-portal_width/2 - EPS)))]
                for (let p of portalPoints) {
                    if (!this.validPortalPoint(p, normal,intersects[0].object)) {
                        return;
                    }
                }

                let edgePoints = this.getEdgePoints(portalPoints);

                if (event.button == 0) {           // left click
                    // check that this portal does not intersect the other one
                    if (intersects[0].object == this.portal2.hostObjects && this.portal2Points) {
                        for (let p of portalPoints) {
                            if (this.pointInPortal(p, this.portal2Points)) {
                                console.log("INVALID PLACEMENT (corner)")
                                return;
                            }
                        }
                        for (let p of edgePoints) {
                            if (this.pointInPortal(p, this.portal2Points)) {
                                console.log("INVALID PLACEMENT (edge)")
                                return;
                            }
                        }
                    }
                    this.portal1.mesh.geometry.dispose();
                    this.portal1.mesh.material.dispose();
                    this.remove(this.portal1);
                    this.portal1 = new Portal(this,
                        point,
                        normal, // normal of surface
                        playerUpDirection,
                        this.portal2,
                        intersects[0].object,
                        'orange')
                    this.add(this.portal1)
                    this.portal2.output = this.portal1
                    this.portal1Points = portalPoints
                } else if (event.button == 2) {    // right click
                    // check that this portal does not intersect the other one
                    if (intersects[0].object == this.portal1.hostObjects && this.portal1Points) {
                        for (let p of portalPoints) {
                            if (this.pointInPortal(p, this.portal1Points)) {
                                console.log("INVALID PLACEMENT (corner)")
                                return;
                            }
                        }
                        for (let p of edgePoints) {
                            if (this.pointInPortal(p, this.portal1Points)) {
                                console.log("INVALID PLACEMENT (edge)")
                                return;
                            }
                        }
                    }
                    
                    this.portal2.mesh.geometry.dispose();
                    this.portal2.mesh.material.dispose();
                    this.remove(this.portal2);
                    this. portal2 = new Portal(this,
                        point,
                        normal, // normal of surface
                        playerUpDirection,
                        this.portal1,
                        intersects[0].object,
                        'blue')
                    this.add(this.portal2)
                    this.portal1.output = this.portal2
                    this.portal2Points = portalPoints
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
        this.state.cworld.step(timeStep)
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
}

export default MainScene;
