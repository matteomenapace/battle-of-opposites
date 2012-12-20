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
		playersAvatars,
		modalPicture,
		imageBtn, 
		rawImage,
		previewImage,
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
		playersAvatars = $('#playersAvatars')
		step3Btn = $('#step3Btn')

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

		// modalPicture = $('#pictureModal')
		// imageBtn = $('#imageBtn')
		// rawImage = $('img.raw')
		// previewImage = $('img.preview')
		// imageUrl = $('#imageUrl')		
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
		// create a scoreboard
		// Crafty.e('Score')


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
		
		// create some junk to avoid
		/*for (i = 0; i < 5; i++) 
		{
			Crafty.e('Target')
		}*/


		// Crafty.e('GameLogic').start()
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

			// also react to the SPACE key being pressed
			/*.requires('Keyboard')
			.bind('KeyDown', function(e) 
			{
				if (e.key === Crafty.keys.SPACE) 
				{
					// fire bullet
					Crafty.e("Bullet").attr({x: this.x + 5, y: this.y});
				}
			})

			this.bind('NewDirection', function(direction) 
			{
				this.checkDirection(direction)
			})*/

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
			this.unbind('PlayerCollision', this.onPlayerCollision)

			this.gameOver()

			// console.log('onPlayerCollision')
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
	  
			// console.log(message)

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

	

/*
	
	// A component to display the player's score
	Crafty.c('Score', 
	{
		init: function() {
			this.score = 0;
			this.requires('2D, DOM, Text');
			this._textGen = function() {
				return "Score: " + this.score;
			};
			this.attr({w: 100, h: 20, x: 900, y: 0})
				.text(this._textGen);
		},
		// increment the score - note how we call this.text() to change the text!
		increment: function() {
			this.score = this.score + 1
			this.text(this._textGen)
		}
	})

	// a renderable entity
	Crafty.c('Renderable', 
	{
		init: function() {
			// we're using DOM Spirtes
			this.requires('2D, DOM');
		},
		// set which sprite to use -- should match up with a call to Crafty.sprite()
		spriteName: function(name) {
			this.requires(name);
			return this; // so we can chain calls to setup functions
		} 
	})

	// a component to fade out an entity over time
	Crafty.c('FadeOut', 
	{
		init: function() {
			this.requires('2D');

			// the EnterFrame event is very useful for per-frame updates!
			this.bind("EnterFrame", function() {
				this.alpha = Math.max(this._alpha - this._fadeSpeed, 0.0);
				if (this.alpha < 0.05) {
					this.trigger('Faded');
					// its practically invisible at this point, remove the object
					this.destroy();
				}
			});
		},
		// set the speed of fading out - should be a small number e.g. 0.01
		fadeOut: function(speed) {
			// reminder: be careful to avoid name clashes...
			this._fadeSpeed = speed;
			return this; // so we can chain calls to setup functions
		}
	})

	// rotate an entity continually
	Crafty.c('Rotate', 
	{
		init: function() {
			this.requires('2D');

			// update rotation each frame
			this.bind("EnterFrame", function() {
				this.rotation = this._rotation + this._rotationSpeed;
			});
		},
		// set speed of rotation in degrees per frame
		rotate: function(speed) { 
			// rotate about the center of the entity               
			this.origin('center');
			this._rotationSpeed = speed;
			return this; // so we can chain calls to setup functions
		},
	})

	// an exciting explosion!
	Crafty.c('Explosion', 
	{
		init: function() {
			// reuse some helpful components
			this.requires('Renderable, FadeOut')
				.spriteName('explosion' + Crafty.math.randomInt(1,2))
				.fadeOut(0.1);
		}
	})

	// a bullet, it shoots things
	Crafty.c('Bullet', 
	{
		init: function() {
			this.requires('Renderable, Collision, Delay, SpriteAnimation')
				.spriteName('bullet')
				.collision()
				// set up animation from column 0, row 1 to column 1
				.animate('fly', 0, 1, 1)
				// start the animation
				.animate('fly', 5, -1)                
				// move left every frame, destroy bullet if its off the screen
				.bind("EnterFrame", function() {
					this.x += 10;
					if (this.x > 1024) {
						this.destroy();
					}
				})
		}
	})
   
	// targets to shoot at
	Crafty.c('Target', 
	{
		init: function() {
			this.requires('Renderable, Collision, Delay')
				// choose a random enemy sprite to use
				.spriteName('enemy' + Crafty.math.randomInt(1,2))
				.collision()
				// detect when we get hit by bullets
				.onHit('Bullet', this._hitByBullet);
			// choose a random position
			this._randomlyPosition();            
		},
		// randomly position 
		_randomlyPosition: function() {
			this.attr({
				x: Crafty.math.randomNumber(500, 800), 
				y: Crafty.math.randomNumber(0,600-this.h)});
		},
		// we got hit!
		_hitByBullet: function() {
			// find the global 'Score' component
			var score = Crafty('Score');
			score.increment();

			// show an explosion!
			Crafty.e("Explosion").attr({x:this.x, y:this.y});

			// hide this offscreen
			this.x = -2000;

			// reappear after a second in a new position
			this.delay(this._randomlyPosition, 1000);
		},
	})
	
	// A loading scene -- pull in all the slow things here and create sprites
	Game.prototype.loadingScene = function() 
	{
		var loading = Crafty.e('2D, Canvas, Text, Delay');
		loading.attr({x: 512, y: 200, w: 100, h: 20});
		loading.text('loading...');
		
		function onLoaded() {
			// set up sprites
			Crafty.sprite(64, 'img/shooter-sprites.png', {
				player: [0, 0],
				bullet: [0, 1],
				enemy1: [0, 2],
				enemy2: [1, 2],
				explosion1: [0, 3],
				explosion2: [1, 3]
				});
			
			// jump to the main scene in half a second
			loading.delay(function() {
				Crafty.scene('main');
			}, 500);
		}
		
		function onProgress(progress) {
			loading.text('loading... ' + progress.percent + '% complete');
		}
		
		function onError() {
			loading.text('could not load assets');
		}
		
		Crafty.load([
			// list of images to load
			'img/shooter-sprites.png'
		], 
		onLoaded, onProgress, onError);
		
	};

	// Player component    
	Crafty.c('Player', {        
		init: function() {           
			this.requires('Renderable, Fourway, Collision, ViewportBounded, SpriteAnimation')
				.spriteName('player')
				.collision()
				.attr({x: 64, y: 64})
				// animate the ship - set up animation, then trigger it
				.animate('fly', 0, 0, 1)
				.animate('fly', 5, -1)
				// set up fourway controller
				.fourway(5)
				// also react to the SPACE key being pressed
				.requires('Keyboard')
				.bind('KeyDown', function(e) {
					if (e.key === Crafty.keys.SPACE) {
						// fire bullet
						Crafty.e("Bullet").attr({x: this.x + 5, y: this.y});
					}
				});

			// bind our movement handler to keep us within the Viewport
			this.bind('Moved', function(oldPosition) {
				this.checkOutOfBounds(oldPosition);
			});
		},
	});

*/



	
})()