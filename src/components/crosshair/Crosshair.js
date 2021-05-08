import * as THREE from 'three'
import { LineBasicMaterial, Line, BufferGeometry, BufferAttribute, Group, MeshBasicMaterial } from 'three';
import { globals } from '../../globals';
import CROSSHAIR_TEXTURE_PNG from '../../../assets/textures/crosshair.png'

class Crosshair extends Group {
    constructor(...args) {
        super(...args)

        // Add a crosshair. Adapted from https://stackoverflow.com/questions/31655888/how-to-cast-a-visible-ray-threejs
        let x = 0.015;
        let y = 0.015;

        const texture = new THREE.TextureLoader().load(CROSSHAIR_TEXTURE_PNG)
        // texture.repeat.set(1.5, 1.5);
        const geometry = new THREE.PlaneGeometry( x, y );
        const material = new THREE.MeshBasicMaterial( {side: THREE.FrontSide, map: texture, transparent: true, depthWrite: false} );
        let crosshair = new THREE.Mesh(geometry, material)
        // place it in the center
        var crosshairPercentX = 50;
        var crosshairPercentY = 50;
        var crosshairPositionX = (crosshairPercentX / 100) * 2 - 1;
        var crosshairPositionY = (crosshairPercentY / 100) * 2 - 1;

        crosshair.position.x = crosshairPositionX * globals.MAIN_CAMERA.aspect;
        crosshair.position.y = crosshairPositionY;
        crosshair.position.z = -0.1;

        this.add(crosshair)
    }
}

export default Crosshair;