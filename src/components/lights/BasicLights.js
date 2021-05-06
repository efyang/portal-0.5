import { Group, SpotLight, AmbientLight, PointLight } from 'three';

class BasicLights extends Group {
    constructor(...args) {
        // Invoke parent Group() constructor with our args
        super(...args);

        // const dir = new SpotLight(0xffffff, 1.6, 7, 0.8, 1, 1);
        const ambi = new AmbientLight(0xffffff, 1);
        // const hemi = new HemisphereLight(0xffffff, 0x080820, 0.5);
        const light = new PointLight( 0xffffff, 1, 100, 10);
        light.position.set( 0, 10, 0 );

        /*dir.position.set(5, 1, 2);
        dir.target.position.set(0, 0, 0);*/
        this.add(ambi)
        this.add(light)
        //this.add(ambi, light);
    }
}

export default BasicLights;
