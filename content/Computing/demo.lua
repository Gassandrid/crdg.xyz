render.text = false
local t = texture.new(Vector2.new(8, 1), { 0x20, 0x30, 0x40, 0x50, 0x60, 0x70, 0x80, 0x90 })
local s = sprite.new(t, Vector2.new(8, 82), Vector2.new(0, 0))
s.scale = Vector2.new(13, 1)

i = 0
while true do
	i += 1
	local start = 0x20 + i * 16
	local pixeldata = {}
	pixeldata[1] = start % 0xf0
	pixeldata[2] = (start + 0x10) % 0xf0
	pixeldata[3] = (start + 0x20) % 0xf0
	pixeldata[4] = (start + 0x30) % 0xf0
	pixeldata[5] = (start + 0x40) % 0xf0
	pixeldata[6] = (start + 0x50) % 0xf0
	pixeldata[7] = (start + 0x60) % 0xf0
	pixeldata[8] = (start + 0x70) % 0xf0
	t:SetPixels(pixeldata)
end
