---
class: component
acquisition: Component machine
image: "[[inputreceiver 1.png]]"
tags:
  - components/component-machine
  - todo
---

<div style="display:flex;align-items:center;gap:10px;
    margin:10px 5px 5px 5px;
    padding:0; 
    overflow:visible;
    font-family:sans-serif;
    font-size:1.05rem;
    color:#FFFFFF;
    text-shadow:0 2px 6px rgba(0,0,0,1),0 3px 6px rgba(0,0,0,0.23);
    border-radius:0.5px;
    border:2px solid #777777;
    box-shadow:2px 2px #777777;
    background:none;">
    <div style="display:flex;align-items:center;gap:10px;
        height:80px;
        border-radius:0.5px;
        background:
            linear-gradient(to bottom,rgba(238,220,52,0.85),rgba(15,16,1,0.85)),
            repeating-linear-gradient(-45deg,#ced211,#ced211 20px,#010100 20px,#010100 40px);
        flex-grow:1;
        overflow:visible;">
        <div style="position:relative;width:120px;height:120px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
            <img src="https://tr.rbxcdn.com/180DAY-5efd399b8a1e6ce4892b0afeef910591/420/420/Tshirt/Webp/noFilter"
                 alt="Notice Icon"
                 style="width:120px;height:120px;object-fit:contain;
                 filter:drop-shadow(2px 4px 4px rgba(0,0,0,0.5));
                 transform:rotate(8deg);">
        </div>
        <div style="display:flex;flex-direction:column;justify-content:center;">
            <div style="font-size:2rem;color:#ffffff;">
                <span style="color:#ced211;">WORK</span>
                <span style="color:#010100;">IN</span>
                <span style="color:#ced211;">PROGRESS!</span>
            </div>
            <div style="font-size:1rem;color:#ffffff;font-style:italic;margin-top:4px;">
                This page is under construction, but you’re able to help us make it!
            </div>
        </div>
    </div>
</div>

> [!infobox|n-th]
> 
> ## Input Receiver
> 
> > [!caption|center wfull txt-s]
> > 
> > ![[inputreceiver 1.png|center]]
> > 
> > 
> 
> ### Component Info
> 
> | Type | Miscellaneous |
> | --- | --- |
> | **Usage** | Sends signals based on player input. |
> | **Date Added** | DATE |

The **Input Receiver** is a **Component** obtainable through the [[items/regular-items/component-machine|Component Machine]]. 

## Function

When the Input Receiver is connected to a seat and a player is sat down, the Input Receiver will send signals depending on what keys are pressed down. 

The Input Receiver has 5 outputs; 4 of these outputs correspond to the arrow keys (or **WASD** keys) and the last output is a randomized letter.

Each key has its own corresponding output outlet, which can be disabled clicking on the outlet. (For example, if you did not want the Input Receiver to send signals when pressing the up arrow, you would click that outlet to disable it.)

> [!Tip] Tip
> The **Input Receiver** works best in conjunction with [[components/cable|Cables]], as the individual outlets on the Input Receiver are extremely close together. 
