import { Group, Vector3 } from 'three';
import * as THREE from 'three';
import { EnvironmentCube2 } from 'objects'
import FLOOR_TEXTURE from '../../../../assets/textures/floorTexture.png'
import * as CANNON from 'cannon'


class EnvironmentRoom2 extends Group {

    // bottom centered at position
    constructor(parent) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            gui: parent.state.gui,
        };

        let self = this; 
        
        const loader = new THREE.ObjectLoader();

        const files = ['floor', 'wall1', 'wall2', 'wall3', 'wall4', 'ceiling'];
        let filename;
        
        /*
        for (filename of files) {
            let path = 'src/components/Jsons/' + filename + '.json';
            loader.load(
                // resource URL
                path,
                
                // onLoad callback
                // Here the loaded data is assumed to be an object
                function ( object ) {
                    // const texture = new TextureLoader().load(FLOOR_TEXTURE);
                    // texture.wrapS = RepeatWrapping;
                    // texture.wrapT = RepeatWrapping;
                    // texture.repeat.set( 5, 5);
                    // const material = new MeshToonMaterial( {side: DoubleSide, map: texture } );
                    // object.material = material;

                    console.log(object.position)
                    console.log(object.quaternion)
                    let cube = new EnvironmentCube2(parent, object.geometry, object.matrix);


                    // Add the loaded object to the scene
                    // self.add(object);
    
                    // Add self to parent's update list
                    // parent.addToUpdateList(self)
                },
            
                // onProgress callback
                function ( xhr ) {
                    console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
                },
            
                // onError callback
                function ( err ) {
                    console.error( 'An error happened' );
                }

            );
        }
        */

        // return JSON data from any file path (asynchronous)
        function getJSON(path) {
            return fetch(path).then(response => response.json());
        }

        for (filename of files) {
            let path = 'src/components/Jsons/' + filename + '.json';
            // load JSON data; then proceed
            getJSON(path).then(data => {
                // console.log(data.geometries[0].width)
                let geometries = data.geometries[0]
                console.log(geometries)
                let matrix = data.object.matrix
                let position = new Vector3(matrix[12], matrix[13], matrix[14])
                console.log(position)
                let cube = new EnvironmentCube2(this, geometries, position)
                this.add(cube);
            })
        }
        
        parent.addToUpdateList(this)


        // Floor physics
        var floorMaterial = new CANNON.Material();
        floorMaterial.friction = 0.9;
        var floorShape = new CANNON.Box(new CANNON.Vec3(10,1,10));
        var floorBody = new CANNON.Body({ mass: 0, material: floorMaterial });

        // let floorQuaternion = new CANNON.Quaternion()
        // floorQuaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
        // floorBody.addShape(floorShape, new CANNON.Vec3(0,-1,0), floorQuaternion);
        floorBody.addShape(floorShape, new CANNON.Vec3(0,-1,0));
        parent.state.cworld.addBody(floorBody);

        /*

        // Wall physics
        var wallMaterial = new CANNON.Material();
        wallMaterial.friction = 0.1;
        var wallShape1 = new CANNON.Box(new CANNON.Vec3(10, 1, 5));
        var wallShape2 = new CANNON.Box(new CANNON.Vec3(5, 1, 10));
        
        var walls = new CANNON.Body({ mass: 100000, material: wallMaterial });

        let wallQuaternion1 = new CANNON.Quaternion()
        wallQuaternion1.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);

        let wallQuaternion2 = new CANNON.Quaternion()
        wallQuaternion2.setFromAxisAngle(new CANNON.Vec3(0,0,1),-Math.PI/2);

        walls.addShape(wallShape1, new CANNON.Vec3(0,5,11), wallQuaternion1);
        walls.addShape(wallShape1, new CANNON.Vec3(0,5,-11), wallQuaternion1);
        walls.addShape(wallShape2, new CANNON.Vec3(11,5,0), wallQuaternion2);
        walls.addShape(wallShape2, new CANNON.Vec3(-11,5,0), wallQuaternion2);
        parent.state.cworld.addBody(walls);

        // Ceiling physics
        var ceilMaterial = new CANNON.Material();
        ceilMaterial.friction = 0.9;
        var ceilShape = new CANNON.Box(new CANNON.Vec3(12,1,12));
        var ceilBody = new CANNON.Body({ mass: 0, material: ceilMaterial });

        ceilBody.addShape(ceilShape, new CANNON.Vec3(0,11,0));
        parent.state.cworld.addBody(ceilBody);

        */
    }

    update(timeStamp) {
    }   

    
}

export default EnvironmentRoom2;