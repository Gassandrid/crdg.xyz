---
tags: [tutorials/computer]
---

The one way sequencer is one of the most useful computer parts you can make to control things.

It allows you to activate things *one at a time*(which is incredibly useful given the limitations of the wiring system), and paves the way for a lot more transistor and computer memory contraptions.

## Blueprint

In this diagram, the **write input** allows you to change the sequencer from only having 1/4 pulse at a time ( this is the 1 at a time behavior most useful ) to a different pattern like 2/4 ($on\to off\to on \to off$ ). This is not *that* useful, so **don't think about it too much**.

The **clock input** is what updates the machine state. Every time you activate the clock input, the *activated transistor* moves down to the next one in order.

Depending on what you want from it, gluing to the **blue piece** of any transistor will **pulse twice** ( one for on, one for off ). Gluing to the **grey piece** will only **pulse once**, when it is turned off.

![[Screenshot 2025-07-22 at 2.28.22 PM.png]]
