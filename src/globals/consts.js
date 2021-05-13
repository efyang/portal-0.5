import { AudioLoader, AudioListener, TextureLoader, Audio, WebGLRenderer, RepeatWrapping } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import * as assets from 'assets'
import 'util'
import { notifyPageLoadAsset } from '../util';
import * as globals from './globals'

const audioLoader = new AudioLoader()
const texLoader = new TextureLoader()
const fbxLoader = new FBXLoader();
const renderer = new WebGLRenderer({ antialias: true, powerPreference: "high-performance" })

function initTexture(t) {
    renderer.initTexture(t)
    return t
}

function setWrapTexture(t) {
    t.wrapS = RepeatWrapping;
    t.wrapT = RepeatWrapping;
    t.needsUpdate = true;
    return t
}

let BGMUSIC_SOUNDS = [
    {
        sound: audioLoader.loadAsync(assets.ASSETS.YTBackgroundMP3).then(notifyPageLoadAsset),
        volume: 0.1,
        name: "Background Music - Youtube"
    },
    {
        sound: audioLoader.loadAsync(assets.ASSETS.BlueDeeperThanIndigoMP3).then(notifyPageLoadAsset),
        volume: 0.1,
        name: "Blue Deeper Than Indigo - Daniel Birch"
    },
    {
        sound: audioLoader.loadAsync(assets.ASSETS.IndigoGirlMP3).then(notifyPageLoadAsset),
        volume: 0.1,
        name: "Indigo Girl - Daniel Birch"
    },
    {
        sound: audioLoader.loadAsync(assets.ASSETS.SatelliteMP3).then(notifyPageLoadAsset),
        volume: 0.07,
        name: "Satellite - The Freeharmonic Orchestra"
    },
    {
        sound: audioLoader.loadAsync(assets.ASSETS.ChicaneMP3).then(notifyPageLoadAsset),
        volume: 0.07,
        name: "Chicane - Bio Unit"
    },
    {
        sound: audioLoader.loadAsync(assets.ASSETS.IndustrialZoneMP3).then(notifyPageLoadAsset),
        volume: 0.07,
        name: "Industrial Zone - Bio Unit"
    },
    {
        sound: audioLoader.loadAsync(assets.ASSETS.RozkolIMP3).then(notifyPageLoadAsset),
        volume: 0.07,
        name: "I - ROZKOL"
    },
    {
        sound: audioLoader.loadAsync(assets.ASSETS.RozkolIIMP3).then(notifyPageLoadAsset),
        volume: 0.07,
        name: "II - ROZKOL"
    },
    {
        sound: audioLoader.loadAsync(assets.ASSETS.RozkolIIIMP3).then(notifyPageLoadAsset),
        volume: 0.07,
        name: "III - ROZKOL"
    },
    {
        sound: audioLoader.loadAsync(assets.ASSETS.BurdenOfProofMP3).then(notifyPageLoadAsset),
        volume: 0.07,
        name: "Burden of Proof - David Hilowitz"
    },
    {
        sound: audioLoader.loadAsync(assets.ASSETS.DeclassifiedMemoMP3).then(notifyPageLoadAsset),
        volume: 0.07,
        name: "Declassified Memo - David Hilowitz"
    },
    {
        sound: audioLoader.loadAsync(assets.ASSETS.CrisisAvertedMP3).then(notifyPageLoadAsset),
        volume: 0.07,
        name: "Crisis Averted - David Hilowitz"
    },
]

export default {
    N_ASSETS: assets.N_ASSETS,
    RENDERER: renderer,

    /**********************************************************
    * AUDIO
    **********************************************************/
    LISTENER: new AudioListener(),
    JUMP_SOUND: audioLoader.loadAsync(assets.ASSETS.JumpGruntMP3).then(notifyPageLoadAsset),
    LANDING_SOUND: audioLoader.loadAsync(assets.ASSETS.LandingMP3).then(notifyPageLoadAsset),
    WALKING_SOUND: audioLoader.loadAsync(assets.ASSETS.WalkingMP3).then(notifyPageLoadAsset),
    PORTAL_GUN_FIRE_SOUND: audioLoader.loadAsync(assets.ASSETS.PortalGunFireMP3).then(notifyPageLoadAsset),
    PORTAL_GUN_ERROR_SOUND: audioLoader.loadAsync(assets.ASSETS.PortalGunErrorMP3).then(notifyPageLoadAsset),
    TELEPORT_SOUND: audioLoader.loadAsync(assets.ASSETS.TeleportMP3).then(notifyPageLoadAsset),
    LEVEL_TELEPORT_SOUND: audioLoader.loadAsync(assets.ASSETS.LevelTeleportFile).then(notifyPageLoadAsset),
    BGMUSIC_SOUNDS: BGMUSIC_SOUNDS,
    ALL_BGAUDIO_LOADED_PROMISE: Promise.all(BGMUSIC_SOUNDS.map(x => x.sound)),
    WIND_LOOP_SOUND: audioLoader.loadAsync(assets.ASSETS.WindloopSound).then(notifyPageLoadAsset),
    CONGRATS_SOUND: {
        sound: audioLoader.loadAsync(assets.ASSETS.CONGRATS_SOUND).then(notifyPageLoadAsset),
        volume: 0.1,
    },

    /**********************************************************
    * PORTALS
    **********************************************************/
    PORTAL_WIDTH: 1.5,
    PORTAL_DEPTH: 2,
    PORTAL_CDBB_HEIGHT: 3,
    PORTAL_HEIGHT: 0.001,
    PORTAL_EPS: 0.01,
    PORTAL_RING_THICKNESS: 0.3,
    PORTAL_COLORS: [0x00e1ff, 0xffc600],

    /**********************************************************
    * FILES
    **********************************************************/
    LEVELS: {
        LEVEL_0: {
            file: assets.ASSETS.LEVEL_0,
            name: "Level 1: Trapped",
            offset: [0, 0, 0]
        },
        LEVEL_1: {
            file: assets.ASSETS.LEVEL_1,
            name: "Level 2: Open Sky",
            offset: [10000, 0, 0]
        },
        LEVEL_2: {
            file: assets.ASSETS.LEVEL_2,
            name: "Level 3: Leap of Faith",
            offset: [2*10000, 0, 0]
        },
        LEVEL_3: {
            file: assets.ASSETS.LEVEL_3,
            name: "Level 4: Guns & Roses",
            offset: [3*10000, 0, 0]
        },
        LEVEL_4: {
            file: assets.ASSETS.LEVEL_4,
            name: "Level 5: Behind the Scenes",
            offset: [4*10000, 0, 0]
        },
        LEVEL_5: {
            file: assets.ASSETS.LEVEL_VICTORY,
            name: "Level ?!?!",
            offset: [5*10000, 0, 0]
        },
    },
    FILES: ['scene7'],

    /**********************************************************
    * TEXTURES
    **********************************************************/
    CONCRETE_TEXTURE_SET: {
        map: texLoader.loadAsync(assets.ASSETS.CONCRETE_TEXTURE).then(setWrapTexture).then(initTexture).then(notifyPageLoadAsset),
        roughnessMap: texLoader.loadAsync(assets.ASSETS.CONCRETE_ROUGH_TEXTURE).then(setWrapTexture).then(initTexture).then(notifyPageLoadAsset),
        normalMap: texLoader.loadAsync(assets.ASSETS.CONCRETE_NORMAL_TEXTURE).then(setWrapTexture).then(initTexture).then(notifyPageLoadAsset),
        displacementMap: texLoader.loadAsync(assets.ASSETS.CONCRETE_DISP_TEXTURE).then(setWrapTexture).then(initTexture).then(notifyPageLoadAsset),
        aoMap: texLoader.loadAsync(assets.ASSETS.CONCRETE_AO_TEXTURE).then(setWrapTexture).then(initTexture).then(notifyPageLoadAsset),
        displacementScale: 0,
    },
    /*BROKENTILE_TEXTURE_SET: {
        map: texLoader.loadAsync(assets.ASSETS.BROKENTILE_TEXTURE).then(initTexture).then(notifyPageLoadAsset),
        roughnessMap: texLoader.loadAsync(assets.ASSETS.BROKENTILE_ROUGH_TEXTURE).then(initTexture).then(notifyPageLoadAsset),
        normalMap: texLoader.loadAsync(assets.ASSETS.BROKENTILE_NORMAL_TEXTURE).then(initTexture).then(notifyPageLoadAsset),
        displacementMap: texLoader.loadAsync(assets.ASSETS.BROKENTILE_DISP_TEXTURE).then(initTexture).then(notifyPageLoadAsset),
        aoMap: texLoader.loadAsync(assets.ASSETS.BROKENTILE_AO_TEXTURE).then(initTexture).then(notifyPageLoadAsset),
        displacementScale: 1,
    },*/
    RING_TEXTURE: new TextureLoader().load(assets.ASSETS.RING_TEXTURE_PNG, (t) => notifyPageLoadAsset(initTexture(t))),

    /**********************************************************
    * PLAYER
    **********************************************************/
    PLAYER_MODEL: fbxLoader.loadAsync(assets.ASSETS.PLAYER_MODEL).then(notifyPageLoadAsset),
    PLAYER_ANIMATIONS: {
        ANIM_STANDING_IDLE: fbxLoader.loadAsync(assets.ASSETS.ANIM_STANDING_IDLE).then(notifyPageLoadAsset),
        ANIM_JUMP: fbxLoader.loadAsync(assets.ASSETS.ANIM_JUMP).then(notifyPageLoadAsset),
        ANIM_STATIONARY_RUNNING: fbxLoader.loadAsync(assets.ASSETS.ANIM_STATIONARY_RUNNING).then(notifyPageLoadAsset),
        ANIM_BACKWARD_RUNNING: fbxLoader.loadAsync(assets.ASSETS.ANIM_BACKWARD_RUNNING).then(notifyPageLoadAsset),
        ANIM_RIGHT_STRAFE: fbxLoader.loadAsync(assets.ASSETS.ANIM_RIGHT_STRAFE).then(notifyPageLoadAsset),
        ANIM_LEFT_STRAFE: fbxLoader.loadAsync(assets.ASSETS.ANIM_LEFT_STRAFE).then(notifyPageLoadAsset),
        ANIM_FALLING_IDLE: fbxLoader.loadAsync(assets.ASSETS.ANIM_FALLING_IDLE).then(notifyPageLoadAsset),
    },
    CROSSHAIR_NONE_TEXTURE: texLoader.loadAsync(assets.ASSETS.CROSSHAIR_NONE_TEXTURE).then(initTexture).then(notifyPageLoadAsset),
    CROSSHAIR_BLUE_TEXTURE: texLoader.loadAsync(assets.ASSETS.CROSSHAIR_BLUE_TEXTURE).then(initTexture).then(notifyPageLoadAsset),
    CROSSHAIR_ORANGE_TEXTURE: texLoader.loadAsync(assets.ASSETS.CROSSHAIR_ORANGE_TEXTURE).then(initTexture).then(notifyPageLoadAsset),
    CROSSHAIR_BOTH_TEXTURE: texLoader.loadAsync(assets.ASSETS.CROSSHAIR_BOTH_TEXTURE).then(initTexture).then(notifyPageLoadAsset),

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