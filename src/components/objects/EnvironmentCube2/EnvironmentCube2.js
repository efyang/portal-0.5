import { Group, MeshStandardMaterial, Mesh, DoubleSide, RepeatWrapping, BoxGeometry, TextureLoader, Matrix4, Quaternion} from 'three';
import {consts, globals} from 'globals'
import * as CANNON from 'cannon'
import FLOOR_TEXTURE_PNG from '../../../../assets/textures/floorTexture.png'


class EnvironmentCube2 extends Group {
    constructor(parent, geo, pos, placeable, matrix) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            gui: parent.state.gui,
        };
    
        this.placeable = placeable;
        
        this.width = geo.width;
        this.height = geo.height;
        this.depth = geo.depth;
        this.dimensions = [geo.width, geo.height, geo.depth].sort(function(a, b){return b-a})
        // console.log(this.dimensions)

        // create geometry
        const geometry = new BoxGeometry( this.width, this.height, this.depth );

        // create material
        // const texture = consts.FLOOR_TEXTURE.clone()
        const texture = new TextureLoader().load(FLOOR_TEXTURE_PNG)
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set( this.dimensions[0]/2, this.dimensions[1]/2 );
        const material = new MeshStandardMaterial( {side: DoubleSide, map: texture, roughness: 1, metalness: 0.5 } );

        let cube = new Mesh( geometry, material );
        // cube.position.copy(pos);
        let m = new Matrix4()
        m.elements = matrix;
        cube.applyMatrix4(m)

        this.add(cube)

        // let quaternion = this.matrix4ToQuaternion(matrix)
        let quaternion = new Quaternion()
        quaternion.setFromRotationMatrix(m).normalize();
        let q1 = new CANNON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w)

        // create physics
        let physicsMaterial = new CANNON.Material();
        physicsMaterial.friction = 0.01;
        physicsMaterial.restitution = 0.1;
        let physicsShape = new CANNON.Box(new CANNON.Vec3(this.width / 2, this.height / 2, this.depth / 2));
        this.physicsBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
        // this.physicsBody.addShape(physicsShape, new CANNON.Vec3(pos.x, pos.y, pos.z), q1);
        this.physicsBody.addShape(physicsShape);
        if (q1.x != 0 || q1.y != 0 || q1.z != 0) {
            this.physicsBody.quaternion = q1;
        }
        this.physicsBody.position = new CANNON.Vec3(pos.x, pos.y, pos.z)
        
        globals.CANNON_WORLD.addBody(this.physicsBody);

        // Add self to parent's update list
        
        // parent.addToUpdateList(this);
    }


    update(timeStamp) {}

    matrix4ToQuaternion(m) {
        let q = new CANNON.Quaternion();
        q.w = Math.sin( Math.max( 0, 1 + m[0,0] + m[1,1] + m[2,2] ) ) / 2; 
        q.x = Math.sin( Math.max( 0, 1 + m[0,0] - m[1,1] - m[2,2] ) ) / 2; 
        q.y = Math.sin( Math.max( 0, 1 - m[0,0] + m[1,1] - m[2,2] ) ) / 2; 
        q.z = Math.sin( Math.max( 0, 1 - m[0,0] - m[1,1] + m[2,2] ) ) / 2; 
        q.x *= Math.sin( q.x * ( m[2,1] - m[1,2] ) );
        q.y *= Math.sin( q.y * ( m[0,2] - m[2,0] ) );
        q.z *= Math.sin( q.z * ( m[1,0] - m[0,1] ) );
        return q;
    }
}

export default EnvironmentCube2;