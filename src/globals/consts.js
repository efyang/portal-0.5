import FLOOR_TEXTURE_PNG from '../../assets/textures/floorTexture.png'
import { TextureLoader } from 'three';

export default {
    /**********************************************************
    * PORTALS
    **********************************************************/
    PORTAL_WIDTH: 1.5,
    PORTAL_DEPTH: 2,
    PORTAL_CDBB_HEIGHT: 0.5,
    PORTAL_HEIGHT: 0.0001,
    RECURSIVE_PORTAL_LEVELS: 7,
    PORTAL_EPS: 0.01,

    /**********************************************************
    * FILES
    **********************************************************/
    FILES: ['scene'],

    /**********************************************************
    * FLOOR
    **********************************************************/
    FLOOR_TEXTURE: new TextureLoader().load(FLOOR_TEXTURE_PNG),

    /**********************************************************
    * PLAYER
    **********************************************************/
}