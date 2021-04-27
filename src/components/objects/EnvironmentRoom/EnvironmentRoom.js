import { Group } from 'three';
import { EnvironmentCube} from 'objects';

const CUBESIZE = 3
class EnvironmentRoom extends Group {
    // bottom centered at position
    constructor(parent, position, halfwidth, halfheight, halfdepth) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            gui: parent.state.gui,
        };

        // create a bounding set of cubes
        // lids
        for (let x = 0; x < halfwidth; x++) {
            for (let z = 0; z < halfdepth; z++) {
                let offset = new THREE.Vector3()
            }
        }
        

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }


    update(timeStamp) {}
}

export default EnvironmentRoom;