---
tags: [tutorials/bees]
---
This page will serve as a step-by-step guide to the **Beekeeping** feature of the game, with included pictures and blueprint for visual help.

___

## Bee Nests

Bee Nests are the first step into creating a **Beehive**. They can appear in specific spots every 20 minutes. To find them, a map of all of the possible beehive locations will be linked.

To shoot them down, it is common practice to use a [[Flintlock]]. Once a bee nest reaches a maximum force, it will open into multiple **Honeycombs**, of which the amount is decided by luck. However, they usually open into one or two, albeit there is a rare chance they drop 10+ honeycombs. 

> ![[Pasted image 20250815114728.png|300]]
> 
> A **beehive** on one of the [[content/Places/Cathedral|Cathedral]] poles.

> ![[BeehiveLocations.png]]
> 
> A full map of all possible **beehive** locations. Red circles indicate the placement of the **beehive**.

> [!tip] 
> If a bee nest location is complicated (i.e the one in Gas Station and the one in Spawn), you're able to build a net around the nest to get all the **Honeycombs** dropped. The [[bee repellent]] gamepass is also quite useful, as it makes gathering **Honeycombs** much easier without dying.

---

## Beehives

**Beehives** are artificially created bee nests created from **Honeycombs**. They are usually made as cardboard boxes with the honeycombs placed inside, creating a DIY beehive. 

### Behavior

Whenever a **Beehive** is created, all the bees inside will do the following:

- Creates 6 raycasts in a hexagonal pattern with no limits.
- Out of those 6 raycasts, gets all of the planted [[Planter|Planters]] inside of them.
- Sends out bees inside depending on the amount of planters in said raycasts.
- Once the bees reach the [[Planter]], they go to any adjacent plant near it then stay inside it for a few seconds.
- Once the few seconds have elapsed, the bees will go back inside the hive, selects a specific cell and fills it with honey, and the cycle repeats.

> [!Warning]
> Bees have no limits in terms of pathfinding a [[Planter]]. This means that they are able to locate [[Planter#Sky Islands|Sky Islands]] from far away and are able to be used for griefing purposes.

### Blueprints

> ![[Pasted image 20250815215646.png]]

---

## Honey

**Honey** is a liquid able to be produced by a beehive. There are a lot of ways to collect it, but the most efficient strategy is to simply let gravity do the job; If a **maximum-capacity** honey cell is facing downwards, it will slowly flow down and drop liquid on the ground. Then, you're able to simply place a glass under the honeycomb to be able to drink honey.

> ![[Pasted image 20250816100727.png]]
> 
> A simple honey collection system.

---
## Centrifuges

Centrifuges are advanced versions of beehives able to produce and extract honey at the same time. They also use a niche mechanic of honeycombs; centrifugal force. If a **honeycomb** is spun at a high speed, it is able to spill honey much quicker regardless of the orientation. Even tho they are powerful, they are however pretty difficult to make for a first-time beehive, and is recommended to use a simpler build.

> ![[Pasted image 20250821230112.png]]
>
> A complex **centrifuge** design. Do note that this only showcases the centrifugal force mechanic, as this design isn’t able to create honey by itself. You’ll need to cover the centrifuge, add a collection system, set up the nuclear motor, etcetera.

> ![[centrifuge.gif]]
>
> An example of a working **centrifuge**. This design was created by That_Dude (firgurativenumbers on Discord).
---

## Troubleshooting

A lot of issues may happen while trying to create a successful **Beehive**. This section is dedicated to ironing out the errors and to get your **Beehive** going.

> [!Question] 
> My bees aren't going to nearby planters.

One of these conditions aren't met:

- The light level should be low enough
- The honeycombs in your beehive should be spaced out enough
- There should be enough space for the bees to come out
- Make sure to interact (grab, rotate) with the beehive, as human interaction is necessary for bees to function.

> [!Question] 
> My honeycombs aren't dripping out honey.

One of two things went wrong:

- Your honeycomb doesn't have enough honey in it (it needs to be a NEAR FULL cell of honey in order to drip)
- You angled the honeycomb wrong (see image)

