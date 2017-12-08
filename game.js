'use strict'

var createApp = function(canvas) {
	var c = canvas.getContext("2d");

	const grasslandWidth = 60
	const lineWidth = 4

	const left_border = grasslandWidth + lineWidth
	const middle_border = canvas.width/2
	const right_border = canvas.width - grasslandWidth - lineWidth

	const car_left = 80
	const car_right = 235
	const car_y = canvas.height - 200

	const stone_width = 80
	const stone_height = 80
	const stone_left = 100
	const stone_right = 265
	const coin_width = 50
	const coin_height = 50

	var tree_left = 10
	var tree_right = canvas.width - 100
	var tree_width = 90
	var tree_height = 90

	var mile = 0
	var coin = 0
	var totalCoins = localStorage.getItem("totalCoins")
	if (totalCoins === null)
		totalCoins = 0
	var maxScore = localStorage.getItem("maxScore")
	if (maxScore === null)
		maxScore = 0
	var easyMode = 50

	var easyMode = {
		speed: 10,
		count: 30
	}

	var middleMode = {
		speed: 20,
		count: 15
	}

	var hardMode = {
		speed: 30,
		count: 10
	}

	var defaultSpeed = easyMode.speed
	var defaultCount = easyMode.count
	var count = defaultCount
	var over = false

	var stones = []

	var trees = []

	var coins = []


	var updateInterval = null

	var car = {
		x : car_left,
		y : car_y,
		width: 130,
		height: 190
	}

	//draw components in the canvas
	var build = function() {
		clear()
		drawRoad()
		drawStones()
		drawCoins()
		drawgrassland()
		drawCar()
		drawTrees()
		updateScore()
		if (over)
			gameover()
	}

	//Reset the game when first time loading the game or when user resets the game
	var reset = function() {
		mile = 0
		coin = 0
		over = false
		stones = []
		coins = []
		trees = []
		car.x = car_left
		count = defaultCount
		trees.push({x: tree_left, y: 100})
		trees.push({x:tree_right, y: 100})
		trees.push({x: tree_left, y: 400})
		trees.push({x:tree_right, y: 400})
		build()
		clearInterval(updateInterval)
		$("#startBtn").prop("disabled", false)
	}

	var start = function() {
		var level = $('input:radio:checked').val()
		if (level === "easy" ) {
			defaultSpeed = easyMode.speed
			defaultCount = easyMode.count
		} else if(level === "middle") {
			defaultSpeed = middleMode.speed
			defaultCount = middleMode.count
		} else {
			defaultSpeed = hardMode.speed
			defaultCount = hardMode.count
		}
		reset()
		$("#startBtn").prop("disabled", true)
		canvas.addEventListener("click", clickListener)
		$("#bgm").trigger('play')
		updateInterval = setInterval(update, 50)
	}

	//Draw each tree and update its location
	var drawTrees = function() {
		var image = document.getElementById("tree1")
		trees.forEach(function(item){
			c.drawImage(image, item.x, item.y, tree_width, tree_height)
			item.y = (item.y + defaultSpeed) % canvas.height
		})
	}

	var drawCar = function() {
		var image = document.getElementById("car")
		c.drawImage(image, car.x, car.y, car.width, car.height)
	}

	//Draw grassland; Draw the middle line using two different dashlines to creating an illusion of driving
	var drawgrassland = function() {
		c.fillStyle = "#00ff00"
		c.fillRect(0, 0, grasslandWidth, canvas.height)
		c.fillRect(canvas.width - grasslandWidth, 0, canvas.width, canvas.height)

		//Draw left road line using sloid white
		c.setLineDash([])
		c.lineWidth = 4
		c.strokeStyle = '#ffffff'
		c.beginPath()
		c.moveTo(grasslandWidth, 0)
		c.lineTo(grasslandWidth, canvas.height)
		c.stroke()
		c.beginPath()
		c.moveTo(canvas.width - grasslandWidth, 0)
		c.lineTo(canvas.width - grasslandWidth, canvas.height)
		c.stroke()

		//draw middle road line using dashline
		if (count % 2 == 0)
			c.setLineDash([15, 6])
		else
			c.setLineDash([15, 13])
		c.lineWidth = 4
		c.strokeStyle = '#ffffff'
		c.beginPath()
		c.moveTo(canvas.width/2, 0)
		c.lineTo(canvas.width/2, canvas.height)
		c.stroke()
	}

	var drawRoad = function() {
		c.fillStyle = '#6b6b47';
		c.fillRect(0, 0, canvas.width, canvas.height);
	}

	var drawStones = function() {
		var image = document.getElementById("rock")
		stones.forEach(function(item){
			c.drawImage(image, item.x, item.y, stone_width, stone_height)
		})
	}

	var drawCoins = function() {
		var coin = document.getElementById("coin")
		coins.forEach(function(item){
			c.drawImage(coin, item.x, item.y, 50, 50)
		})
	}

	var updateScore = function() {
		$('#yourMile').text(mile)
		$('#maxScore').text(maxScore)
		$('#coins').text(coin)
		$("#totalCoins").text(totalCoins)
	}

	//Update randomly generate new stones and remove stones that are out of the canvas
	//And update each stone's location; Check if the car collides with the stone
	var update = function() {
		if (count === 0) {
			count = defaultCount
			var r = Math.floor(Math.random()*100)
			if (r > 65) {
				stones.push({x: stone_right, y: 0})
				coins.push({x: stone_right + 15, y: 100})
			}
			else if (r > 30) {
				stones.push({x: stone_left, y: 0})
				coins.push({x: stone_left + 15, y: 100})
			}
		}
		count--
		stones.forEach(function(item, index){
			if (item.y > canvas.height) {
				stones.splice(index, 1)
			}
			else {
				item.y += defaultSpeed
				if (car.x === car_left) {
					if (item.x === stone_left && !over && item.y < car.y + car.width &&
					 stone_height + item.y > car.y) {
						over = true
					}

				} else if (item.x === stone_right && !over && item.y < car.y + car.width &&
					stone_height + item.y > car.y) {
						over = true
					}
			}
		})

		coins.forEach(function(item, index){
			if (item.y > canvas.height) {
				coins.splice(index, 1)
			} else {
				item.y += defaultSpeed
				if (car.x === car_left) {
					if (item.x === stone_left + 15 && !over && item.y < car.y + car.height &&
					 50 + item.y > car.y) {
						coin++
						totalCoins++
						coins.splice(index, 1)
					}

				} else if (item.x === stone_right + 15 && !over && item.y < car.y + car.height &&
					50 + item.y > car.y) {
						coin++
						totalCoins++
						coins.splice(index, 1)
					}
			}
		})
		mile += Math.ceil(defaultSpeed/defaultCount)
		if (mile + coin * 100 > maxScore)
			maxScore = mile + coin * 100
		build()
	}

	//Get the mouseclick location and move the car's position accordingly
	var clickListener = function(event) {
		var x = event.x;
  		var y = event.y;
  		x -= canvas.offsetLeft;
		if (x > left_border && x < middle_border) {
			car.x = car_left
		} else if (x > middle_border && x < right_border){
			car.x = car_right
		}
	}

	var gameover = function() {
		clearInterval(updateInterval)
		$("#scoreModal").show()
		$("#bgm").trigger('pause')
		$("#bgm").prop("currentTime",0)
		$("#mileSpan").text(mile)
		$("#coinSpan").text(coin)
		$("#scoreSpan").text(mile + coin * 100)
	}

	var clear = function() {
		c.clearRect(0, 0, canvas.width, canvas.height)
	}

	$("#confirmBtn").click(function(){
		$("#scoreModal").hide()
		reset()
		localStorage.setItem("maxScore", maxScore)
		localStorage.setItem("totalCoins", totalCoins)
	})

	$("#startBtn").click(function(){
		start()
	})

	$("#showTipsBtn").click(function(){
		$("#tipsModal").show()
	})

	$("#tipsBtn").click(function(){
		$("#tipsModal").hide()
	})

	return {
		reset: reset
	}
}

window.onload = function() {
	var app = createApp(document.querySelector("canvas"))
	app.reset()
}