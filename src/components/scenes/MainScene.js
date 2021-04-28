import * as Dat from 'dat.gui';
import { Scene, Color, Vector2, Vector3, Raycaster } from 'three';
import * as THREE from 'three';
import { Floor, Player, Portal, EnvironmentCube, PlayerModel } from 'objects';
import { BasicLights } from 'lights';

class MainScene extends Scene {
    constructor(cworld) {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            cworld: cworld,
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        const floor = new Floor(this);
        const lights = new BasicLights();
        // const playerModel = new PlayerModel(this);
        const player = new Player(this);
        // this.add(floor, player, playerModel, lights);
        this.add(floor, player, lights);

        const cube = new EnvironmentCube(this, new Vector3(0, 0, 0))
        this.add(cube)

        // set intersectable objects
        this.intersectObj = [floor.children[0], cube.children[0]];

        let portal1 = new Portal(this,
            new Vector3(5, 1, 0),
            new Vector3(-1, 0, 0).normalize(), // normal of surface
            new Vector3(0, 1, 0).normalize(),
            null,
            floor)

        let portal2 = new Portal(this,
            new Vector3(10, 1, 0),
            new Vector3(1, 0, 1).normalize(), // normal of surface
            new Vector3(0, 2, 1).normalize(),
            portal1,
            floor)

        portal1.output = portal2
        this.add(portal1, portal2)

        // do some test points and vectors through the portals
        // test directional transform
        let dv = new Vector3(1, 2, 3).normalize()
        const inputHelper = new THREE.ArrowHelper(dv, new Vector3(4, 1, 0), 1, 0xffff00)
        this.add(inputHelper)

        let dout = portal1.getTeleportedDirectionalVector(dv)
        const outputHelper = new THREE.ArrowHelper(dout, new Vector3(10, 1, 0).add(new Vector3(1, 0, 1).normalize()), 1, 0xff00ff)
        this.add(outputHelper)
        
        // test point transform
        const geometry = new THREE.SphereGeometry( 0.1, 32, 32 );
        const material = new THREE.MeshBasicMaterial( {color: 0x00ffff} );
        const sphere1 = new THREE.Mesh( geometry, material );
        const sphere2 = new THREE.Mesh( geometry, material );
        let p1 = new Vector3(5, 1, 0).add(new Vector3(-1, 0.5, 0.3))
        let p2 = portal1.getTeleportedPositionalVector(p1)
        sphere1.position.copy(p1)
        sphere2.position.copy(p2)
        this.add(sphere1, sphere2)


        // Populate GUI
        // this.state.gui.add(this.state, 'rotationSpeed', -5, 5);

        // construct portals
        // handle portal spawning on mouse down
        // window.addEventListener("mousedown", (e) => this.handleMouseDown(e), false)
        window.addEventListener("mousedown", (event) => {
            let self = this
            const raycaster = new Raycaster();

            // let cameraDirection = new Vector3()
            // window.camera.getWorldDirection(cameraDirection)
            // raycaster.setFromCamera( cameraDirection, window.camera );

            let mouse = new Vector2(0,0)
            raycaster.setFromCamera( mouse, window.camera );

            console.log(this.intersectObj)
            const intersects = raycaster.intersectObjects( this.intersectObj );
            // const intersects = raycaster.intersectObject( this.floor );
            console.log(intersects)
            if (intersects.length > 0) {
                if (event.button == 0) {           // left click
                    
                    portal1.children[0].geometry.dispose();
                    portal1.children[0].material.dispose();
                    this.remove(portal1);
                    portal1 = new Portal(this,
                        new Vector3(9, 0, 2),
                        new Vector3(0, 1, 0), // normal of surface
                        new Vector3(1, 0, 1),
                        null,
                        floor)
                    self.add(portal1)
                } else if (event.button == 2) {    // right click
                    
                    portal2.children[0].geometry.dispose();
                    portal2.children[0].material.dispose();
                    this.remove(portal2);
                    portal2 = new Portal(this,
                        new Vector3(5, 0, 2),
                        new Vector3(0, 1, 0), // normal of surface
                        new Vector3(1, 0, 1),
                        portal1,
                        floor)
                    self.add(portal2)
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

    handleMouseDown(event) {
        const raycaster = new Raycaster();

        // let cameraDirection = new Vector3()
        // window.camera.getWorldDirection(cameraDirection)
        // raycaster.setFromCamera( cameraDirection, window.camera );

        let mouse = new Vector2(0,0)
        raycaster.setFromCamera( mouse, window.camera );

        console.log(this.intersectObj)
        const intersects = raycaster.intersectObjects( this.intersectObj );
        // const intersects = raycaster.intersectObject( this.floor );
        console.log(intersects)
        if (intersects.length > 0) {
            if (event.button == 0) {           // left click
                portal
            } else if (event.button == 2) {    // right click

            }
        }
    }
}

export default MainScene;
