import FLOOR_TEXTURE_PNG from '../../assets/textures/floorTexture.png'
import RING_TEXTURE_PNG from '../../assets/textures/ringTexture.png'
import { TextureLoader } from 'three';

export default {
    /**********************************************************
    * PORTALS
    **********************************************************/
    PORTAL_WIDTH: 1.5,
    PORTAL_DEPTH: 2,
    PORTAL_CDBB_HEIGHT: 3,
    PORTAL_HEIGHT: 0.0001,
    PORTAL_EPS: 0.01,
    PORTAL_RING_THICKNESS: 0.3,
    PORTAL_COLORS: ['orange', 'cyan'],

    /**********************************************************
    * FILES
    **********************************************************/
    FILES: ['scene'],

    /**********************************************************
    * FLOOR
    **********************************************************/
    FLOOR_TEXTURE: new TextureLoader().load(FLOOR_TEXTURE_PNG),
    RING_TEXTURE: new TextureLoader().load(RING_TEXTURE_PNG),

    /**********************************************************
    * PLAYER
    **********************************************************/

    /**********************************************************
    * PHYSICS
    **********************************************************/
    // https://github.com/schteppe/cannon.js/blob/master/demos/collisionFilter.html
    // as long as at one of the objects say that it doesn't collide with the other, then they will not collide.
    // we don't have to set collision masks for both.
    // rules:
    // all dynamic objects collide with all environment objects and dynamic objects by default.
    //    all dynamic objects have mask ALL on creation
    //    group DYNAMIC on creation
    // all environment objects collide with dynamic objects by default.
    //    all environment objects have mask DYNAMIC on creation
    //    group ENVIRONMENT on creation
    // when dynamic object d is in bb of portal p, then d should not collide with p's host object.
    //    on create p: set p host object group to PORTAL_HOST_CDISABLE[p]
    //        p host object mask is still DYNAMIC
    //    on trigger bb: set d mask to all except for PORTAL_HOST_CDISABLE[p]
    //        d group is still DYNAMIC
    //        d mask is its ALL & ~PORTAL_HOST_CDISABLE[p]
    // pseudocode:
    // on update loop:
    // for each dynamic object d:
    //     set mask to CGROUP_ALL
    //     for each portal p:
    //         if d in p's bounding box:
    //             set mask &= ~CGROUP_PORTAL_HOST_CDISABLE[p]
    //     no change to group.
    // on creation of portal p:
    //     set previous host object group back to CGROUP_ENVIRONMENT if in neither CGROUP_PORTAL_HOST_CDISABLE's
    //     set new host object group &= CGROUP_PORTAL_HOST_CDISABLE[p]
    //     no change to mask.
    CGROUP_ENVIRONMENT: 1 << 0,
    CGROUP_PORTAL_HOST_CDISABLE: [1 << 1, 1 << 2],
    CGROUP_DYNAMIC: 1 << 3,
    CGROUP_ALL: 0xFF,
}