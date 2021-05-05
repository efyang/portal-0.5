
import { LineBasicMaterial, Line, BufferGeometry, BufferAttribute, Group } from 'three';
import { globals } from '../../globals';

class Crosshair extends Group {
    constructor(...args) {
        super(...args)

        // Add a crosshair. Adapted from https://stackoverflow.com/questions/31655888/how-to-cast-a-visible-ray-threejs
        var material = new LineBasicMaterial({ color: 0xAAFFAA });

        // crosshair size
        var x = 0.003, y = 0.003;

        var geometry = new BufferGeometry();

        const vertices = new Float32Array( [
            0, y, 0,
            0, -y, 0,
            0, 0, 0,
            x, 0, 0,
            -x, 0, 0,
        ] );

        // itemSize = 3 because there are 3 values (components) per vertex
        geometry.setAttribute( 'position', new BufferAttribute( vertices, 3 ) );

        var crosshair = new Line( geometry, material );
        // place it in the center
        var crosshairPercentX = 50;
        var crosshairPercentY = 50;
        var crosshairPositionX = (crosshairPercentX / 100) * 2 - 1;
        var crosshairPositionY = (crosshairPercentY / 100) * 2 - 1;

        crosshair.position.x = crosshairPositionX * globals.MAIN_CAMERA.aspect;
        crosshair.position.y = crosshairPositionY;
        crosshair.position.z = -0.3;

        this.add(crosshair)
    }
}

export default Crosshair;