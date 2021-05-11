import RING_TEXTURE_PNG from './textures/ringTexture.png'

import CONCRETE_TEXTURE from './textures/concrete/Color.jpg'
import CONCRETE_ROUGH_TEXTURE from './textures/concrete/Roughness.jpg'
import CONCRETE_NORMAL_TEXTURE from './textures/concrete/Normal.jpg'
import CONCRETE_DISP_TEXTURE from './textures/concrete/Displacement.jpg'
import CONCRETE_AO_TEXTURE from './textures/concrete/AmbientOcclusion.jpg'

import BROKENTILE_TEXTURE from './textures/brokenTile/Color.jpg'
import BROKENTILE_ROUGH_TEXTURE from './textures/brokenTile/Roughness.jpg'
import BROKENTILE_NORMAL_TEXTURE from './textures/brokenTile/Normal.jpg'
import BROKENTILE_DISP_TEXTURE from './textures/brokenTile/Displacement.jpg'
import BROKENTILE_AO_TEXTURE from './textures/brokenTile/AmbientOcclusion.jpg'

import JumpGruntMP3 from './sounds/JumpGrunt.mp3'
import LandingMP3 from './sounds/Landing.mp3'
import WalkingMP3 from './sounds/Walking.mp3'
import PortalGunFireMP3 from './sounds/PortalGunFire.mp3'
import PortalGunErrorMP3 from './sounds/PortalGunError.mp3'
import TeleportMP3 from './sounds/Teleport.mp3'
import YTBackgroundMP3 from './sounds/YTBackgroundMusic.mp3'
import BlueDeeperThanIndigoMP3 from './sounds/Daniel Birch - Blue Deeper Than Indigo.mp3'
import IndigoGirlMP3 from './sounds/Daniel Birch - Indigo Girl.mp3'
import SatelliteMP3 from './sounds/The Freeharmonic Orchestra - Satellite.mp3'
import ChicaneMP3 from './sounds/Bio Unit - Chicane.mp3'
import IndustrialZoneMP3 from './sounds/Bio Unit - Industrial Zone.mp3'
import RozkolIMP3 from './sounds/ROZKOL - I.mp3'
import RozkolIIMP3 from './sounds/ROZKOL - II.mp3'
import RozkolIIIMP3 from './sounds/ROZKOL - III.mp3'

import PLAYER_MODEL from './models/xbot.fbx'
import ANIM_STANDING_IDLE from './models/StandingIdle.fbx'
import ANIM_JUMP from './models/Jump.fbx'
import ANIM_STATIONARY_RUNNING from './models/StationaryRunning.fbx'
import ANIM_BACKWARD_RUNNING from './models/RunningBackward.fbx'
import ANIM_RIGHT_STRAFE from './models/RightStrafe.fbx'
import ANIM_LEFT_STRAFE from './models/LeftStrafe.fbx'
import ANIM_FALLING_IDLE from './models/FallingIdle.fbx'

export const ASSETS = {
    RING_TEXTURE_PNG: RING_TEXTURE_PNG,

    CONCRETE_TEXTURE: CONCRETE_TEXTURE,
    CONCRETE_ROUGH_TEXTURE: CONCRETE_ROUGH_TEXTURE,
    CONCRETE_NORMAL_TEXTURE: CONCRETE_NORMAL_TEXTURE,
    CONCRETE_DISP_TEXTURE: CONCRETE_DISP_TEXTURE,
    CONCRETE_AO_TEXTURE: CONCRETE_AO_TEXTURE,

    BROKENTILE_TEXTURE: BROKENTILE_TEXTURE,
    BROKENTILE_ROUGH_TEXTURE: BROKENTILE_ROUGH_TEXTURE,
    BROKENTILE_NORMAL_TEXTURE: BROKENTILE_NORMAL_TEXTURE,
    BROKENTILE_DISP_TEXTURE: BROKENTILE_DISP_TEXTURE,
    BROKENTILE_AO_TEXTURE: BROKENTILE_AO_TEXTURE,

    JumpGruntMP3: JumpGruntMP3,
    LandingMP3: LandingMP3,
    WalkingMP3: WalkingMP3,
    PortalGunFireMP3: PortalGunFireMP3,
    PortalGunErrorMP3: PortalGunErrorMP3,
    TeleportMP3: TeleportMP3,
    YTBackgroundMP3: YTBackgroundMP3,
    BlueDeeperThanIndigoMP3: BlueDeeperThanIndigoMP3,
    IndigoGirlMP3: IndigoGirlMP3,
    SatelliteMP3: SatelliteMP3,
    ChicaneMP3: ChicaneMP3,
    IndustrialZoneMP3: IndustrialZoneMP3,
    RozkolIMP3: RozkolIMP3,
    RozkolIIMP3: RozkolIIMP3,
    RozkolIIIMP3: RozkolIIIMP3,

    PLAYER_MODEL: PLAYER_MODEL,
    ANIM_STANDING_IDLE: ANIM_STANDING_IDLE,
    ANIM_JUMP: ANIM_JUMP,
    ANIM_STATIONARY_RUNNING: ANIM_STATIONARY_RUNNING,
    ANIM_BACKWARD_RUNNING: ANIM_BACKWARD_RUNNING,
    ANIM_RIGHT_STRAFE: ANIM_RIGHT_STRAFE,
    ANIM_LEFT_STRAFE: ANIM_LEFT_STRAFE,
    ANIM_FALLING_IDLE: ANIM_FALLING_IDLE,
}

export const N_ASSETS = Object.keys(ASSETS).length