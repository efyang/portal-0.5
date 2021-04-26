import { Group, MeshStandardMaterial, Mesh, TextureLoader, DoubleSide, RepeatWrapping, BoxGeometry } from 'three';
import FLOOR_TEXTURE from '../../../../assets/textures/floorTexture.png'
import * as CANNON from 'cannon'

const CUBESIZE = 3

class EnvironmentCube extends Group {
    constructor(parent, position) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            gui: parent.state.gui,
        };
       
        // create geometry
        const geometry = new BoxGeometry( CUBESIZE, CUBESIZE, CUBESIZE );
        const texture = new TextureLoader().load(FLOOR_TEXTURE);
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set( 1, 1 );

        const material = new MeshStandardMaterial( {side: DoubleSide, map: texture } );

        const cube = new Mesh( geometry, material );
        cube.position.copy(position);

        this.add(cube)

        // create physics
        var groundMaterial = new CANNON.Material();
        groundMaterial.friction = 0.9;
        var groundShape = new CANNON.Box(new CANNON.Vec3(CUBESIZE / 2, CUBESIZE / 2, CUBESIZE / 2));
        var groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
        parent.state.cworld.addBody(groundBody);

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }


    update(timeStamp) {}
}

export default EnvironmentCube;