There are multiple autofisher designs that have been made since the release of [[fish/fishing | fishing]] update. So this page would explain how autofisher works so you can design your own autofisher.

---

## Method
The newest method in auto fishing is very simple, it's basically just splitting the tip of the rod from the wooden handle because to reel the rod actually depends on the wooden handle movement, this also gives a advantage which is your catch that wouldn't get flinged by the reeling mechanism.

Then you can basically just use whatever way you want to cast/reel it you can:
- swing it with servo/something that flings
- spin it with anything that spins constantly

For **swing**, casting the rod would require you to jam the servo then activate the servo so when the servo is released it swings so quickly that is fast the hook.

For **Spinning**, you'll need a some way to stops the rod from spinning right? there's some component that can help you do it:
- [[components/attachment|attachement]]
- tacker + instant release
- cart hood or any realistic cart parts

> [!Tip] Tip
> If you want to use nuclear motor to do spinning method i would recommend removing the cylinder part of nuclear motor like in this image:
> ![[wiki-1787804329504-9e67ec84-better_nuclear_motor.png]]
> why? because it makes it goes to its max speed instantly.

---

## Controller
There's two ways to control an autofisher, you can either use logic gates or [[Features/Computer/Commodiesel-75|commodiesel]].

For **logic gates** way people usually just use a [[contraptions/sequencer|sequencer]] that goes to the next step every time it receive signals from the rods.
> [!Tip] Tip
> If you want to count rods signal use sequencer not binary counter because if you use binary counter the rods signal could collide with each other causing miss counting.

---

> [!info] Info
> Because there can be more than one autofisher designs you should put your design under this page.