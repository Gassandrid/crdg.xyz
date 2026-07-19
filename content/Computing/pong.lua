render.text = false
render.graphicsbg = 0x00
local SCREEN_W = 100
local SCREEN_H = 82
local WINNING_SCORE = 9
local COUNTDOWN_TIME = 3
local PADDLE_W = 4
local PADDLE_H = 16
local BALL_SIZE = 4
local WHITE_COLOR = 0xFF
local PADDLE_SPEED = 2
local BALL_SPEED = 1
local PADDLE_MARGIN = 5
local vector2_new = vector2.new
local FONT_WIDTH = 3
local FONT_HEIGHT = 5
local FONT_SPACING = 1
local char_map = {
	["0"] = { 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1 },
	["1"] = { 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1 },
	["2"] = { 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1 },
	["3"] = { 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1 },
	["4"] = { 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1 },
	["5"] = { 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1 },
	["6"] = { 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1 },
	["7"] = { 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0 },
	["8"] = { 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1 },
	["9"] = { 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1 },
	["P"] = { 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0 },
	["O"] = { 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1 },
	["N"] = { 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1 },
	["G"] = { 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1 },
	["R"] = { 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1 },
	["E"] = { 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1 },
	["S"] = { 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1 },
	["T"] = { 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0 },
	["A"] = { 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1 },
	["I"] = { 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1 },
	["W"] = { 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0 },
	["L"] = { 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1 },
	["C"] = { 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1 },
	["M"] = { 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1 },
	["X"] = { 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1 },
	["U"] = { 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1 },
	["D"] = { 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0 },
	["B"] = { 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0 },
	["Y"] = { 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0 },
	["Z"] = { 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1 },
	["!"] = { 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0 },
	["("] = { 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0 },
	[")"] = { 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0 },
	["/"] = { 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0 },
	[" "] = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
}
local texture_cache = {}
local function create_char_texture(char)
	if texture_cache[char] then
		return texture_cache[char]
	end
	local pixels = {}
	local pattern = char_map[char] or char_map[" "]
	local n = #pattern
	local i = 1
	if n > 0 then
		repeat
			table.insert(pixels, pattern[i] == 1 and WHITE_COLOR or 0x00)
			i = i + 1
		until i > n
	end
	local tex = texture.new(vector2_new(FONT_WIDTH, FONT_HEIGHT), pixels)
	texture_cache[char] = tex
	return tex
end
local function updateText(self, new_text)
	local num_existing = #self.chars
	local j = 1
	if num_existing > 0 then
		repeat
			self.chars[j]:Destroy()
			j = j + 1
		until j > num_existing
	end
	self.chars = {}
	self.text = string.upper(tostring(new_text))
	local total_width = 0
	local text_length = #self.text
	if text_length > 0 then
		local i = 1
		repeat
			total_width = total_width + FONT_WIDTH + FONT_SPACING
			i = i + 1
		until i > text_length
		self.width = total_width - FONT_SPACING
	else
		self.width = 0
	end
	local start_x = self.x
	if self.align == 1 then
		start_x = self.x - self.width / 2
	end
	local current_x = start_x
	local i = 1
	if text_length > 0 then
		repeat
			local char = string.sub(self.text, i, i)
			local tex = create_char_texture(char)
			local char_sprite = sprite.new(tex, vector2_new(FONT_WIDTH, FONT_HEIGHT), vector2_new(current_x, self.y))
			char_sprite.zindex = 20
			char_sprite.visible = self.visible
			table.insert(self.chars, char_sprite)
			current_x = current_x + FONT_WIDTH + FONT_SPACING
			i = i + 1
		until i > text_length
	end
end
local function setVisible(self, is_visible)
	self.visible = is_visible
	local num_chars = #self.chars
	local i = 1
	if num_chars > 0 then
		repeat
			if self.chars[i] then
				self.chars[i].visible = is_visible
			end
			i = i + 1
		until i > num_chars
	end
end
local function createTextSprite(text_str, x, y, align)
	local text_sprite = {
		chars = {},
		text = "",
		x = x,
		y = y,
		align = align or 0,
		width = 0,
		visible = true,
	}
	text_sprite.updateText = updateText
	text_sprite.setVisible = setVisible
	text_sprite.updateText(text_sprite, text_str)
	return text_sprite
end
local function create_solid_texture(color, w, h)
	local pixels = {}
	local i = 1
	repeat
		table.insert(pixels, color)
		i = i + 1
	until i > w * h
	return texture.new(vector2_new(w, h), pixels)
end
local TEX_PADDLE = create_solid_texture(WHITE_COLOR, PADDLE_W, PADDLE_H)
local TEX_BALL = create_solid_texture(WHITE_COLOR, BALL_SIZE, BALL_SIZE)
local playerPaddleSprite =
	sprite.new(TEX_PADDLE, vector2_new(PADDLE_W, PADDLE_H), vector2_new(PADDLE_MARGIN, SCREEN_H / 2 - PADDLE_H / 2))
playerPaddleSprite.scale = vector2_new(1, 1)
playerPaddleSprite.scaletype = 0
playerPaddleSprite.zindex = 10
local aiPaddleSprite = sprite.new(
	TEX_PADDLE,
	vector2_new(PADDLE_W, PADDLE_H),
	vector2_new(SCREEN_W - PADDLE_MARGIN - PADDLE_W, SCREEN_H / 2 - PADDLE_H / 2)
)
aiPaddleSprite.scale = vector2_new(1, 1)
aiPaddleSprite.scaletype = 0
aiPaddleSprite.zindex = 10
local ballSprite = sprite.new(
	TEX_BALL,
	vector2_new(BALL_SIZE, BALL_SIZE),
	vector2_new(SCREEN_W / 2 - BALL_SIZE / 2, SCREEN_H / 2 - BALL_SIZE / 2)
)
ballSprite.scale = vector2_new(1, 1)
ballSprite.scaletype = 0
ballSprite.zindex = 10
local playerScoreSprite = createTextSprite(tostring(0), SCREEN_W / 4, 10, 1)
local aiScoreSprite = createTextSprite(tostring(0), SCREEN_W * 3 / 4, 10, 1)
local messageSprite = createTextSprite("", SCREEN_W / 2, 55, 1)
local playerScore = 0
local aiScore = 0
local isPlaying = false
local isTwoPlayer = false
local playerMoveDir = 0
local p2MoveDir = 0
local isCountingDown = false
local countdownTimer = 0
local nextServeDirection = 0
local isShowingSecretMessage = false
local secretMessageTimer = 0
local KONAMI_CODE = {
	"UP",
	"UP",
	"DOWN",
	"DOWN",
	"LEFT",
	"RIGHT",
	"LEFT",
	"RIGHT",
	"B",
	"A",
	"START",
}
local konamiIndex = 1
local lastJoyX = 0
local lastJoyY = 0
local ball = {
	x = 0,
	y = 0,
	vx = 0,
	vy = 0,
	w = BALL_SIZE,
	h = BALL_SIZE,
	sprite = ballSprite,
}
local player = {
	x = PADDLE_MARGIN + PADDLE_W / 2,
	y = SCREEN_H / 2,
	w = PADDLE_W,
	h = PADDLE_H,
	sprite = playerPaddleSprite,
}
local ai = {
	x = SCREEN_W - PADDLE_MARGIN - PADDLE_W / 2,
	y = SCREEN_H / 2,
	w = PADDLE_W,
	h = PADDLE_H,
	sprite = aiPaddleSprite,
}
startRound = function(serveDirection)
	ball.x = SCREEN_W / 2
	ball.y = SCREEN_H / 2
	ball.vx = 0
	ball.vy = 0
	ballSprite.visible = true
	nextServeDirection = serveDirection
	isCountingDown = true
	countdownTimer = COUNTDOWN_TIME
	messageSprite.setVisible(messageSprite, true)
	messageSprite.updateText(messageSprite, math.ceil(countdownTimer))
end
updateScoreDisplay = function()
	playerScoreSprite.updateText(playerScoreSprite, tostring(playerScore))
	aiScoreSprite.updateText(aiScoreSprite, tostring(aiScore))
end
checkWinCondition = function()
	if playerScore >= WINNING_SCORE or aiScore >= WINNING_SCORE then
		isPlaying = false
		ballSprite.visible = false
		local winnerType = isTwoPlayer and "PLAYER 1" or "PLAYER"
		local loserType = isTwoPlayer and "PLAYER 2" or "AI"
		local winner = (playerScore >= WINNING_SCORE) and winnerType or loserType
		messageSprite.updateText(messageSprite, winner .. " WINS! (A/B)")
		messageSprite.setVisible(messageSprite, true)
	end
end
initializeGame = function()
	ball.x = SCREEN_W / 2
	ball.y = SCREEN_H / 2
	ball.vx = 0
	ball.vy = 0
	playerScore = 0
	aiScore = 0
	isPlaying = true
	player.y = SCREEN_H / 2
	ai.y = SCREEN_H / 2
	playerMoveDir = 0
	p2MoveDir = 0
	messageSprite.updateText(messageSprite, "")
	messageSprite.setVisible(messageSprite, false)
	playerScoreSprite.setVisible(playerScoreSprite, true)
	aiScoreSprite.setVisible(aiScoreSprite, true)
	updateScoreDisplay()
	local serveDir = math.random() < 0.5 and -1 or 1
	startRound(serveDir)
end
updatePaddles = function()
	local newY = player.y + playerMoveDir * PADDLE_SPEED
	if newY - PADDLE_H / 2 < 0 then
		player.y = PADDLE_H / 2
	elseif newY + PADDLE_H / 2 > SCREEN_H then
		player.y = SCREEN_H - PADDLE_H / 2
	else
		player.y = newY
	end
	local targetY = ai.y
	if isTwoPlayer then
		targetY = ai.y + p2MoveDir * PADDLE_SPEED
	else
		local aiCenterY = ai.y
		local ballCenterY = ball.y
		local aiOffset = 4
		local AISPEED = 1
		if ball.vx > 0 then
			if ballCenterY > aiCenterY + aiOffset then
				targetY = aiCenterY + math.min(AISPEED * 0.8, ballCenterY - aiCenterY)
			elseif ballCenterY < aiCenterY - aiOffset then
				targetY = aiCenterY - math.min(AISPEED * 0.8, aiCenterY - ballCenterY)
			end
		end
	end
	ai.y = targetY
	if ai.y - PADDLE_H / 2 < 0 then
		ai.y = PADDLE_H / 2
	elseif ai.y + PADDLE_H / 2 > SCREEN_H then
		ai.y = SCREEN_H - PADDLE_H / 2
	end
end
updateBall = function()
	ball.x = ball.x + ball.vx
	ball.y = ball.y + ball.vy
	if ball.y - BALL_SIZE / 2 < 0 or ball.y + BALL_SIZE / 2 > SCREEN_H then
		ball.vy = -ball.vy
		if ball.y - BALL_SIZE / 2 < 0 then
			ball.y = BALL_SIZE / 2
		end
		if ball.y + BALL_SIZE / 2 > SCREEN_H then
			ball.y = SCREEN_H - BALL_SIZE / 2
		end
	end
	local ballLeft = ball.x - BALL_SIZE / 2
	if ball.vx < 0 and ballLeft <= player.x + player.w / 2 then
		local paddleTop = player.y - player.h / 2
		local paddleBottom = player.y + player.h / 2
		local ballCenterY = ball.y
		if ballCenterY >= paddleTop and ballCenterY <= paddleBottom then
			ball.vx = -ball.vx
			local relativeIntersect = (player.y - ballCenterY) / (player.h / 2)
			ball.vy = -relativeIntersect * BALL_SPEED
			ball.vx = ball.vx * 1.05
			ball.vy = ball.vy * 1.05
			ball.x = player.x + player.w / 2 + BALL_SIZE / 2 + 0.1
		end
	end
	local ballRight = ball.x + BALL_SIZE / 2
	if ball.vx > 0 and ballRight >= ai.x - ai.w / 2 then
		local paddleTop = ai.y - ai.h / 2
		local paddleBottom = ai.y + ai.h / 2
		local ballCenterY = ball.y
		if ballCenterY >= paddleTop and ballCenterY <= paddleBottom then
			ball.vx = -ball.vx
			local relativeIntersect = (ai.y - ballCenterY) / (ai.h / 2)
			ball.vy = -relativeIntersect * BALL_SPEED
			ball.vx = ball.vx * 1.05
			ball.vy = ball.vy * 1.05
			ball.x = ai.x - ai.w / 2 - BALL_SIZE / 2 - 0.1
		end
	end
	if ball.x < 0 then
		aiScore = aiScore + 1
		updateScoreDisplay()
		checkWinCondition()
		if isPlaying then
			startRound(1)
		end
	elseif ball.x > SCREEN_W then
		playerScore = playerScore + 1
		updateScoreDisplay()
		checkWinCondition()
		if isPlaying then
			startRound(-1)
		end
	end
end
updateSprites = function()
	if player and playerPaddleSprite then
		playerPaddleSprite.position = vector2_new(player.x - player.w / 2, player.y - player.h / 2)
	end
	if ai and aiPaddleSprite then
		aiPaddleSprite.position = vector2_new(ai.x - ai.w / 2, ai.y - ai.h / 2)
	end
	if ball and ballSprite then
		ballSprite.position = vector2_new(ball.x - ball.w / 2, ball.y - ball.h / 2)
	end
end
setupControlHandler = function()
	control:Connect(1, function(inputType, data)
		local isInitialMessage = messageSprite.text == "PONG - 1P (A) 2P (B)"
		local isGameOver = playerScore >= WINNING_SCORE or aiScore >= WINNING_SCORE
		if not isPlaying and (isGameOver or isInitialMessage) then
			if inputType == "ButtonA" and data == true then
				isTwoPlayer = false
				initializeGame()
			elseif inputType == "ButtonB" and data == true then
				isTwoPlayer = true
				initializeGame()
			end
		end
		if not isShowingSecretMessage and isPlaying then
			local currentExpected = KONAMI_CODE[konamiIndex]
			local matched = false
			local inputReceived = false
			if inputType == "Joystick" then
				local x = data.x
				local y = data.y
				local isUpPress = y < -0.5 and lastJoyY >= -0.5
				local isDownPress = y > 0.5 and lastJoyY <= 0.5
				local isLeftPress = x < -0.5 and lastJoyX >= -0.5
				-- FIX APPLIED HERE: Changed lastJoyX <= -0.5 to lastJoyX <= 0.5
				local isRightPress = x > 0.5 and lastJoyX <= 0.5
				if isUpPress or isDownPress or isLeftPress or isRightPress then
					inputReceived = true
				end
				if isUpPress and currentExpected == "UP" then
					matched = true
				end
				if isDownPress and currentExpected == "DOWN" then
					matched = true
				end
				if isLeftPress and currentExpected == "LEFT" then
					matched = true
				end
				if isRightPress and currentExpected == "RIGHT" then
					matched = true
				end
			elseif data == true then
				inputReceived = true
				if inputType == "ButtonB" and currentExpected == "B" then
					matched = true
				end
				if inputType == "ButtonA" and currentExpected == "A" then
					matched = true
				end
				if inputType == "ButtonStart" and currentExpected == "START" then
					matched = true
				end
			end
			if matched then
				konamiIndex = konamiIndex + 1
				if konamiIndex > #KONAMI_CODE then
					isShowingSecretMessage = true
					secretMessageTimer = 3.0
					messageSprite.updateText(messageSprite, "MADE BY CATGOSCRAZY")
					messageSprite.setVisible(messageSprite, true)
					konamiIndex = 1
				end
			elseif inputReceived and konamiIndex > 1 then
				konamiIndex = 1
			end
		end
		if isPlaying and not isCountingDown and not isShowingSecretMessage and inputType == "Joystick" then
			if data.y < 0 then
				playerMoveDir = -1
			elseif data.y > 0 then
				playerMoveDir = 1
			elseif math.abs(data.y) < 0.1 then
				playerMoveDir = 0
			end
		end
		if inputType == "Joystick" then
			lastJoyX = data.x
			lastJoyY = data.y
		end
	end)
	control:Connect(2, function(inputType, data)
		if
			isPlaying
			and isTwoPlayer
			and not isCountingDown
			and not isShowingSecretMessage
			and inputType == "Joystick"
		then
			if data.y < 0 then
				p2MoveDir = -1
			elseif data.y > 0 then
				p2MoveDir = 1
			elseif math.abs(data.y) < 0.1 then
				p2MoveDir = 0
			end
		end
	end)
end
setupControlHandler()
messageSprite.updateText(messageSprite, "PONG - 1P (A) 2P (B)")
ballSprite.visible = false
messageSprite.setVisible(messageSprite, true)
playerPaddleSprite.visible = true
aiPaddleSprite.visible = true
playerScoreSprite.setVisible(playerScoreSprite, false)
aiScoreSprite.setVisible(aiScoreSprite, false)
local DT = 0.016
repeat
	if isShowingSecretMessage then
		secretMessageTimer = secretMessageTimer - DT
		if secretMessageTimer <= 0 then
			isShowingSecretMessage = false
			if isPlaying and isCountingDown then
				messageSprite.updateText(messageSprite, math.ceil(countdownTimer))
			elseif isPlaying and not isCountingDown then
				messageSprite.updateText(messageSprite, "")
				messageSprite.setVisible(messageSprite, false)
			elseif not isPlaying then
				messageSprite.updateText(messageSprite, "PONG - 1P (A) 2P (B)")
				messageSprite.setVisible(messageSprite, true)
			end
		end
	end
	if isPlaying and isCountingDown and not isShowingSecretMessage then
		countdownTimer = countdownTimer - DT
		local displayNum = math.ceil(countdownTimer)
		if displayNum > 0 and displayNum <= COUNTDOWN_TIME and messageSprite.text ~= tostring(displayNum) then
			messageSprite.updateText(messageSprite, tostring(displayNum))
		elseif countdownTimer <= 0 then
			isCountingDown = false
			messageSprite.updateText(messageSprite, "")
			messageSprite.setVisible(messageSprite, false)
			local serveDirection = nextServeDirection
			local angle = math.random() * 2 - 1
			ball.vx = serveDirection * BALL_SPEED
			ball.vy = angle * BALL_SPEED * 0.5
		end
	end
	if isPlaying and not isCountingDown and not isShowingSecretMessage then
		updatePaddles()
		updateBall()
	end
	updateSprites()
	wait(DT)
until false
