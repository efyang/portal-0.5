import * as THREE from 'three'
import { LineBasicMaterial, Line, BufferGeometry, BufferAttribute, Group, MeshBasicMaterial } from 'three';
import { globals, consts } from '../../globals';

class Crosshair extends Group {
    constructor(...args) {
        super(...args)

        // Add a crosshair. Adapted from https://stackoverflow.com/questions/31655888/how-to-cast-a-visible-ray-threejs
        const scale = 0.005
        const x = 3 * scale;
        const y = 4.3 * scale;

        // texture.repeat.set(1.5, 1.5);
        this.previousBlue = false
        this.previousOrange = false
        const geometry = new THREE.PlaneGeometry( x, y );
        const material = new THREE.MeshBasicMaterial( {side: THREE.FrontSide, transparent: true, depthWrite: false, opacity: 0.95} );
        this.crosshair = new THREE.Mesh(geometry, material)
        consts.CROSSHAIR_NONE_TEXTURE.then(tex => {
            this.crosshair.material.map = tex;
            this.crosshair.material.needsUpdate = true;
        })
        // place it in the center
        var crosshairPercentX = 50;
        var crosshairPercentY = 50;
        var crosshairPositionX = (crosshairPercentX / 100) * 2 - 1;
        var crosshairPositionY = (crosshairPercentY / 100) * 2 - 1;

        this.crosshair.position.x = crosshairPositionX * globals.MAIN_CAMERA.aspect;
        this.crosshair.position.y = crosshairPositionY;
        this.crosshair.position.z = -0.1;

        this.add(this.crosshair)
    }

    updateTexture(blue, orange) {
        if (blue === this.previousBlue && orange === this.previousOrange) {
            return
        }

        let newTexture;
        if (blue && orange) {
            newTexture = consts.CROSSHAIR_BOTH_TEXTURE
        } else if (blue) {
            newTexture = consts.CROSSHAIR_BLUE_TEXTURE
        } else if (orange) {
            newTexture = consts.CROSSHAIR_ORANGE_TEXTURE
        } else {
            newTexture = consts.CROSSHAIR_NONE_TEXTURE
        }

        newTexture.then(tex => {
            this.crosshair.material.map = tex
            this.crosshair.material.needsUpdate = true
        })

        this.previousBlue = blue
        this.previousOrange = orange
    }
}

export default Crosshair;