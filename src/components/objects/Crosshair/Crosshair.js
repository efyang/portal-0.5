import { Group, LineBasicMaterial, Line, BufferGeometry, BufferAttribute } from 'three';
import * as THREE from 'three';

class Crosshair extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        // Init state
        // this.state = {
            // gui: parent.state.gui,
        // };
       
        // create geometry  
        this.name = 'crosshair';


        // Adapted from https://stackoverflow.com/questions/31655888/how-to-cast-a-visible-ray-threejs
        var material = new LineBasicMaterial({ color: 0xAAFFAA });

        // crosshair size
        // var x = 0.01, y = 0.01;
        var x = 10, y = 10;

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

        crosshair.position.x = crosshairPositionX * camera.aspect;
        crosshair.position.y = crosshairPositionY;

        crosshair.position.z = -0.3;

        this.add( crosshair );

        // Add self to parent's update list
        // parent.addToUpdateList(this);
    }


    update(timeStamp) {}
}

export default Crosshair;
