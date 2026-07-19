render.text = false
local w = 0xf
local e = 0x20
local m = 0x24
local eye_texture = texture.new(Vector2.new(8, 5), {
	0,
	0,
	1,
	1,
	1,
	1,
	0,
	0,
	0,
	1,
	w,
	w,
	w,
	w,
	1,
	0,
	1,
	w,
	w,
	e,
	e,
	w,
	w,
	1,
	0,
	1,
	w,
	w,
	w,
	w,
	1,
	0,
	0,
	0,
	1,
	1,
	1,
	1,
	0,
	0,
})
local eye = sprite.new(eye_texture, Vector2.new(8, 5), Vector2.new(15, 20))
local eye2 = sprite.new(eye_texture, Vector2.new(8, 5), Vector2.new(100 - 16 - 15, 20))
eye.scale = vector2.new(2, 2)
eye2.scale = vector2.new(2, 2)

local mouth_texture = texture.new(Vector2.new(8, 10), {
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	0,
	1,
	w,
	w,
	w,
	w,
	1,
	0,
	0,
	1,
	m,
	m,
	m,
	m,
	1,
	0,
	0,
	0,
	1,
	w,
	w,
	1,
	1,
	0,
	0,
	0,
	1,
	1,
	1,
	1,
	0,
	0,

	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	0,
	1,
	w,
	w,
	w,
	w,
	1,
	0,
	0,
	0,
	1,
	w,
	w,
	1,
	1,
	0,
	0,
	0,
	1,
	1,
	1,
	1,
	0,
	0,
})
local mouth = sprite.new(mouth_texture, Vector2.new(8, 5), Vector2.new(14, 82 - 20 - 20))
mouth.scale = vector2.new(9, 4)

sound.SetSample(108572089171330)
sound.Play(5, 440, 1)

local lasthz = 440

mouth.imagerectsize = vector2.new(8, 5)

while wait(0.2) do
	mouth.offset = vector2.new(0, 5)
	wait(0.2)
	mouth.offset = vector2.new(0, 0)
	lasthz = lasthz + (math.random(55, 880) - lasthz) * 0.0625
	sound.Mod(5, lasthz)
end
