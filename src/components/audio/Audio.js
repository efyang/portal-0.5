import * as THREE from 'three'
import { Group} from 'three';


class Audio extends Group {
    constructor(...args) {
        super(...args)

        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener();

        // create a global audio source
        const sound = new THREE.Audio( listener );

        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( 'sounds/ambient.ogg', function( buffer ) {
            sound.setBuffer( buffer );
            sound.setLoop( true );
            sound.setVolume( 0.5 );
            sound.play();
        });

        this.add(listener)
    }
}

export default Audio;