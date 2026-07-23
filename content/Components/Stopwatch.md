---
class: component
acquisition: Component machine
image: "[[wiki-1784838197945-acedbfeb-stopwatch.png]]"
tags:
  - components/component-machine
---

> [!infobox|n-th]
> 
> ## Stopwatch
> 
> > [!caption|center wfull txt-s]
> > 
> > ![[wiki-1784838197945-acedbfeb-stopwatch.png|center]]
> > 
> > 
> 
> ### Component Info
> 
> | Type | Miscellaneous |
> | --- | --- |
> | **Usage** | Keep track of time or send signals at specific times. |
> | **Date Added** | DATE |

The **Stopwatch** is a **Component** obtainable through the [[items/regular-items/component-machine|Component Machine]]. It resembles a black rectangular device with a digital display in the front and an outlet in the back. The digital display is a counter in **HH:MM:SS** format.

## Function

The Stopwatch has multiple functions depending on how many times it has received a signal.

For example, after receiving one signal the Stopwatch will begin counting upward. If another signal is sent to the Stopwatch, the timer will pause, rounding to the nearest second. Lastly, sending a third signal will make the Stopwatch begin counting downward from where it was paused.

In this state, when the timer reaches "00:00:00" an electronic beep will play and the Stopwatch will send out a signal from the back outlet. After this, sending a signal to the Stopwatch will cause it to start counting upward again.

> [!Note] Note
> Sending a signal to the Stopwatch while it is counting down will simply pause the timer. Then, sending another signal will make it start counting upward again.