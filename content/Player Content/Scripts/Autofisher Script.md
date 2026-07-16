A **Autofisher** Script for the [[Features/Commodiesel 64|Commodiesel 64]] that when setup physically and coded will fish automatically. 

---
## Overview

This script uses 2 gpio expanders and a set of other components to fish automatically with the only thing you have to do is build it, add the script, and run it. Go to [^Parameters] to learn what command to use with each rod.

## Code

```lua

-- SETTINGS --

local castOnRun = true -- determines whether or not the fisher immediately starts fishing upon running the code

local oneShot = false -- when true, the fisher will cast and reel once and pause fishing afterwards

  

local castTime = 8 -- the time the fisher will take spinning to cast the rods

local reelDelay = 5 -- the time it takes for the fisher to start casting again after dropping previous catches

  

local castPort = 1 -- the port where casting signals will be sent

local reelPort = 2 -- the port where reeling signals will be sent

local signalPort = 1 -- the port where state change signals are receieved

  

local reelingBGColor = 0x70

local castingBGColor = 0xB0

local idleBGColor = 0x20

local caughtBGColor = 0x50

  

local reelSoundId = 107317726222506

local castSoundId = 119135010875996

local dropSoundId = 12222253

  

-- FUNCTIONALITY --

local state = 1 -- 1 = idle, 2 = casting, 3 = reeling

local casted = false

  

local function reel()

    state = 3

    gpio.Power(reelPort) -- start spinning to reel

    render.graphicsbg = reelingBGColor

  

    sound.SetSample(reelSoundId, true)

    sound.Play(5, 440, 1)

end

  

local function cast()

    state = 2

  

    render.graphicsbg = castingBGColor

  

    sound.SetSample(castSoundId, true)

    sound.Play(5, 440, 1)

  

    gpio.Power(castPort) -- start spinning to cast

    task.wait(castTime)

    gpio.Power(castPort) -- stop the cast spinning

  

    casted = true

    state = 1

  

    render.graphicsbg = idleBGColor

end

  

local function dropCatches()

    state = 1

    casted = false

  

    render.graphicsbg = caughtBGColor

  

    sound.SetSample(dropSoundId, true) -- victory.wav! :D

    sound.Play(5, 440, 1)

  

    gpio.Power(reelPort) -- stop the reel spinning

  

    if oneShot == false then

        task.wait(castTime)

        cast()

    else

        stop()

    end

end

  

local function changeState()

    if state == 1 then

        if casted then

            reel()

        else

            cast()

        end

    elseif state == 3 then 

        dropCatches()

    end

end

  

gpio:Connect(signalPort, changeState)

  

if castOnRun then

    -- start fishing!

    cast()

end

**
```

---
## How to Use

1. Create a new file: `make autofish.lua`
2. Copy the code into the file using the computer's text editor
3. Run the script: `run autofish.lua`
4. The visualizer will display animated frequency bars

---
## Parameters
[Parameters]: 

Pumpkin = run autofish.lua 360 60 0

Gold = run autofish.lua 560 60 0

Alien = run autofish.lua 180 15 0

As for other rods, im not sure what each one is

## More Info

The first number (e.g. 360 in run autofish.lua 360) is the time it takes to catch a fish
The second number is how long the failsafe lasts for
The third number is how many times it casts I think 0 is inf idk I didn't make this

The tutorial is on youtube. **[https://www.youtube.com/watch?v=19V1ShAZliA&](https://www.youtube.com/watch?v=19V1ShAZliA&t=11s)**