local t = texture.new(
	Vector2.new(4, 4),
	{ 0, 0x20, 0x20, 0, 0xf, 0x20, 0x20, 0xf, 0x20, 0x20, 0x20, 0x20, 0x20, 0xf, 0xf, 0x20 }
)
local s = sprite.new(t, Vector2.new(4, 4), Vector2.new(20, 20))

while wait(1) do
	s.position = vector2.new(math.random() * 100, math.random() * 82)
end
