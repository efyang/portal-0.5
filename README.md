# Portal 0.5
[Online Demo](https://efyang.dev/portal-proto/)

## Abstract/Introduction
Portal 0.5 is an exciting first person game where a player is able to instantaneously teleport themselves to new locations via portals that they shoot onto surfaces. Players can explore their environment while enjoying the novelty of teleportation and interesting physical interactions. Portal 0.5 leverages the Three.js and Cannon.js libraries to deliver a comprehesive, visually-appealing, and fun demo of the Portal games.

### Goal
Our goal in this final project was to create a demo of the popular Portal games developed by Valve. Specifically, we hoped to implement the core technical features of the game, including rendering, teleportation, and physics. We hope that our demo captures the experience of playing the actual games.

### Previous Work
There have been multiple instances of people reproducing some of the core mechanics of portal, especially the rendering aspects. Most notably, these authors include [torinmr](https://torinmr.github.io/cs148/), [Thomas Rinsma](https://th0mas.nl/2013/05/19/rendering-recursive-portals-with-opengl/), and [Daniel Ilett](https://danielilett.com/2019-12-01-tut4-intro-portals/). Much of our own implementation drew from ideas in their work.

#### Rendering
For rendering portals, the general idea seen in most methods is to place a virtual camera in the position and orientation of the main camera having being "teleported" by its respective portal. This camera would then have a clipping plane equivalent to the output portal's normal plane (so that the object the output portal on would not occlude this view). In this way, one would be able to "see" the scene from the output portal, while still implicitly encoding distance information present in the original camera position. This creates a simple view through a portal which can then be either applied to the input portal mesh through means of setting its texture or using the stencil buffer. The more complex part of portal rendering is to render recursive portals.

In particular, there seem to be two main approaches to drawing recursive portals described in previous works. One of the more complex methods, used by torinmr and Thomas Rinsma in their implementations, involved the usage of the stencil buffer in order to cull the outline of each successive portal render. The stencil buffer is basically another buffer (like the depth buffer) which can be used to check whether to render a specific pixel given the value in the buffer for that pixel location, and some given reference value to compare that stencil buffer value to. On each full scene render, the stencil buffer would first be cleared to be all 0s. The portals themselves would first be rendered with some base reference stencil value, and replace the value in the stencil buffer at the location of its pixels with some set reference value for the portal (e.g. 1), or even increment the current value in the stencil buffer. Successive recursive iterations of portals would then be drawn using the new/incremented stencil buffer as their reference value. Each iteration would teleport the camera through the portal again, thus rendering the new iteration of the portal from a further vantage point and therefore modifying the stencil buffer.
<p align="center">
<img width="300" height="300" src="images/stencilvalues.png">
<br>
<i>
Example of what a stencil buffer might look like using the stencil buffer method after 2 iterations (c. Thomas Rinsma)
</i>
</p>

This method achieves very good results, and seems to have very good performance:

<p align="center">
<img width="400" height="300" src="images/rinsmarender.png">
<br>
<i>
"Companion Cube sees itself" (c. Thomas Rinsma)
</i>
</p>


The other main approach, as used by Daniel Ilett, is to render each virtual camera iteration to a texture, and directly replace the portal texture with this texture. This texture is then shaded with a special screen-space shader (so that it isn't just shrunk down to the portal mesh size), which maps each coordinate on the mesh to its actual screen-space coordinates, and uses these screen-space coordinates to map the texture (avoiding the shrinking problem). This requires that the portals then be rendered deepest-first, which can be done by teleporting the camera however many times the recursion goes first, and then undoing each teleportation on every recursive portal render iteration. An example of how a portal would be rendered is seen below:
<p align="center">
<img width="500" height="300" src="images/screenspaceexample.png">
<br>
<i>
Example of rendering process using the screen-space shading method.
</i>
</p>

This method achieves comparable results quality-wise compared with the stencil buffer method, at the cost of some performance due to having to swap and load the texture out:
<p align="center">
<img width="500" height="300" src="images/screenspacerender.jpg">
<br>
<i>
Example of rendering process using the screen-space shading example (c. Daniel Ilett)
</i>
</p>

### Approach
Our demo builds upon the provided starter code in order to provide a smooth gameplay experience to the player. All of the objects in our demo leverage the Three.js library for graphics, and the Cannon.js library for physics. 

At the beginning, our approach was to first implement a simple planar scene and a simple box for a player model. This was helpful in getting acquainted with the Three.js and Cannon.js classes that we would use throughout our project. Specifically, this helped us get used to creating graphical components and attaching physical bodies to them. In addition, this was an important first step because it allowed us to observe how a simple dynamic component (the player model) interacted with static components (the scene). This would help us throughout the development process to pinpoint bugs in our code. 

The next step was to add additional elements to the scene. To do this, we played around with multiple Three.js and Cannon.js objects in order to see what worked. During this time, we also began thinking about what objects would be useful for the implementations of future features such as portals. For example, we decided to use boxes rather than planes to construct the walls, floor, and ceiling in our scene because we needed the thickness of the boxes in order to make portal teleportation smooth. Having this forethought was incredibly useful because it allowed us to avoid having to re-implement multiple features down the line. We also discovered the Three.js Editor application early on and thought that it would be a good idea to use it to visualize and construct scenes. Since the application exported json files, we modularized code that constructed the corresponding Three.js and Cannon.js objects automatically, allowing us to efficiently design and incorporate scenes. This was helpful both for debugging and for creating more complex scenes.

After that, we began working on the more interesting features, namely the portals, player models, audio, textures, and lighting. Our approach was to split up the repsonsibility for the features so that we could work asynchonously and cover more ground while communicating clearly on our progress and challenges. This proved to be a good strategy since it faciliated a combined expertise on multiple features in a short amount of time. To make communication easier, we utilized Github Issues to mark bugs and features for future reference. 

One thing we could have done better was to discuss features even more in depth and more frequently to ensure that we were exactly on the same page. There were a few times where we had to re-implement a feature due to miscommunication, which hindered our progress. However, we are still very proud of what we were able to accomplish in the short time frame given to us. 

## Methodology
### Project Structure
The project is structed in the following manner: 

- /src/:
    - app.js: entry point into the code. Here, the renderer, scene, camera, and shader are initialized and portals are rendered. In addition, the onAnimationFrameHandler is setup here which consolidates the updates to the application in every timestep. Also, the instruction page is loaded in here
    - globals/: this is where global and const variables are defined and initialized for conveniency
    - components/: 
        - crosshair/: contains the crosshair class which sets up the crosshair
        - jsons/: contains all the json files for the scenes (from the Three.js editor)
        - lights/: contains the lights class which sets up the lights
        - objects/: contains the implementations for all of the objects used in the demo
        - scenes/: loads all the objects into the demo
- /assets/: contains sound clips and textures 

### Frameworks
We chose to utilize the existing project structure, which uses Three.js for 3D object handling and rendering. There exist many alternative web rendering libraries, but Three.js was already familiar to us from other COS426 assignments and was already setup for us to work with. We chose Cannon.js because this already had some documentation for usage in conjunction with Three.js and shared much of the same design philosophy as Three.js, which enabled us to get started with it very quickly. For the documentation reason we decided to choose this library over other libraries, but other js physics libraries would probably have worked just as well. We chose to use a physics library instead of rolling our own despite having simple shapes because there simply wasn't enough time to build and debug a working physics implementation from scratch, and we needed to use advanced features of Cannon.js (such as collision filter groups and masks) in order to achieve the effects that we wanted with portals. Building a whole physics implementation from the ground up was also not the main focus of our project, and our portal implementation ended up being very compatible with Cannon.js.

### Physics
As mentioned, we decided to use the Cannon.js framework for physics. For each static and dynamic object, we defined an equivalent Cannon.js `Body` and added it to the world. For the player model in particular, we found that a simple box body was enough to represent the character's physical body and handle basic collisions, but that could be easily changed in the future. All static objects simply had their masses set to 0, which is the standard way to make objects ignore gravity and be immobile in Cannon.js. This created a relatively easy to debug and think about framework for us to work with. To move the player, we simply applied a force or impulse to the `Body` of the player depending on which keys were currently pressed.

Getting proper friction was one of the challenges we faced with physics. We wanted the player's model to always stay upright and also always face towards the camera, and so this had to be reflected in the physics `Body` for the player as well. However, when friction between the player and the surface was too high, this would result in bouncing, jittiering, and loss of contact with the ground when one tried to move, and was not ideal (because the player `Body` was a box). We solved this by setting friction to essentially 0, and instead using Cannon.js's linearDampening feature on the player `Body`. This would dampen the player's movement as they got too fast, essentially acting like friction.

However, this created problems with jumping and proper gravitational effects. The player would slow down immensely while jumping because of the high linearDampening required to achieve surface friction, which was not physically realistic enough for our purposes. To solve this, we would detect whether the player was in contact with a ground object every iteration, and if not, we would count this player as in a jump and thus reduce the linearDampening for the player while they were in a jump, and also reduce the force applied on movement keys to compensate. This worked very well, which allowed us to have both smooth surface friction and also have proper gravitational momentum.

Another crucial portion of physics was the ability to disable collisions to allow for proper portal behaviour, which we will discuss later on.

### Portal Structure and Teleportation Transform
Physically, each portal consists of a main mesh `BoxGeometry` where the "portaley" parts would be rendered, a plane mesh slightly in front of this mesh that provides a surface for the portal ring texture, and 2 custom non-axis-aligned bounding boxes. For a given portal, we define a matrix which transforms the portal from the origin with y axis looking up to its current position and orientation. We also keep a reference to its paired output portal. The transformation matrix is essentially a simple basis transform which maps the y-axis to the normal of the portal's host surface, and the other two axes to the player's up direction and forward direction that has been combined with the normal to create an orthonormal basis. Thus, we can define all parts of the portal centered at the origin, and simply apply this transformation matrix in order to get its actual position. This transformation is visualized below.

<p align="center">
<img width="500" height="300" src="images/portaldef.jpg">
<br>
<i>
Example of how a base portal is transformed by its transformation matrix
</i>
</p>

This definition forms the basis for our method of teleporting through portals. To teleport a point from one portal's coordinate frame to another, we first apply the input portal's inverse transformation matrix. Because our idea of portals has them "back-to-back" in the conceptual view (like each side of a window), we have to flip the transformed point's x and y coordinates. After this, we apply the output portal's transformation matrix in order to get the final teleported position. To transform a directional vector, we do the same thing, except that it does not make sense to translate a directional vector, so we only apply the rotational components of both matrices. This allows us to teleport both the position and orientation of any object, as well as physical quantities such as velocity or force. The code describing this can be found in `src/components/objects/Portal.js`.

A particular edge case for this transformation is that when we teleport the actual player, we want the player to be "self-righting": that is, the player's up direction even after the transformation should always face towards the global up direction, and there should be no roll present in the player camera. To solve this case, we use a modified variation of [Daniel Ilett's method](https://danielilett.com/2020-01-03-tut4-4-portal-momentum/) in his Portal tutorial series. After teleportation, we create a new basis where the forward direction is the current forward direction, and the up direction is the global up direction. The right basis direction is then the forward direction crossed with the up direction. The actual up direction (to form an ONB) is then the right basis direction crossed with the forward direction. This becomes the player camera's new rotation matrix, and we set its quaternion to reflect this.

Additionally, the two bounding boxes are defined as shown below. These two bounding boxes are named the CDBB (Collision Disable Bounding Box) and STBB (Should Teleport Bounding Box). These bounding boxes are used to selectively disable collisions between objects and the portal's host object, and also to determine whether the object should teleport through the portal on each world update. Note that the STBB is a subset of the CDBB for this reasoning. When a dynamic object is within the CDBB, the collisions between that object and the portal's host object are temporarily turned off for that world step, to allow the object to "go through" or "go into" the portal. When a dynamic object is within the STBB, the object is teleported through that portal.

<p align="center">
<img width="450" height="300" src="images/portalbb.jpg">
<br>
<i>
Example of where the CDBB and STBB are located relative to their associated portal.
</i>
</p>

<p align="center">
<img width="500" height="300" src="images/debug.png">
<br>
<i>
Example of debug mode portals showing their basis and CDBB in-game.
</i>
</p>

### Portal Rendering
As mentioned in the *Previous Work* section, there were two major established approaches to rendering portals, using the stencil buffer or using a screen-space shader along with rendering to textures. Given the time constraints of the project, it seemed most reasonable to attempt to implement one of these methods instead of finding a whole new method to render portals. In the prototyping phase of the project, we tried to implement the stencil buffer approach first. While the performance seemed to be promising as far as we got it (basic non-recursive portal rendering), it ended up being very hard to implement the actual recursive steps of the portal rendering. This difficulty was further compounded by the fact that the stencil buffer is completely opaque, and so there wasn't a really easy way to see which values were currently in the stencil buffer in order to debug our implementation. Furthermore, recursive rendering with the stencil buffer is very hard to reason about in practice, and therefore debug. For this reason, and our subsequent comparatively quick success with the screen-space shader method, we decided to go with the screen-space shader method.

<p align="center">
<img width="500" height="300" src="images/sbattempt.jpg">
<br>
<i>
Attempting to understand the stencil buffer method.
</i>
</p>

To implement the screen-space shader method, each portal mesh had a special screen-space shader and associated texture uniform which mapped each pixel to its screen-space coordinates, and then used those screen-space coordinates to get the pixel in its associated texture uniform. They also included screen dimension uniforms in order to keep rendering correctly even after screen resizes.

On every render pass we created a virtual camera for each portal that was a simple clone of the main camera. We updated the screen dimension uniforms associated with each portal in order to reflect the screen size in the screen-space coordinate calculation correctly even after window resizes. We teleport the virtual camera for each portal through the portal `PORTAL_RECURSION_LEVELS` times in order to put the camera at the equivalent virtual location that would render the deepest instance of the given portal. Then we also set both portals as invisible, as the texture for the portal at initialization is essentially garbage values that we do not want. For each iteration, we set the clipping plane as the plane of the output portal, in order to correctly cull objects that might otherwise occlude the virtual camera. We render the target into a texture, and then set the portal to use this texture and set it as visible again. Because when looking through one portal one will never see the other output portal, we keep the output portal hidden through this process so that there aren't visual artifacts caused by accidentally keeping it visible. We then undo the camera teleportation by one teleportation, and then continue the loop. For a visual reference (same as the one in the *Previous Work* section), refer below:

<p align="center">
<img width="500" height="300" src="images/screenspaceexample.png">
<br>
<i>
Example of rendering process using screen-space shading.
</i>
</p>

Note that we do actually use the stencil buffer in this process, but not to actually render the portals. The stencil buffer optimization is only to mark off places where the portal will actually be, therefore culling much of the scene in the process. In practice, we haven't seen much of a performance boost, however, even with this on. This optimization is much smaller and easier to reason about, which is why we included it.

After both portals are rendered, the whole scene is then finally rendered normally. It's important that both portal main meshes use `MeshBasicMaterial` as opposed to `MeshStandardMaterial`, as this avoids having reflectivity or lighting artifacts from the scene that should not be present on a portal surface.

The relevant rendering code can be found in `src/app.js` and `src/components/objects/Portal/Portal.js`, with some associated globals and constants located in `src/globals/`.

One snag we ran into was how Three.js handled render targets and their respective textures. Three.js does not allow recursive texture rendering; that is, rendering to a texture while using that same texture in the scene. This makes sense as a limitation, as this usage case is not very common. However, this requires that we create a temporary render target in addition to the render target for each portal texture. On every portal render step, we render to the temporary target, and then swap the two render targets, using this rendered texture as the texture for the portal while providing a render target to render the next iteration. By swapping, we avoid having to instantiate multiple new render targets and dispose of them on every iteration, and also create a workaround to Three.js's recursive texture rendering limitation.

One additional corner case we had to consider was that an object could be partially "within" a portal but not hav teleported yet. In this case, the other output portal should show the part of the object that has "teleported". To achieve this effect, we use the same method as [Daniel Ilett](https://danielilett.com/2020-01-03-tut4-4-portal-momentum/): we create a clone of the object's mesh when it is within the portal's CDBB and then teleport that mesh, and show it in the main scene render.

<p align="center">
<img width="500" height="300" src="images/cloning.png">
<br>
<i>
"Where am I?"
</i>
</p>

Using our method, we achieve good quality results, but take large performance hits (to be discussed in a later section):
<p align="center">
<img width="500" height="300" src="images/cornercase.png">
<br>
<i>
A classic corner case.
</i>
</p>

### Portal Placement
To determine valid portal placement, we follow a procedure detailed here. First, we instantiate a Raycaster object from Three.js to find objects that intersect the ray originating from the player and pointing in the direction of the cursor. If the ray intersects at least one object, we consider if a portal can be placed at the point of nearest intersection, *P*, on a face *F* with normal *N*. To do this, we calculate the four corner points of the portal-to-be in world coordinates and check if each point is valid. To determine validity, a new Raycaster object is created with origin (*P* + *N*) and with direction (-1 * *N*), and we check that the first face the new raycaster intersects is equivalent to *F*. Essentially, this is checking that all four corners of the portal-to-be lie unobstructed on the face of nearest intersection of the original raycaster. To ensure this works, the scenes we generate must have edges like such where two faces meet: 

<p align="center">
<img width="500" height="300" src="images/portalPlacement1.png">
<br>
<i>
Example of necessary scene constructions.
</i>
</p>

Furthermore, we need to determine if the portal-to-be overlaps with an already existing portal. To check for overlap, we first compute intermediary points along the edges of the portal-to-be. This is necessary because we check if any of the points along the edges of the portal-to-be (including its corners) fall inside an already existing portal. Since portals can only overlap when they are on the same surface (thanks to our previous validity checking), the portal-to-be can only overlap with the existing portal if they are in the same dimension. This makes checking for overlap easy since we can loop over the edge points of the portal-to-be and check whether each point is inside the existing portal or not. To do so, we follow the formula outlined here: https://math.stackexchange.com/questions/190111/how-to-check-if-a-point-is-inside-a-rectangle, and we compute the area of triangles following the formula outlined here: https://math.stackexchange.com/questions/128991/how-to-calculate-the-area-of-a-3d-triangle. These formulas essentially check whether the sum of triangle areas formed by each edge point of the portal-to-be and each pair of adjacent corners on the existing portal exceeds the area of the existing portal. If it exceeds, then that edge point falls outside of the existing portal. If all edge points fall outside of the existing portal, then the portal-to-be does not overlap the existing portal. If both the previous validity check and this validity check pass, then the portal-to-be is deemed valid and is placed at the point of nearest intersection.

### Collision Filtering for Portals
To have proper portal teleportation behaviour, we have to selectively disable collisions between portal host objects and dynamic objects that are within their CDBB. To achieve this, we utilize the `collisionFilterGroup` and `collisionFilterMask` attributes provided by Cannon.js, described [here](https://github.com/schteppe/cannon.js/blob/master/demos/collisionFilter.html). It is important to note that the definition for collisions being enabled is symmetric: that is, between bodies A and B, *both* bodies must have the other body's `collisionFilterGroup` as part of its `collisionFilterMask`. This means that as long as we remove one half of the condition, we will still disable collisions, which we take advantage of to simplify our logic.

At initialization, all environment objects are added to an environment collision group `CGROUP_ENVIRONMENT`. All dynamic objects are added to a dynamic collision group `CGROUP_DYNAMIC`. All environment objects collide with all dynamic objects. All dynamic objects collide with all objects. When a portal is created on a host object, that host object is removed from the environment collision group and added to a special collision group specific to each portal. By default (on every world step start), a dynamic object will have a mask corresponding to all groups. When a dynamic object enters a portal's CDBB, the dynamic object has the portal host object's collision group removed from its collision mask (for that iteration). This turns off collisions between the dynamic object and the portal host object, as required. This way, if the dynamic object leaves the portal's CDBB in the next iteration, it will again collide with everything. Note that this means that a host object could be in both portal's host objects, if both portals were put on the same host object, and this case would still be handled perfectly fine. Finally, when a portal is removed from a host object, the host object is removed from the portal's collision group. Only if it is in neither of the portal collision groups is it added back into the environment collision group. This successfully handles all collision cases that we needed, and would allow more dynamic objects besides the player to be added in and handled without any change to the collision filtering system.

### Scene Building / Design
To build scenes we utilized the Three.js Editor found here: https://threejs.org/editor/. This editor made visualizing and manipulating scene objects very accessible. After constucting a scene in the editor, we downloaded the entire scene as a json file which includes crucial information such as the dimensions of objects and their respective matrix transformations. We use this information to automatically generate the corresponding Three.js and Cannon.js objects and add them to our scene. One limitation of this approach is that we can only use boxes and not other objects such as cylinders and rings in our scenes. This is because we have hardcoded the generation of specifically box Three.js and Cannon.js objects using the information from the json files. This can be improved by checking for the type of object in the json files while generating the objects, but we found this unnecessary because box's allow us sufficient flexibility already. Another advantage of using the Three.js editor is that we can give objects specific names, which allows us to determine special properties of certain scene elements. For example, we can name an object "unplaceable_0" in the editor and disable the placement of portals onto that object in our code. 

### Textures / Visual Design
Some of the custom textures (the crosshair and portal borders) were designed through Inkscape and GIMP. The crosshair was first designed in inkscape, and then rendered to a png and edited using GIMP to make it easier to use as a texture with the square mesh that we were using for the crosshair. The portal borders were designed in GIMP to match with the dimensions of the portal itself, and used a combination of GIMP filters (including cubism, blurring) to achieve the desired texture. The texture itself was made in all white, so that each portal could simply apply its own color to the texture and there wouldn't have to be two redundant textures for the portal.

To create a somewhat more realistic feel, we used high quality CC0 textures which included roughness, normal, displacement, and ambient occlusion maps in conjunction with Three.js's standard pbr material, `MeshStandardMaterial`. This greatly assisted in creating a more realistic feel in the scene that wasn't completely flat.

### Player Model and Movement
Player movement is controlled by WASD (movement) and Space (jump) keypresses. This is accomplished throguh event handlers that mark keys as pressed in a javascript object. Upon each render loop, if a given movement key is pressed then a force is applied to the model's Cannon.js physical body in the appropriate direction. We also account for multiple movement keys being pressed at once (for example, "W" and "A"), and scale the force accordingly. This implementation is advantageous because it allows the player to move in the four standard directions (up, left, back, and right) as well as combinations of them. Jumps are implemented in a similar fashion where a force is applied upwards onto the Cannon.js body. At the end of the render loop, the model's graphical body's position is updated to match it's physical body's location, which maintains correctness. 

Player models were obtained from Mixamo, which provides charater models and animations for free in fbx format. As such, we used the FBXLoader class of Three.js in order to load in downloaded models and animations, following a guide here: https://sbcode.net/threejs/fbx-animation/. Player model animations are essentially loaded in and saved into an array and depending on which key(s) are pressed, an animation is played. In total we incorporated forward running, backward running, left strafe, right strafe, falling, and idle animations. Smooth animation transitions are accomplished by fadeOut and fadeIn methods provided by the FBXLoader. 

### Audio
Audio is implemented using the AudioListener, AudioLoader, and Audio classes in Three.js. Copyright-free sound clips were sourced from YouTube and https://freesound.org, and all files were converted to mp3. This includes sounds for background music, jumping, landing, portal gun fires/errors, and teleports. Audio is important because it enhances the gameplay experience and provides important indicators of valid portal placements, which is an essential feature in the game. In the code we have different Audio objects for different sounds in order to avoid sounds from interfering with one another. The Audio class also allows us to adjust the volume and settings of each sound independently, which is useful for polishing our demo. 

## Results


## Discussion
### Performance

## Conclusion / Next Steps


## CC Attributes and Credits

This skeleton project was adapted from [edwinwebb's ThreeJS seed project](https://github.com/edwinwebb/three-seed]) by Reilly Bova ’20.

* Icon from [Good Ware](https://www.flaticon.com/free-icon/aperture_2150454) on flaticon

* Ground/Wall textures from [CC0 Textures](https://cc0textures.com/)

* Implementations/Tutorials of Portal rendering and mechanics: [torinmr](https://torinmr.github.io/cs148/), [Thomas Rinsma](?term=aperture&page=2&position=1&page=2&position=1&related_id=2150454&origin=search), [Daniel Ilett](https://danielilett.com/2019-12-01-tut4-intro-portals/)

## License
[MIT](./LICENSE)
