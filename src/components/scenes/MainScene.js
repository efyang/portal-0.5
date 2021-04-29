import * as Dat from 'dat.gui';
import { Scene, Color, Vector2, Vector3, Raycaster, Texture, ArrowHelper } from 'three';
import * as THREE from 'three';
import { Floor, Crosshair, Player, Portal, EnvironmentCube, PlayerModel } from 'objects';
import { BasicLights } from 'lights';

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

        const floor = new Floor(this, new Vector3(0,0,0), -Math.PI / 2, 0, 0);
        const wall1 = new Floor(this, new Vector3(10, 0, 0), 0, -Math.PI / 2, 0);
        const wall2 = new Floor(this, new Vector3(-10, 0, 0), 0, Math.PI / 2, 0);
        const wall3 = new Floor(this, new Vector3(0, 0, 10), 0, Math.PI, 0);
        const wall4 = new Floor(this, new Vector3(0, 0, -10), 0, 0, 0);
        const ceiling = new Floor(this, new Vector3(0, 10, 0), Math.PI / 2, 0, 0);
        this.add(floor, wall1, wall2, wall3, wall4, ceiling, player, lights);
        // this.add(floor, wall1, player, lights);

        const cube = new EnvironmentCube(this, new Vector3(0, 0, 0))
        this.add(cube)
        // const room = new EnvironmentRoom2(this, 0, 4, 0, 4)
        // this.add(room, player, lights)

        // set intersectable objects
        this.intersectObj = [floor.children[0], wall1.children[0], wall2.children[0], wall3.children[0], wall4.children[0], ceiling.children[0], cube.children[0]];
        // this.intersectObj = [floor.children[0], wall1.children[0], cube.children[0]];

        // set portals
        this.portal1 = new Portal(this,
            new Vector3(5, 1.1, 0),
            new Vector3(1, 0, 0).normalize(), // normal of surface
            new Vector3(0, 1, 0).normalize(),
            null,
            floor,
            'orange')

        this.portal2 = new Portal(this,
            new Vector3(8, 1.1, 0),
            new Vector3(-1, 0, 0).normalize(), // normal of surface
            new Vector3(0, 1, 0).normalize(),
            this.portal1,
            floor,
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
        

        // construct portals
        // handle portal spawning on mouse down
        // window.addEventListener("mousedown", (e) => this.handleMouseDown(e), false)
        
        window.addEventListener("mousedown", (event) => {
            if (!this.state.controls.isLocked) { return; }

            let mouse = new Vector2(0,0)
            const raycaster = new Raycaster();
            raycaster.setFromCamera( mouse, window.camera );

            const intersects = raycaster.intersectObjects( this.intersectObj );
            if (intersects.length > 0) {
                if (event.button == 0) {           // left click
                    
                    this.portal1.mesh.geometry.dispose();
                    this.portal1.mesh.material.dispose();
                    this.remove(this.portal1);
                    console.log(intersects[0])
                    this.portal1 = new Portal(this,
                        intersects[0].point,
                        intersects[0].face.normal.normalize(), // normal of surface
                        new Vector3(0, 1, 0).normalize(),
                        this.portal2,
                        intersects[0].object.parent,
                        'orange')
                    this.add(this.portal1)
                    this.portal2.output = this.portal1
                } else if (event.button == 2) {    // right click
                    
                    this.portal2.mesh.geometry.dispose();
                    this.portal2.mesh.material.dispose();
                    this.remove(this.portal2);
                    this. portal2 = new Portal(this,
                        intersects[0].point,
                        intersects[0].face.normal.normalize(), // normal of surface
                        new Vector3(0, 1, 0).normalize(),
                        this.portal1,
                        intersects[0].object,
                        'blue')
                    this.add(this.portal2)
                    this.portal1.output = this.portal2
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
}

export default MainScene;
