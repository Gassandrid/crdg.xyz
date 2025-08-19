---
tags: [tutorials/bees]
---

This page will serve as a step-by-step guide to the **Beekeeping** feature of the game, with included pictures and blueprint for visual help.

___

## Bee Nests

Bee Nests are the first step into creating a **Beehive**. They can appear in specific spots every 20 minutes and won't respawn once spawned. To find them, a map of all of the possible beehive locations will be linked. However, the first **bee nest** spawned will **ALWAYS** be placed on a specific spot in [[content/Places/Cathedral|Cathedral]]. 

To shoot them down, it is common practice to use a [[Flintlock]]. Once a bee nest reaches a maximum force, it will open into multiple **Honeycombs**, of which the amount is decided by luck. 

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

- Fly towards a randomly chosen [[Planter]] (that has a Seed planted inside)
- Once they reach the plant, stay inside of it for a few seconds.
- Goes to any adjacent plant near it then stays inside it for a few seconds.
- Once the few seconds have elapsed, the bees will go back inside the hive, selects a random cell and fills it with honey, and the cycle repeats.
However, there are some specific rules to this.
	- The amount of bees able to go on a specific tree depends on the size. For example, a small banana tree would only get one bee but a bigger banana tree would be able to get multiple bees on it due to the amount of leaves in the tree.
		-  This means that bottlenecking is possible between [Planters](Planter) and **Honeycombs**.

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

## Troubleshooting

A lot of issues may happen while trying to create a successful **Beehive**. This section is dedicated to ironing out the errors and to get your **Beehive** going.

> [!Question] 
> My bees aren't going to nearby planters.

One of these conditions aren't met:

- The light level should be low enough
- The honeycombs in your beehive should be spaced out enough
- There should be enough space for the bees to come out

> [!Question] 
> My honeycombs aren't dripping out honey.

One of two things went wrong:

- Your honeycomb doesn't have enough honey in it (it needs to be a FULL cell of honey in order to drip)
- You angled the honeycomb wrong (see image)
