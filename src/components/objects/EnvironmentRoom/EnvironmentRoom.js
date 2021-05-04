import { Group, Vector3, BufferGeometry, MeshStandardMaterial, Mesh, TextureLoader, RepeatWrapping, DoubleSide} from 'three';
import * as THREE from 'three';
import { EnvironmentCube2} from 'objects';
import { consts, globals } from '../../../globals';
import FLOOR_TEXTURE from '../../../../assets/textures/floorTexture.png'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';


class EnvironmentRoom extends Group {
    // bottom centered at position
    constructor(parent) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            gui: parent.state.gui,
        };

        const files = consts.FILES;

        let geometriesToBeMerged = [];
        // return JSON data from any file path (asynchronous)
        function getJSON(path) {
            return fetch(path).then(response => response.json());
        }

        for (let i = 0; i < files.length; i++) {
            let path = 'src/components/Jsons/' + files[i] + '.json';
            // load JSON data; then proceed
            getJSON(path).then(data => {
                let geometries = data.geometries[0]
                let matrix = data.object.matrix
                let position = new Vector3(matrix[12], matrix[13], matrix[14])
                let cube = new EnvironmentCube2(parent, geometries, position);
                this.add(cube)
            })
        }

        // const texture = new TextureLoader().load(FLOOR_TEXTURE);
        // texture.wrapS = RepeatWrapping;
        // texture.wrapT = RepeatWrapping;
        // texture.repeat.set( 1, 1 );
        // const material = new MeshStandardMaterial( {side: DoubleSide, map: texture } );

        console.log(geometriesToBeMerged)

        var merged = BufferGeometryUtils.mergeBufferGeometries(geometriesToBeMerged);
        console.log(merged)

        var material = new THREE.MeshPhongMaterial({color: 0xFF0000});

        let room = new Mesh(mergedGeometry, material)
        this.add(room)        

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }


    update(timeStamp) {}
}

export default EnvironmentRoom;