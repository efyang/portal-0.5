import { Group, MeshToonMaterial, Mesh, PlaneGeometry, TextureLoader, DoubleSide, RepeatWrapping, Vector3 } from 'three';
import FLOOR_TEXTURE from '../../../../assets/textures/floorTexture.png'
import * as CANNON from 'cannon'

class Floor extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            gui: parent.state.gui,
        };
       
        // create geometry
        this.name = 'floor';

        const geometry = new PlaneGeometry( 100, 100 );
        const texture = new TextureLoader().load(FLOOR_TEXTURE);
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set( 5, 5);

        const material = new MeshToonMaterial( {side: DoubleSide, map: texture } );

        const floor = new Mesh( geometry, material );
        floor.position.set( 0, 0, 0 );
        floor.lookAt(new Vector3(0, 1, 0))

        this.add(floor)

        // create physics
        var groundMaterial = new CANNON.Material();
        groundMaterial.friction = 0.9;
        var groundShape = new CANNON.Plane();
        var groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
        parent.state.cworld.addBody(groundBody);

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }


    update(timeStamp) {}
}

export default Floor;
