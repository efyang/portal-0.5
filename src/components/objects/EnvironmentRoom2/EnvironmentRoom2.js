import { Group } from 'three';
import { EnvironmentCube} from 'objects';
import * as THREE from 'three';
import { BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const CUBESIZE = 1
class EnvironmentRoom2 extends Group {

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
        const geometries = [];
        for (let x = -halfwidth/2; x < halfwidth/2; x++) {
            for (let z = -halfwidth/2; z < halfdepth/2; z++) {
                let pos = new THREE.Vector3(x, CUBESIZE/2, z)
                // let cube = new EnvironmentCube(parent, pos, CUBESIZE)
                let geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
                geometries.push(geometry);
            }
        }

        const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries, false);
        
        const texture = new TextureLoader().load(FLOOR_TEXTURE);
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set( 1, 1 );
        const material = new MeshStandardMaterial( {side: DoubleSide, map: texture } );

        const mesh = new THREE.Mesh(mergedGeometry, material)
        

        // Add self to parent's update list
        parent.addToUpdateList(mesh);
    }
   


    update(timeStamp) {}
}

export default EnvironmentRoom2;