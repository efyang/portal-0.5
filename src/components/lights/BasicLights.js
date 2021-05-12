import { Group, SpotLight, AmbientLight, PointLight, Vector3, SpotLightHelper } from 'three';
import * as THREE from 'three'

class BasicLights extends Group {
    constructor(parent, ...args) {
        // Invoke parent Group() constructor with our args
        super(...args);
        this.parent = parent

        /*
        const dir = new SpotLight(0xffffff, 1, 0, Math.PI/2, 1, 2);
        dir.position.set(-5, 10, 0);
        this.add(dir)
        this.add(new SpotLightHelper(dir))

        const dir2 = new SpotLight(0xffffff, 1, 0, Math.PI/2, 1, 2);
        dir2.position.set(5, 5, 0);
        dir2.target.position.set(0, 5, 0)
        this.add(dir2)
        this.add(dir2.target)
        const dir2Helper = new SpotLightHelper(dir2)
        this.add(dir2Helper)
        dir2.target.updateMatrixWorld()
        dir2Helper.update()*/

        //this.add(dir)
        const ambi = new AmbientLight(0xffffff, 0.2);
        this.add(ambi)
        //const hemi = new THREE.HemisphereLight(0xFFEEA4, 0x7E7E7E, 2);
        //this.add(hemi)
        //const dir = new THREE.DirectionalLight(0xffffff, 0.5)
        //dir.position.set(0,10,0)
        //this.add(dir)
        /*
        {
        const light = new PointLight( 0xffffff, 1, 0, 5);
        light.position.set( 0, 8, 0 );
        this.add(light)
        let helper = new THREE.PointLightHelper(light)
        this.add(helper)
        this.parent.debugMeshes.push(helper)
        }

        {
        const light = new PointLight( 0xffffff, 0.3, 0, 5);
        light.position.set( 0, 2, 0 );
        this.add(light)
        let helper = new THREE.PointLightHelper(light)
        this.add(helper)
        this.parent.debugMeshes.push(helper)
        }*/
        /*

        const light2 = new PointLight( 0xffffff, 0.5, 0, 2);
        light2.position.set( -5, 8, -5 );
        this.add(light2)*/

        /*dir.position.set(5, 1, 2);
        dir.target.position.set(0, 0, 0);*/
        //this.add(ambi)
        //this.add(ambi, light);
    }
}

export default BasicLights;
