local speed = 16
local bass_speed = 8
local scale = { "g", "a", "b", "c", "d", "e", "f#" }

local function hh()
	sound.play(4, "C6")
	for i = 1, 5 do
		wait(0.02)
		sound.mod(4, nil, 2 - (i / 2.5))
	end

	sound.play(4)
end

local function kick()
	sound.play(4, "C2")
	for i = 1, 5 do
		wait(0.02)
		sound.mod(4, nil, 2 - (i / 2.5))
	end

	sound.play(4)
end

local function snare()
	sound.play(4, "A3")
	for i = 1, 5 do
		wait(0.02)
		sound.mod(4, nil, 2 - (i / 2.5))
	end

	sound.play(4)
end

local bassnote = 1
local chords = { 2, 3, 4, 5 }

spawn(function()
	while true do
		local chord = chords[math.random(1, #chords)]
		local octave = 3
		local n = bassnote + chord
		if n > #scale then
			n %= #scale
		end
		local note = scale[n] .. octave
		local note2 = scale[n] .. octave + 1
		sound.play(1, note, 1.5, 3)
		sound.play(2, note2, 1.5, 2)
		task.wait((2 ^ math.random(1, 2)) / speed)
	end
end)

spawn(function()
	while true do
		bassnote = math.random(1, #scale)
		local note = scale[bassnote] .. "3"
		print(note)
		sound.play(3, note, 1.5)
		task.wait((2 ^ math.random(1, 3)) / bass_speed)
	end
end)

spawn(function()
	while true do
		kick()
		task.wait((4 / speed) - 0.1)
		hh()
		task.wait((4 / speed) - 0.1)
		snare()
		task.wait((4 / speed) - 0.1)
		hh()
		task.wait((4 / speed) - 0.1)
	end
end)
