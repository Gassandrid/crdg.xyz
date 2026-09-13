# Overview

A **Sequencer** is a sequential logic circuit used to cycle through a series of binary states in a fixed order. Each incoming pulse advances the circuit to the next combination, allowing it to count signals, create delays, and activate devices based on the current state.

The number of states increases exponentially with the number of transistors used. Since each transistor can hold one of two states, a sequencer containing $x$ transistors can represent:

> $N = 2^x$

where $N$ is the number of distinct states in one complete cycle.

For example, a sequencer containing 3 transistors has:

> $N = 2^3 = 8$

distinct states, and therefore requires 8 input pulses to return to its original state.

# Simple Sequencer assembly guide

Here you'll learn how to assemble a simple sequencer, that will be useful for learning the basics and then applying the principles to any other contraption.

## Components Required

Transistor: *At least* 2, but there can be as many as desired. In this case, we will use 3.

Cable: 2. (Or 1, it's optional)

Cardboard: 1 (In this case, it will be used as a base, but it's not necessary)

Button: 1

LED Light: 1 (Will be used as our way to ensure that a cycle has been completed succesfully)

## Assembling

Assembling a sequencer is relatively simple.
First, you will need to get the transistors and glue them together so that the blue part of one transistor touches the grey part of the next, joining them with a line of glue, as shown in the following image:

> ![[wiki-1786430018133-ae533776-Captura de pantalla 2026-08-11 003202.png]]
>
>
> The way transistors should be glued together.

Gluing them in this way will allow the current to flow correctly through the transistors.

After gluing all your transistors together as shown in the image, you may put your transistors on any base that you'd like. In this case, I'm using a piece of cardboard combined with the red part of an instant release to make it smooth, then painted it green. (For more information on this, see [[Anvil]])

> ![[wiki-1786430494395-d6db59f9-Captura de pantalla 2026-08-11 003824.png]]
>
>
> Transistors glued to a cardboard base.

After this, you may glue a button onto the base, and connect said button onto the *blue* end with a cable. Then, glue an LED Light onto the cardboard, and connect it to the *grey* end.

## Finished Product

Once you're done following each step of the guide, you should end up with something similar to this:

> ![[wiki-1786430845484-cf2c816b-Captura de pantalla 2026-08-10 235747.png]]
>
>
> Finished Sequencer. (Golden glue was added to indicate more clearly where each thing is connected to)

This sequencer offers a total of *8* distinct states (`000` to `111`). Upon completing a full cycle by pressing the button 8 times, the circuit resets to its initial state (`000`), triggering the LED Light to change its state (OFF/ON).

# A deeper dive into how the Sequencer works

Rather than representing a single active stage, the sequencer progresses through different combinations of transistor states. Each pulse changes the stored state of the circuit, producing a new binary combination.

These combinations can be interpreted as a binary count. In a three-transistor sequencer, for example, the sequence may be represented as:

`000 → 001 → 010 → 011 → 100 → 101 → 110 → 111 → 000`

Each digit represents the state of one transistor, where `1` represents an active transistor and `0` represents an inactive transistor.

Because each transistor changes state at a different rate, the circuit effectively divides the input frequency as the sequence progresses.

If the input signal has a frequency $f$, the output frequency of transistor $n$ can be represented as:

> $f_n = \frac{f}{2^n}$

# Uses

Sequencers can be used to count incoming pulses, create delays, divide signal frequencies and produce repeating patterns. They may also be combined with other logic components to create more complex control systems. 