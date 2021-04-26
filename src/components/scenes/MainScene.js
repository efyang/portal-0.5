import * as Dat from 'dat.gui';
import { Scene, Color, Vector3 } from 'three';
import { Floor, Player, Portal, EnvironmentCube } from 'objects';
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
        const player = new Player(this);
        this.add(floor, player, lights);

        const cube = new EnvironmentCube(this, new Vector3(0, 0, 0))
        this.add(cube)

        const portal1 = new Portal(this,
            new Vector3(0, 2, 0),
            new Vector3(-1, 0, 0), // normal of surface
            new Vector3(1, 0, 0),
            null,
            floor)

        const portal2 = new Portal(this,
            new Vector3(5, 0, 2),
            new Vector3(0, 1, 0), // normal of surface
            new Vector3(1, 0, 1),
            portal1,
            floor)

        portal1.output = portal2
        this.add(portal1, portal2)
        // Populate GUI
        // this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
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
