import { Group, MeshStandardMaterial, Mesh, DoubleSide, RepeatWrapping, BoxGeometry, TextureLoader, Matrix4, Quaternion, FrontSide} from 'three';
import {consts, globals} from 'globals'
import * as CANNON from 'cannon'

class EnvironmentCube2 extends Group {
    constructor(parent, geo, placeable, matrix) {
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

        let scale = 8
        // create geometry
        const geometry = new BoxGeometry( this.width, this.height, this.depth );
        let uvs = geometry.getAttribute("uv")
        uvs.setXY(0, this.height, this.depth)
        uvs.setXY(1, this.height, 0)
        uvs.setXY(2, 0, this.depth)
        uvs.setXY(3, 0, 0)
        uvs.setXY(4, this.height, 0)
        uvs.setXY(5, this.height, this.depth)
        uvs.setXY(6, 0, 0)
        uvs.setXY(7, 0, this.depth)

        uvs.setXY(8, 0, 0)
        uvs.setXY(9, this.width, 0)
        uvs.setXY(10, 0, this.depth)
        uvs.setXY(11, this.width, this.depth)
        uvs.setXY(12, 0, this.depth)
        uvs.setXY(13, this.width, this.depth)
        uvs.setXY(14, 0, 0)
        uvs.setXY(15, this.width, 0)

        uvs.setXY(16, 0, this.height)
        uvs.setXY(17, this.width, this.height)
        uvs.setXY(18, 0, 0)
        uvs.setXY(19, this.width, 0)
        uvs.setXY(20, this.width, this.height)
        uvs.setXY(21, 0, this.height)
        uvs.setXY(22, this.width, 0)
        uvs.setXY(23, 0, 0)

        for (let i = 0; i < uvs.array.length; i++) {
            uvs.array[i] /= scale
        }

        // create material
        let textureSet = consts.CONCRETE_TEXTURE_SET
        let color = 0xffffff
        let metalness = 0
        if (!placeable) {
            color = 0x999999
            metalness = 0.7
            // textureSet = consts.BROKENTILE_TEXTURE_SET
            //scale = 4
        }
        let sideDims = [
            [this.depth, this.height],
            [this.depth, this.height],
            [this.width, this.depth],
            [this.width, this.depth],
            [this.width, this.height],
            [this.width, this.height],
        ]

        let materials = []
        for (let _ of sideDims) {
            const material = new MeshStandardMaterial( {
                side: FrontSide,
                color: color,
                roughness: 1, 
                metalness: metalness
            } );
            materials.push(material)
        }

        /*
        function loadTexture(t, dims, scale) {
            const texture = t.clone()
            texture.wrapS = RepeatWrapping;
            texture.wrapT = RepeatWrapping;
            texture.repeat.set(1, 1);
            //texture.repeat.set( dims[0] / scale, dims[1] / scale);
            texture.needsUpdate = true
            return texture
        }*/

        for (let index in textureSet) {
            const value = textureSet[index]
            for (let i = 0; i < materials.length; i++) {
                const dims = sideDims[i]
                const material = materials[i]

                if (typeof value === "number") {
                    material[index] = value
                } else {
                    value.then((t) => {
                        // material[index] = loadTexture(t, dims, scale)
                        material[index] = t
                        material.needsUpdate = true
                    })
                }
            }
        }

        let cube = new Mesh( geometry, materials );
        // cube.position.copy(pos);
        cube.applyMatrix4(matrix)

        this.add(cube)

        // let quaternion = this.matrix4ToQuaternion(matrix)
        let quaternion = new Quaternion()
        quaternion.setFromRotationMatrix(matrix).normalize();
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
        this.physicsBody.position = new CANNON.Vec3(cube.position.x, cube.position.y, cube.position.z)
        
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