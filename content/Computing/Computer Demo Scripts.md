---
tags: [computer/demos]
---

The **Commodiesel 64** comes bundled with several demo scripts that showcase the computer's capabilities. These scripts demonstrate various features including graphics, sound, sprites, and controller input.

---

## Demo Scripts

### beep.lua

A simple audio demonstration that plays three sequential beeps at different frequencies.

**What it demonstrates:**
- Basic use of the `beep()` function
- Simple timing with `wait()`
- Program control with `stop()`

**Code behavior:**
- Plays a 440 Hz tone (A4 note) for 0.5 seconds
- Waits 0.5 seconds
- Plays a 523 Hz tone (C5 note) for 0.5 seconds
- Waits 0.5 seconds
- Plays a 659 Hz tone (E5 note) for 0.5 seconds
- Stops the program

**Usage:** `run beep.lua`

---

### demo.lua

A mesmerizing rainbow gradient animation that continuously scrolls across the entire screen.

**What it demonstrates:**
- Disabling text rendering with `render.text = false`
- Creating textures with color gradients
- Sprite scaling and positioning
- Real-time texture pixel manipulation with `texture:SetPixels()`
- Infinite loops for continuous animation

**Code behavior:**
- Creates an 8-pixel wide vertical gradient texture
- Scales it to fill the entire 100x82 screen
- Continuously cycles through color values, creating a sliding rainbow effect
- Updates at maximum speed (no wait delay)

**Usage:** `run demo.lua`

> [!Tip]
> This demo is perfect for testing the computer's graphics performance and understanding how texture updates work.

---

### feedme.lua

An animated character that says "Feed Me!" with synchronized mouth movements and audio.

**What it demonstrates:**
- Complex sprite-based graphics
- Texture creation using pixel arrays
- Sprite properties (scale, offset, position)
- Audio sample playback with `sound.SetSample()`
- Sound pitch modulation with `sound.Mod()`
- Sprite sheet animation using `sprite.offset`

**Code behavior:**
- Disables text rendering
- Creates two eye sprites using pixel art
- Creates an animated mouth sprite with two frames (open/closed)
- Plays a voice sample (Roblox sound asset ID: 108572089171330)
- Animates the mouth opening and closing every 0.2 seconds
- Randomly modulates the pitch of the voice to create variation

**Technical details:**
- Uses white (0xf), red (0x20), and mouth color (0x24) for the face
- Eyes are 8x5 pixels each with 2x scale
- Mouth is 8x10 pixels (two 8x5 frames) with 9x4 scale
- Pitch varies smoothly using interpolation

**Usage:** `run feedme.lua`

---

### music.lua

A procedurally generated music composition with bass, chords, and percussion.

**What it demonstrates:**
- Multi-channel audio synthesis
- Using `spawn()` for concurrent audio threads
- Musical scale programming
- Sound channel management (channels 1-4)
- Procedural music generation
- Drum synthesis using noise channel

**Code behavior:**
- Uses a G major scale: G, A, B, C, D, E, F#
- **Channel 1 & 2:** Play randomized chord progressions with different octaves and duty cycles
- **Channel 3:** Plays bass notes using triangle wave, prints notes to console
- **Channel 4:** Drum machine with kick, hi-hat, and snare patterns

**Musical structure:**
- Speed: 16 beats
- Bass speed: 8 beats
- Kick-HiHat-Snare-HiHat rhythm pattern
- Random chord selection (2nd, 3rd, 4th, or 5th intervals)
- Dynamic volume envelopes on percussion

**Usage:** `run music.lua`

> [!Note]
> The music loops infinitely. Use the `stop` command to halt playback.

---

### pong.lua

A fully-featured Pong game with single-player (vs AI) and two-player modes.

**What it demonstrates:**
- Game development on the Commodiesel 64
- Controller input handling with `control:Connect()`
- Pixel-perfect collision detection
- Custom text rendering system
- Game state management
- AI opponent programming
- Score tracking
- Multi-controller support
- Easter egg (Konami code)

**Features:**
- **1P Mode:** Play against an AI opponent
- **2P Mode:** Play against another player (requires 2 controllers)
- Dynamic ball physics with speed increase on paddle hits
- Angle-based ball deflection
- Countdown timer between rounds
- Win condition at 9 points
- Custom bitmap font rendering for text display

**Controls:**
- **Joystick Up/Down:** Move paddle
- **Button A (main menu):** Start 1-player game
- **Button B (main menu):** Start 2-player game

**Easter egg:**
Enter the Konami code during gameplay: ↑ ↑ ↓ ↓ ← → ← → B A Start

**Technical details:**
- Custom font system with character textures
- Centered text alignment
- Sprite z-index layering
- Sub-pixel collision detection
- Velocity-based paddle deflection
- AI prediction algorithm

**Usage:** `run pong.lua`

---

### s.lua

A simple sprite demonstration with random movement.

**What it demonstrates:**
- Basic texture creation from pixel data
- Sprite instantiation
- Random position generation
- Simple animation loop

**Code behavior:**
- Creates a 4x4 pixel texture with a simple pattern (red and white colors)
- Spawns a sprite at position (20, 20)
- Every second, moves the sprite to a random position on screen

**Usage:** `run s.lua`

> [!Tip]
> This is a great starting point for understanding sprite basics before building more complex projects.

---

## Running Demo Scripts

All demo scripts are pre-installed on the Commodiesel 64. To run any demo:

1. Open the computer terminal
2. Type: `run [script-name].lua`
3. Example: `run demo.lua`

To stop a running script, use the `stop` command.

---

## Learning from Demos

These demo scripts are excellent learning resources. You can:

- Read the source code to understand implementation
- Modify them to experiment with different values
- Use them as templates for your own projects
- Combine techniques from multiple demos

For more information on programming the Commodiesel 64, see the [[Features/Commodiesel 64|Commodiesel 64 documentation]].
