---
tags: [computer/docs]
---

The **Commodiesel 64** is a personal computer added to the game. Designed for hobbyists and Lua programmers of varying skill levels, the Commodiesel 64 is ideal for creating games, controlling components, and automating tasks.

Your Commodiesel 64 is bundled with everything you need to begin computing immediately:

- PC Monitor
- PC Speaker
- 10 GPIO Expansions
- 2 Computer Joysticks

---

## Overview

The **Commodiesel 64** runs code in a modified Lua sandbox environment, featuring lots of added libraries and functionality designed to make it as simple as possible to interface with the computer hardware.

### Shell Commands

- **edit**: edit file contents [filename]
- **del**: permanently delete a file [filename]
- **echo**: write arguments to the output
- **read**: write file contents to output [filename]
- **help**: list all builtin commands
- **list**: list files
- **stop**: end running program
- **make**: create a new file [filename -c contents]
- **run**: execute .lua files [filename] [arguments]
- **cls**: clear text in terminal

### Specifications

- 256 colour, sprite based graphics
- 16kb video memory
- 8 cpu threads
- Graphical resolution of 100x82
- Text resolution of 300x246
- 5 channel soundchip, with one sample channel

---

## Getting Started

To run code you must first create a `.lua` file that contains your code.

**Example:** `make test.lua -c print("test")`

Then execute your code by running the file.

**Example:** `run test.lua`

It is recommended that you have baseline knowledge of the Lua programming language before continuing.

> [!Note]
> Loops can only run 60 times a second, and may slow down according to server TPS. Nested loops may also cause slowdown.

### Demo Scripts

The Commodiesel 64 comes pre-loaded with several demo scripts that showcase its capabilities. These include:

- **beep.lua** - Simple audio demonstration
- **demo.lua** - Rainbow gradient animation
- **feedme.lua** - Animated character with audio
- **music.lua** - Procedurally generated music
- **pong.lua** - Full Pong game with AI
- **s.lua** - Basic sprite movement

For detailed information about each demo script, see [[Features/Computer/Computer Demo Scripts|Computer Demo Scripts]].

---

## Lua Programming

Code in the commodiesel runs in a modified lua sandbox environment, featuring lots of added libraries and functionality designed to make it as simple as possible to interface with the computer hardware.

If you do not know how to run code please read the Introduction page.

This manual does not intend to teach you how to write lua, and primarily serves as documentation for what has been added.

### Globals

These are functions and variables which are accessible anywhere within your program.

#### `stop()`

This will immediately stop your program in its tracks. Identical to the stop command.

#### `beep(hz, duration)`

Uses the Beeper inside of the computer to generate a tone for a set duration.

#### `arguments`

This is a numbered table containing extra arguments provided after the filename in the run command.

---

## Modules

Module scripts are separate Lua files that packages code into table for use with other programs. They can have either `.lua` or `.mod` file extensions.

**Example module "mod.lua":**

```lua
local module = {}
module.hi = "hello"
function module.testfunc(str)
    print(str)
end
return module
```

**Example usage:**

```lua
local module = require("mod.lua")
print(module.hi)
module.testfunc("world")
```

---

## Drawing Colours

### Colour Palette

There are a total of 256 colours that can be displayed.

Below is the colour palette formatted into a 16x16 table, this is ideal for representing the colours in hexadecimal. For example `0x20 = 32 = red`, `0x2c = 44 = dark red`

![[colorchart.png]]

Before creating graphics you may want to turn off the text rendering.

```lua
render.text = false
```

You can now test colours by changing the graphics background

```lua
render.graphicsbg = 0xa8
```

---

## Textures

Textures store an array of pixels, textures can be assigned to sprites to display them on screen.

Textures have a max size of 8x128.

To create a texture, use

```lua
texture.new(size: vector2, pixeldata: {number})
```

**Example usage:**

```lua
local C = 0x0f
local t = texture.new(vector2.new(4, 4), {
C,0,0,C,
0,0,0,0,
C,0,0,C,
0,C,C,0,
})
```

### Methods

#### `texture:SetPixels(pixeldata: {number}, offset: number?)`

Updates pixels at runtime.

```lua
texture.new(vector2.new(6, 1))
wait(1)
t:SetPixels({0x20, 0x40, 0x60, 0x80, 0xa0, 0xc0})
```

#### `texture:Destroy()`

Deletes a texture from the texture cache. Do not call this if there are sprites on screen that are using the texture.

---

## Sprites

Sprites display textures on screen.

Sprites have a max size of 8x82

To create a sprite, use

```lua
sprite.new(texture, size: Vector2, position: Vector2)
```

**Example usage:**

```lua
render.text = false
local C = 0x70
local t = texture.new(vector2.new(4, 4), {
C,0,0,C,
0,0,0,0,
C,0,0,C,
0,C,C,0,
})
local s = sprite.new(t, vector2.new(4, 4))
s.scale = vector2.new(5, 5)
s.position = vector2.new(40,31)
```

### Properties

#### `sprite.position: vector2`

#### `sprite.scale: vector2`

Scales/tiles the sprite to any dimension which is a multiple of the base size

#### `sprite.offset: vector2`

Changes the pixel offset of the texture area to be displayed. Sprite sheets can be implemented through this by packing multiple frames onto a single texture and changing the offset using this property.

**Example usage:**

```lua
render.text = false
local c = 0x0f
local tex = texture.new(vector2.new(2, 8), {
    0,c,c,c,0,c,0,c, -- frame 1
    c,0,0,c,c,0,c,c, -- frame 2
})
local s = sprite.new(tex, vector2.new(2, 4), vector2.new(45, 31))
s.scale = vector2.new(5, 5)
while wait(1) do
    s.offset = vector2.new(0, 4) -- offset to frame 2
    wait(1)
    s.offset = vector2.new(0, 0) -- offset back to frame 1
end
```

#### `sprite.scaletype: Enum.ScaleType.Stretch or Enum.ScaleType.Tile`

Can also be a number: 1 = Stretch, 2 = Tile

#### `sprite.zindex: number`

zindex number range is between -128 and 128

### Methods

#### `sprite:Destroy()`

#### `sprite:Clone()`

Creates a new sprite with the same properties.

---

## Render

Contains general rendering values

#### `render.text = bool`

Enables/Disables the text layer

#### `render.graphics = bool`

Enables/Disables the graphics layer

#### `render.priority = number`

Changes the order of the text and graphics layer

#### `render.textbg = colour`

Sets the background colour of the text layer

#### `render.graphicsbg = colour`

Sets the background colour of the graphics layer

#### `render.textcolour = colour`

Sets the colour of the terminal text

---

## Sound

The computer has a 5 channel sound chip.

- Channels 1-2: Square wave, you can set the duty to make it a pulse wave
- Channel 3: Triangle wave
- Channel 4: Noise
- Channel 5: Sample, you can set this to any audio below 3.5s in duration

#### `sound.Play(channel, note, volume, duty)`

Notes can be either a frequency (hz) or a string. Providing a blank note will end the note playing in the channel.

```lua
sound.Play(1, 440, 1, 2) -- play 440hz on channel 1
sound.Play(3, "c3") -- play note c3 on channel 3
wait(2)
sound.Play(1) -- stop playing channel 1 (pulse wave)
sound.Play(3) -- stop playing channel 3 (triangle wave)
```

#### `sound.Mod(channel, note, volume, duty)`

This is much like play, except that it will not start any new notes from playing. All arguments are optional except for channel.

```lua
sound.Play(1, 220)
for i=1, 220 do
    sound.Mod(1, 220+i) -- change pitch
end
sound.Mod(1, nil, nil, 3) -- change duty
```

#### `sound.SetSample(sample, oneshot)`

Sets the sound to be played in the 5th channel. Sample must be a roblox sound asset id and must be under 3.5s in duration.

The sound will not loop if oneshot is set to true.

```lua
sound.SetSample(117171737399928)
sound.Play(5, 440, 1)
```

---

## OS

#### `os.clock()`

Precise amount of time since the computer turned on.

#### `os.gettime()`

Ingame time returned as tuple (seconds, minutes, hours)

#### `os.getclock()`

Ingame time returned as a string hours:minutes

#### `os.cls()`

Clears text output

#### `os.makefile(filename: string, contents: string)`

Creates or overwrites a file on the system.

#### `os.readfile(filename: string)`

Returns the contents of a file. Returns 'false' if file is not found on the system.

---

## GPIO

GPIO expansions enable the computer to send and receive electrical signals.

GPIO expansions must be connected to the expansion slot on the back of the computer first. Ports are numerically addressed closest to furthest.

Red is output, Blue is input.

#### `gpio.Power(port_index: number, voltage: number?, colour: Color3?)`

**Example usage:**

```lua
while wait(.1) do
gpio.power(1)
wait(.1)
gpio.power(2)
end
```

#### `gpio:Connect(port_index: number, callback: function(voltage: number?, colour: Color3))`

**Example usage:**

```lua
gpio:Connect(1, function()
    print("input 1")
    beep(440, 0.2)
end)
gpio:Connect(2, function()
    print("input 2")
    beep(523, 0.2)
end)
```

> [!Note]
> Voltage is currently unused and is for forwards compatibility with the building overhaul.

---

## Control

`control[1]` and `control[2]` are a table with the current input state for the given controller. It will be set to false if no controller is connected to the port indexed.

#### `control:Connect(contoller_port: number, callback: function(input_type: string, pressed/direction: bool | vector2, keycode: Enum.KeyCode))`

This will fire upon up and down button presses, and each time the joystick is moved.

Keyboard input is on port 0.

Valid Input Types are:

- ButtonA
- ButtonB
- ButtonStart
- Joystick
- Keyboard

**Input handler example:**

```lua
local joystick_direction = vector2.zero
control:Connect(1, function(input_type, value)
    if input_type == "Joystick" then
        joystick_direction = value
        print(joystick_direction)
    elseif input_type == "ButtonA" then
        if value == true then
            print("pressed button a!")
        else
            print("unpressed button a!")
        end
    end
end)
```
