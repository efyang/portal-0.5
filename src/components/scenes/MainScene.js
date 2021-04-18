import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { Floor, Player } from 'objects';
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
