import { Group, MeshStandardMaterial, Mesh, MeshPhongMaterial, TextureLoader, DoubleSide, RepeatWrapping, BoxGeometry } from 'three';
import FLOOR_TEXTURE from '../../../../assets/textures/floorTexture.png'
import * as CANNON from 'cannon'


class EnvironmentCube2 extends Group {
    constructor(parent, geo, pos) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            gui: parent.state.gui,
        };
    
        this.width = geo.width;
        this.height = geo.height;
        this.depth = geo.depth;
        this.dimensions = [geo.width, geo.height, geo.depth].sort(function(a, b){return b-a})
        // console.log(this.dimensions)

        // create geometry
        const geometry = new BoxGeometry( this.width, this.height, this.depth );

        // create material
        const texture = new TextureLoader().load(FLOOR_TEXTURE);
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set( this.dimensions[0]/2, this.dimensions[1]/2 );
        const material = new MeshStandardMaterial( {side: DoubleSide, map: texture } );

        let cube = new Mesh( geometry, material );
        cube.position.copy(pos);

        this.add(cube)

        // create physics
        var physicsMaterial = new CANNON.Material();
        physicsMaterial.friction = 0.9;
        let EPS = 0.1
        var physicsShape = new CANNON.Box(new CANNON.Vec3(this.width / 2, this.height / 2, this.depth / 2));
        var physicsBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
        physicsBody.addShape(physicsShape, new CANNON.Vec3(pos.x, pos.y, pos.z));
        // physicsBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
        parent.state.cworld.addBody(physicsBody);

        // Add self to parent's update list
        
        // parent.addToUpdateList(this);
    }


    update(timeStamp) {}
}

export default EnvironmentCube2;