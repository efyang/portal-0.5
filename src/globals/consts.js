import RING_TEXTURE_PNG from '../../assets/textures/ringTexture.png'
import { AudioLoader, AudioListener, TextureLoader, Audio } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

import CONCRETE_TEXTURE from '../../assets/textures/concrete/Color.jpg'
import CONCRETE_ROUGH_TEXTURE from '../../assets/textures/concrete/Roughness.jpg'
import CONCRETE_NORMAL_TEXTURE from '../../assets/textures/concrete/Normal.jpg'
import CONCRETE_DISP_TEXTURE from '../../assets/textures/concrete/Displacement.jpg'
import CONCRETE_AO_TEXTURE from '../../assets/textures/concrete/AmbientOcclusion.jpg'

import BROKENTILE_TEXTURE from '../../assets/textures/brokenTile/Color.jpg'
import BROKENTILE_ROUGH_TEXTURE from '../../assets/textures/brokenTile/Roughness.jpg'
import BROKENTILE_NORMAL_TEXTURE from '../../assets/textures/brokenTile/Normal.jpg'
import BROKENTILE_DISP_TEXTURE from '../../assets/textures/brokenTile/Displacement.jpg'
import BROKENTILE_AO_TEXTURE from '../../assets/textures/brokenTile/AmbientOcclusion.jpg'

import JumpGruntMP3 from '../../assets/sounds/JumpGrunt.mp3'
import LandingMP3 from '../../assets/sounds/Landing.mp3'
import WalkingMP3 from '../../assets/sounds/Walking.mp3'
import PortalGunFireMP3 from '../../assets/sounds/PortalGunFire.mp3'
import PortalGunErrorMP3 from '../../assets/sounds/PortalGunError.mp3'
import TeleportMP3 from '../../assets/sounds/Teleport.mp3'
import BackgroundMP3 from '../../assets/sounds/BackgroundMusic.mp3'

import PLAYER_MODEL from '../../assets/models/xbot.fbx'
import ANIM_STANDING_IDLE from '../../assets/models/StandingIdle.fbx'
import ANIM_JUMP from '../../assets/models/Jump.fbx'
import ANIM_STATIONARY_RUNNING from '../../assets/models/StationaryRunning.fbx'
import ANIM_BACKWARD_RUNNING from '../../assets/models/RunningBackward.fbx'
import ANIM_RIGHT_STRAFE from '../../assets/models/RightStrafe.fbx'
import ANIM_LEFT_STRAFE from '../../assets/models/LeftStrafe.fbx'
import ANIM_FALLING_IDLE from '../../assets/models/FallingIdle.fbx'

import 'util'
import { notifyPageLoadAsset } from '../util';

const audioLoader = new AudioLoader()
const texLoader = new TextureLoader()
const fbxLoader = new FBXLoader();

export default {
    N_ASSETS: 26,

    /**********************************************************
    * AUDIO
    **********************************************************/
    LISTENER: new AudioListener(),
    JUMP_SOUND: audioLoader.loadAsync(JumpGruntMP3).then(notifyPageLoadAsset),
    LANDING_SOUND: audioLoader.loadAsync(LandingMP3).then(notifyPageLoadAsset),
    WALKING_SOUND: audioLoader.loadAsync(WalkingMP3).then(notifyPageLoadAsset),
    PORTAL_GUN_FIRE_SOUND: audioLoader.loadAsync(PortalGunFireMP3).then(notifyPageLoadAsset),
    PORTAL_GUN_ERROR_SOUND: audioLoader.loadAsync(PortalGunErrorMP3).then(notifyPageLoadAsset),
    TELEPORT_SOUND: audioLoader.loadAsync(TeleportMP3).then(notifyPageLoadAsset),
    BGMUSIC_SOUNDS: [
        {
            sound: audioLoader.loadAsync(BackgroundMP3).then(notifyPageLoadAsset),
            volume: 0.1
        },
    ],

    /**********************************************************
    * PORTALS
    **********************************************************/
    PORTAL_WIDTH: 1.5,
    PORTAL_DEPTH: 2,
    PORTAL_CDBB_HEIGHT: 3,
    PORTAL_HEIGHT: 0.001,
    PORTAL_EPS: 0.01,
    PORTAL_RING_THICKNESS: 0.3,
    PORTAL_COLORS: ['cyan', 'orange'],

    /**********************************************************
    * FILES
    **********************************************************/
    FILES: ['scene7'],

    /**********************************************************
    * TEXTURES
    **********************************************************/
    CONCRETE_TEXTURE_SET: {
        map: texLoader.loadAsync(CONCRETE_TEXTURE).then(notifyPageLoadAsset),
        roughnessMap: texLoader.loadAsync(CONCRETE_ROUGH_TEXTURE).then(notifyPageLoadAsset),
        normalMap: texLoader.loadAsync(CONCRETE_NORMAL_TEXTURE).then(notifyPageLoadAsset),
        displacementMap: texLoader.loadAsync(CONCRETE_DISP_TEXTURE).then(notifyPageLoadAsset),
        aoMap: texLoader.loadAsync(CONCRETE_AO_TEXTURE).then(notifyPageLoadAsset),
        displacementScale: 0,
    },
    BROKENTILE_TEXTURE_SET: {
        map: texLoader.loadAsync(BROKENTILE_TEXTURE).then(notifyPageLoadAsset),
        roughnessMap: texLoader.loadAsync(BROKENTILE_ROUGH_TEXTURE).then(notifyPageLoadAsset),
        normalMap: texLoader.loadAsync(BROKENTILE_NORMAL_TEXTURE).then(notifyPageLoadAsset),
        displacementMap: texLoader.loadAsync(BROKENTILE_DISP_TEXTURE).then(notifyPageLoadAsset),
        aoMap: texLoader.loadAsync(BROKENTILE_AO_TEXTURE).then(notifyPageLoadAsset),
        displacementScale: 1,
    },
    RING_TEXTURE: new TextureLoader().load(RING_TEXTURE_PNG, notifyPageLoadAsset),

    /**********************************************************
    * PLAYER
    **********************************************************/
    PLAYER_MODEL: fbxLoader.loadAsync(PLAYER_MODEL).then(notifyPageLoadAsset),
    PLAYER_ANIMATIONS: {
        ANIM_STANDING_IDLE: fbxLoader.loadAsync(ANIM_STANDING_IDLE).then(notifyPageLoadAsset),
        ANIM_JUMP: fbxLoader.loadAsync(ANIM_JUMP).then(notifyPageLoadAsset),
        ANIM_STATIONARY_RUNNING: fbxLoader.loadAsync(ANIM_STATIONARY_RUNNING).then(notifyPageLoadAsset),
        ANIM_BACKWARD_RUNNING: fbxLoader.loadAsync(ANIM_BACKWARD_RUNNING).then(notifyPageLoadAsset),
        ANIM_RIGHT_STRAFE: fbxLoader.loadAsync(ANIM_RIGHT_STRAFE).then(notifyPageLoadAsset),
        ANIM_LEFT_STRAFE: fbxLoader.loadAsync(ANIM_LEFT_STRAFE).then(notifyPageLoadAsset),
        ANIM_FALLING_IDLE: fbxLoader.loadAsync(ANIM_FALLING_IDLE).then(notifyPageLoadAsset),
    },

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