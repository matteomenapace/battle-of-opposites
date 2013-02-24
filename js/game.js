(function() 
{	
	var config =
	{
		stage:
		{
			width: 940,
			height: 448
		},

		player:
		{
			speed: 4,
			width: 64,
			height: 64
		},

		controls:
		{
			left: 	
			{
				W: -90, 
				S: 90, 
				D: 0, 
				A: 180
			},
			right: 	
			{
				UP_ARROW: -90, 
				DOWN_ARROW: 90, 
				RIGHT_ARROW: 0, 
				LEFT_ARROW: 180
			}
		},

		timer:
		{
			from: 10,
			to: 15
		}
	}

	// game object (of Game class)
	var game = null

	// the game's data object
	var battle = 
	{
		title: '', 
		players: [], // name, url, status (chased | chaser), control (left | right)
		statuses: ['chaser', 'chased'],
		controls: ['left', 'right'] 
	}

	// DOM elements references
	var step2Btn, 
		introScreen,
		step3Btn,
		optionsScreen,
		pairsGroup,
		hackPairBtn,
		playersAvatars,
		characterModal,
		characterNameInput,
		characterFileInput,
		characterRawImage,
		characterCropImage,
		characterBtn,
		gameScreen,
		gameMission,
		restartGameBtn,
		startAgainBtn

		

	// kick off when the web page is ready
	$(document).ready(function() 
	{
		// create jQuery object from DOM elements

		introScreen = $('#introScreen')
		step2Btn = $('#step2Btn')

		optionsScreen = $('#optionsScreen')
		pairsGroup = $('#pairsGroup')
		hackPairBtn = $('#hackPairBtn')
		playersAvatars = $('#playersAvatars')
		step3Btn = $('#step3Btn')

		characterModal = $('#characterModal')
		characterNameInput = $('#characterName')
		characterFileInput = $('#characterFile')
		characterRawImage = $('#characterRaw')
		characterCropImage = $('#characterCrop')
		characterBtn = $('#characterBtn')

		gameScreen = $('#gameScreen')
		gameMission = $('#gameScreen h1')
		startAgainBtn = $('#startAgainBtn')
		restartGameBtn = $('#restartGameBtn')

		// add event listeners

		step2Btn.on('click', step2)

		$('a.pairs-btn').on('click', pairChosen)
		step3Btn.on('click', function()
		{
			if (!$(this).hasClass('disabled')) step3()
		})

		hackPairBtn.on('click', startHackingPair)
		characterBtn.on('click', onCharacterBtnClick)
		characterFileInput.on('change', onFileSelected)
		characterNameInput.on('keyup', checkCharacterBtn)

		startAgainBtn.on('click', startAgain)
		restartGameBtn.on('click', restartGame)

		// and finally start from the first step

		step1()    
	})

	function step1() // intro
	{
		// console.log('step1')
		// nothing to do here, players read and move on..
	}
	
	function step2() // game options    
	{
		// console.log('step2')

		introScreen.hide()
		gameScreen.hide()
		optionsScreen.show()		
	}

	function startHackingPair()
	{
		battle.title = ''
		battle.players = []

		resetCharacterModal('Start with the LEFT player')
		showCharacterModal()		
	}

	function resetCharacterModal(title)
	{
		// console.log('resetCharacterModal ' + title)

		characterNameInput.val('').focus()

		// characterCropImage.attr('src', null)
		characterCropImage.removeAttr('src')
		characterCropImage.css('visibility','hidden')
			
		// characterRawImage.attr('src', '')
		characterRawImage.removeAttr('src')
		characterRawImage.css('visibility','hidden')
			
		removeCanvas()

		$('#characterModal h3').html(title)

		checkCharacterBtn()
	}

	function removeCanvas()
	{
		var canvas = $('#characterModal .crop-canvas')
		if (canvas) canvas.remove()
	}

	function showCharacterModal()
	{
		characterModal.modal('show')
	}

	function hideCharacterModal()
	{
		characterModal.modal('hide')
	}

	function onCharacterBtnClick()
	{
		if (characterBtn.hasClass('disabled')) return

		var length = battle.players.length
		// console.log('onCharacterBtnClick ' + length)

		var player = getHackedCharacter()

		if (length == 0)
		{
			// console.log('no players, set the left one')

			battle.players.push(player)

			battle.title = player.name + ' vs '

			resetCharacterModal('Now craft the RIGHT player')
		}	
		else if (length == 1)
		{
			// console.log('left player exists, set the right one')

			battle.players.push(player)

			battle.title += player.name

			hideCharacterModal()
			showTitle()
			showAvatars()
			enableStep3Button()
		}	
	}

	function getHackedCharacter()
	{
		var player = {}
		player.name = characterNameInput.val()
		player.src = characterCropImage.attr('src')
		return player
	}

	function checkCharacterBtn()
	{
		var disabled = false
		var name = characterNameInput.val()
		var src = characterRawImage.attr('src')
		if (src == '') disabled = true
		if (name == '') disabled = true 

		// console.log('checkCharacterBtn disabled? ' + disabled)

		if (disabled) characterBtn.addClass('disabled')
		else characterBtn.removeClass('disabled')

		if (battle.players.length == 0) characterBtn.html('Next')
		else if (battle.players.length == 1) characterBtn.html('Done')
	}

	function onFileSelected(event)
	{
		// console.log('onFileSelected')
		
		var files = event.target.files || event.dataTransfer.files
		var file = files[0]

		// console.log(file)
		
		previewFile(file)
	}	

	function previewFile(file)
	{
		// console.log('previewFile')
			
		if (file.type.indexOf('image') == 0) 
		{
			removeCanvas()

			var fileReader = new FileReader()
			fileReader.onload = function(event) 
			{
				characterRawImage.attr('src', event.target.result)
				characterRawImage.css('visibility','visible')

				characterRawImage.crop(
				{
					preview: 'img#characterCrop',
					size: {w: 64, h: 64},
					ratio: 1,
					setSelect: 'center',
					log: true
				})	
				characterCropImage.css('visibility','visible')

				checkCharacterBtn()
			}
			fileReader.readAsDataURL(file)
		}
	}

	function pairChosen(event)
	{
	   var a = $(this)

	   battle.title = a.html()

	   // console.log('pairChosen ' + battle.title)
		   
	   var players = battle.title.split(' vs ')
	   battle.players = []
		_.each(players, function(player, index)
		{
			var name = player
			var src = 'img/' + player.toLowerCase() + '.png'
			battle.players.push({name: name, src:src})
		})

		showTitle()
		showAvatars()
		enableStep3Button()
	}

	function showTitle()
	{
		$('#pairsGroup button .cta').html(battle.title)
	}

	function showAvatars()
	{
		playersAvatars.show()

		showAvatar('#playersAvatars .pull-left', battle.players[0]) // left    
		showAvatar('#playersAvatars .pull-right', battle.players[1]) // right
	}

	function showAvatar(selector, player)
	{
		$(selector).find('img').attr('src', player.src)
		$(selector).find('h3').html(player.name)
	}

	function enableStep3Button()
	{
		step3Btn.removeClass('disabled')
	}

	function step3()
	{
		// console.log('step3')

		optionsScreen.hide()
		gameScreen.show()

		if (!game) 
		{
			game = new Game()
			game.initCrafty({w:config.stage.width, h:config.stage.height})	
			game.logic = Crafty.e('GameLogic')
		}	

		// start loading things
		// Crafty.scene('loading')

		Crafty.scene('playground')
		
		// if (!gameLogic) gameLogic = 
		game.logic.start()
	}

	function startAgain()
	{
		// console.log('startAgain')
		// if (game) Crafty('GameLogic').stop()
		if (game) game.logic.stop()	
		step2()
	}

	function restartGame()
	{
		// console.log('restartGame')
		$('#gameOverModal').modal('hide')
		// if (game) Crafty('GameLogic').stop() // this function is triggered by a button, which is shown after the game has been stopped, so this line is redundant
		step3()
	}


// GAME CLASS

	var Game = function() 
	{
		// Crafty.scene('loading', this.loadingScene);
		Crafty.scene('playground', this.playgroundScene);
	}
	
	Game.prototype.initCrafty = function() 
	{
		// console.log('Game.prototype.initCrafty')
		Crafty.init(config.stage.width, config.stage.height)
		Crafty.canvas.init()
		
		/*
		Crafty.modules({ 'crafty-debug-bar': 'release' }, function () 
		{
			if (Crafty.debugBar) Crafty.debugBar.show()
		})
		*/
	}

	Game.prototype.stopCrafty = function()
	{
		Crafty.stop(true)
	}
	
	Game.prototype.playgroundScene = function() 
	{
		//create players...

		// left
		var playerLeft = battle.players[0]
		Crafty.e('Player')
			.setData(playerLeft)
			.setCharacter(playerLeft.src, {w:config.player.width, h:config.player.height})
			.setPosition({x:0, y:0})

		// right
		var playerRight = battle.players[1]
		Crafty.e('Player')
			.setData(playerRight)
			.setCharacter(playerRight.src, {w:config.player.width, h:config.player.height})
			.setPosition({x:Crafty.viewport.width - config.player.width, y:Crafty.viewport.height - config.player.height}) 
	}

// CRAFTY COMPONENTS

	// Component to limit movement within the viewport
	Crafty.c('ViewportBounded', 
	{
		init: function() 
		{
			this.requires('2D')

			this.bind('Moved', function(oldPosition) 
			{
				this.checkOutOfBounds(oldPosition)
			})    
		},

		// this must be called when the element is moved event callback
		checkOutOfBounds: function(oldPosition) 
		{
			if(!this.within(0, 0, Crafty.viewport.width, Crafty.viewport.height)) 
			{
				this.attr({x: oldPosition.x, y: oldPosition.y});
			}
		}
	})

	Crafty.c('Solid',
	{
		init: function() 
		{ 
			this.requires('2D')

			this.bind('Moved', function(oldPosition) 
			{
				this.checkHit(oldPosition)
			}) 
		},

		checkHit: function(oldPosition)
		{
			if (this.hit('Solid'))
			{
				this.attr({x: oldPosition.x, y:oldPosition.y})
				if (this.data) Crafty.trigger('PlayerCollision', this.data)
				// console.log('Solid is hitting')
			}
		} 
	})

	// Player component    
	Crafty.c('Player', 
	{   
		data: {},

		init: function() 
		{  
			// this.requires('Renderable, Fourway, Collision, ViewportBounded, SpriteAnimation, Directions')
			this.requires('2D, Collision, ViewportBounded, Multiway, Solid')
				.collision()

			return this	
		},

		setControls: function(config)
		{
			// console.log('Player setControls')
			// console.log(config) 

			// set up multiway controller
			this.multiway(config.speed, config.controls)

			return this
		},

		setCharacter: function(image, size) // url or base64 string
		{

			// what if we have a character already attached?

			this.character = Crafty.e('2D, DOM, Image')
				.image(image)
				.attr({w: size.w, h: size.h})

			this.attach(this.character)
			this.attr({w: size.w, h: size.h})

			return this
		},

		setPosition: function(position)
		{
			this.attr({x: position.x, y: position.y})

			return this
		},

		setData: function(data)
		{
			this.data = data

			return this
		}
	})

	Crafty.c('GameLogic', 
	{
		timer: 0,

		_on: false,

		switchTypes:
		[
			'status',
			'control'
		],

		reset: function()
		{
			// this.timer = Crafty.math.randomInt(2,3) // new countdown every 2-3 seconds, for testing
			this.timer = Crafty.math.randomInt(config.timer.from, config.timer.to)  
		},

		init: function() 
		{
			this.requires('Delay')
			this.checkPlayers()         
		},

		checkPlayers: function()
		{
			this.bind('PlayerCollision', this.onPlayerCollision)
		},

		start: function()
		{
			// console.log('GameLogic.start')

			this._on = true

			this.setStatuses()
			this.setControls()
			this.reset()
			this.tick()
		},

		stop: function()
		{
			// console.log('GameLogic.stop')

			this._on = false
			// this.unbind('PlayerCollision', this.onPlayerCollision)
		},

		onPlayerCollision: function(data)
		{
			// this.unbind('PlayerCollision', this.onPlayerCollision)

			// console.log('onPlayerCollision')

			if (!this._on) return
				
			this.gameOver()

			
			// console.log(data)
		},
		
		tick: function() 
		{
			// if (this._gameOver) return 
			if (!this._on) return

			// console.log('GameLogic.tick')	

			this.timer = this.timer - 1

			$('#timer').html(this.timer).fadeIn('250').fadeOut('500')

			// var delay = 1000 // milliseconds

			if (this.timer <= 0) 
			{
				this.delay(function()
				{
					this.reset()
					this.switch()
					this.delay(this.tick, 1000)
				}, 1000)
				// this.reset()
				// this.switch()
				// delay = 1500
			}
			else this.delay(this.tick, 1000)
		},

		gameOver: function()
		{
			// this._gameOver = true

			this.stop()

			var title = '', body = ' captured '
			Crafty('Player').each(function () 
			{
				var name = this.data.name + ' <span class="muted">(' + this.data.control + ')</span>'
				body = (this.data.status == 'chaser') ? 'Because ' + name + body : body + name + '.'
				var verb = (this.data.status == 'chaser') ? 'wins' : 'loses'
				if (verb == 'wins') title = this.data.name + ' ' + verb + '!'
			})
	  
			// console.log('gameOver ' + title)

			$('#gameOverModal .modal-header h3').html(title)
			$('#gameOverModal .modal-body').html(body)
			$('#gameOverModal').modal('show')
		},

		switch: function()
		{
			// roles or status?
			var randomType = this.switchTypes[ Math.round(Math.random() * (this.switchTypes.length - 1)) ]

			
			// var number = Math.round(Math.random())
			// var type = (number == 1) ? 'roles' : 'status'

			// console.log('switch ' + randomType)

			switch (randomType)
			{
				case 'status':
					this.switchStatuses()
					this.setStatuses()
					break

				case 'control':
					this.switchControls()
					this.setControls()
					break   
			}
		},

		setStatuses: function()
		{
			_.each(battle.players, function(player, index)
			{
				// console.log(player.name + '[' + index + '] becomes ' + battle.status[index])
				player.status = battle.statuses[index]

				var span = $('#gameScreen h1 span.' + player.status)
				span.html(player.name)
			})

			gameMission.effect('highlight', {}, 1000) 
		},

		switchStatuses: function()
		{
			battle.statuses.reverse()
		},

		setControls: function()
		{
			// set players' data
			_.each(battle.players, function(player, index)
			{
				// console.log(player.name + '[' + index + '] becomes ' + battle.status[index])
				player.control = battle.controls[index]

				var div = $('#playersControls div.pull-' + player.control)
				div.find('h3').html(player.name)
				div.find('img.avatar').attr('src', player.src)

				div.effect('highlight', {}, 1000) 
			})

			// then set Players' components, based on their data (changed above)
			Crafty('Player').each(function () 
			{
				this.setControls({speed:config.player.speed, controls:config.controls[this.data.control]})
			})
		},

		switchControls: function()
		{
			battle.controls.reverse()
		},

		shuffle: function(array)
		{
			// console.log('shuffle')
			// console.log(array)
			for (var j, x, i = array.length; i; j = parseInt(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x)
			// console.log(array)
			return array
		}
	})
	
})()