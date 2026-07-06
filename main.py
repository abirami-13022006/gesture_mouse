from vpython import *

scene.title = "3D Earth Rotation"
scene.width = 900
scene.height = 600
scene.background = color.black

# Sun
local_light(pos=vector(0,0,0), color=color.white)

# Earth
earth = sphere(
    pos=vector(0,0,0),
    radius=1,
    texture=textures.earth
)

# Stars
for i in range(200):
    sphere(
        pos=vector(random()-0.5, random()-0.5, random()-0.5)*30,
        radius=0.03,
        color=color.white
    )

# Rotation
while True:
    rate(100)
    earth.rotate(angle=0.01, axis=vector(0,1,0))