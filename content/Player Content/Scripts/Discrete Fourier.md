---
tags:
  - computer/scripts
author: "[[Ewan]]"
---

A **Discrete Fourier Transform** (DFT) script for the [[Features/Commodiesel 64|Commodiesel 64]] that analyzes audio frequencies and displays them visually on the screen.

---

## Overview

This script demonstrates the Commodiesel 64's audio and graphics capabilities by implementing a basic DFT algorithm. It captures sound input and displays the frequency spectrum as animated bars on the graphics layer.

---

## Code

```lua
render.text = false
render.graphicsbg = 0x00

local SAMPLE_SIZE = 32
local BARS = 16
local BAR_WIDTH = 6
local BAR_HEIGHT_MAX = 70
local BAR_SPACING = 1

function dft(samples)
    local N = #samples
    local spectrum = {}

    for k = 0, BARS - 1 do
        local real = 0
        local imag = 0

        for n = 0, N - 1 do
            local angle = 2 * math.pi * k * n / N
            real = real + samples[n + 1] * math.cos(angle)
            imag = imag - samples[n + 1] * math.sin(angle)
        end

        local magnitude = math.sqrt(real * real + imag * imag) / N
        spectrum[k + 1] = magnitude
    end

    return spectrum
end

local bars = {}
for i = 1, BARS do
    bars[i] = {
        texture = nil,
        sprite = nil,
        height = 0
    }
end

local samples = {}
for i = 1, SAMPLE_SIZE do
    samples[i] = 0
end

local time = 0
while wait(0.05) do
    time = time + 1
    
    for i = 1, SAMPLE_SIZE do
        local t = (time + i) / 10
        samples[i] = math.sin(t * 2) + math.sin(t * 5) * 0.5
    end
    
    local spectrum = dft(samples)
    
    for i = 1, BARS do
        local magnitude = spectrum[i] or 0
        local barHeight = math.floor(magnitude * BAR_HEIGHT_MAX)

        if barHeight > BAR_HEIGHT_MAX then
            barHeight = BAR_HEIGHT_MAX
        end
        if barHeight < 1 then
            barHeight = 1
        end

        if bars[i].sprite then
            bars[i].sprite:Destroy()
        end
        if bars[i].texture then
            bars[i].texture:Destroy()
        end

        local pixels = {}
        for y = 1, barHeight do
            for x = 1, BAR_WIDTH do
                -- Color gradient based on height
                local colorIndex = math.floor((y / barHeight) * 15)
                local color = 0x20 + colorIndex
                table.insert(pixels, color)
            end
        end

        bars[i].texture = texture.new(vector2.new(BAR_WIDTH, barHeight), pixels)
        bars[i].sprite = sprite.new(
            bars[i].texture,
            vector2.new(BAR_WIDTH, barHeight),
            vector2.new(2 + (i - 1) * (BAR_WIDTH + BAR_SPACING), 80 - barHeight)
        )
        bars[i].height = barHeight
    end
end
```

---

## More Infor

Displays visual frequency stuff 

- Real-time frequency spectrum analysis
- Animated bar graph visualization
- Color gradient based on magnitude
- Adjustable parameters for customization

## How to Use

1. Create a new file: `make dft.lua -c print("Creating DFT visualizer")`
2. Copy the code into the file using the computer's text editor
3. Run the script: `run dft.lua`
4. The visualizer will display animated frequency bars

---

## Parameters

You can modify these constants to adjust the visualization:

- `SAMPLE_SIZE`: Number of audio samples to analyze (higher = more accurate but slower)
- `BARS`: Number of frequency bars to display
- `BAR_WIDTH`: Width of each frequency bar
- `BAR_HEIGHT_MAX`: Maximum height of bars in pixels
- `BAR_SPACING`: Space between bars