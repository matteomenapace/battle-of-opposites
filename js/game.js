(function() 
{

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

    // Limit movement to within the viewport
    Crafty.c('ViewportBounded', 
    {
        init: function() {
            this.requires('2D');
        },
        // this must be called when the element is moved event callback
        checkOutOfBounds: function(oldPosition) {
            if(!this.within(0, 0, Crafty.viewport.width, Crafty.viewport.height)) {
                this.attr({x: oldPosition.x, y: oldPosition.y});
            }
        }
    })

    // Player component    
    Crafty.c('Player', 
    {        
        init: function() 
        {  
            // this.requires('Renderable, Fourway, Collision, ViewportBounded, SpriteAnimation, Directions')
            this.requires('Collision, ViewportBounded, Multiway')
                .collision()
                // .attr({x: 64, y: 64})
                // animate the ship - set up animation, then trigger it
                // .animate('fly', 0, 0, 1)
                // .animate('fly', 5, -1)

            // bind our movement handler to keep us within the Viewport
            this.bind('Moved', function(oldPosition) 
            {
                this.checkOutOfBounds(oldPosition)
            })    
        },

        initControls: function(config)
        {
            // console.log('Player initControls')
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
            })*/

            /*this.bind('NewDirection', function(direction) 
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
        }
    })

    Crafty.c('GameLogic', 
    {
        timer: 0,

        switchTypes:
        [
            'mission',
            // 'roles'
        ],

        init: function() 
        {
            this.requires('Delay')
            this.setMission()
            this.reset()
            // this.tick()
        },
        
        tick: function() 
        {
            // TODO check for game over

            if (this.timer <= 0) 
            {
                this.reset()
                this.switch()
            }

            this.timer = this.timer - 1

            $('#timer').html(this.timer)

            this.delay(this.tick, 1000)
        },

        reset: function()
        {
            this.timer = Crafty.math.randomInt(2,3)
        },

        switch: function()
        {
            // roles or mission?
            var randomType = this.switchTypes[ Math.round(Math.random() * (this.switchTypes.length - 1)) ]

            
            // var number = Math.round(Math.random())
            // var type = (number == 1) ? 'roles' : 'mission'

            // console.log('switch ' + randomType)

            switch (randomType)
            {
                case 'mission':
                    this.switchMission()
                    this.setMission()
                    break

                case 'roles':
                    this.setRoles()
                    break   
            }
        },

        setMission: function()
        {
            _.each(battle.players, function(player, index)
            {
                // console.log(player.name + '[' + index + '] becomes ' + battle.mission[index])
                player.status = battle.mission[index]

                var span = $('#gameScreen h1 span.' + player.status)
                span.html(player.name)
            })

            gameMission.effect('highlight', {}, 1000) 
        },

        switchMission: function()
        {
            battle.mission.reverse()
        },

        setRoles: function()
        {
            /*Crafty("Player").each(function () {
                    //console.log(this); 
                    // this.switchRole();
                })*/
        },

        shuffle: function(array)
        {
            // console.log('shuffle')
            // console.log(array)
            for (var j, x, i = array.length; i; j = parseInt(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x)
            // console.log(array)
            return array
        }

        /*hide: function()
        {
            this.text = ''
        }*/
    })

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
            this.score = this.score + 1;
            this.text(this._textGen);
        }
    })

    // Game loading and initialisation    
    var Game = function() 
    {
        // Crafty.scene('loading', this.loadingScene);
        Crafty.scene('main', this.mainScene);
    };
    
    Game.prototype.initCrafty = function() 
    {
        console.log('Game.prototype.initCrafty')
        Crafty.init(config.stage.width, config.stage.height)
        Crafty.canvas.init()
        
        /*Crafty.modules({ 'crafty-debug-bar': 'release' }, function () {
            if (Crafty.debugBar) {
               Crafty.debugBar.show();
            }
        });*/
    }
    
    Game.prototype.mainScene = function() 
    {
        // create a scoreboard
        // Crafty.e('Score')

        Crafty.e('GameLogic')
        // Crafty.e('GameOver')

        //create players...

        // left
        var playerLeft = battle.players[0]
        Crafty.e('Player')
            .initControls({speed:config.player.speed, controls:{W: -90, S: 90, D: 0, A: 180}})
            .setCharacter(playerLeft.src, {w:config.player.width, h:config.player.height})
            .setPosition({x:0, y:0})

        // right
        var playerRight = battle.players[1]
        Crafty.e('Player')
            .initControls({speed:config.player.speed, controls:{UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180}})
            .setCharacter(playerRight.src, {w:config.player.width, h:config.player.height})
            .setPosition({x:Crafty.viewport.width - config.player.width, y:Crafty.viewport.height - config.player.height}) 
        
        // create some junk to avoid
        /*for (i = 0; i < 5; i++) 
        {
            Crafty.e('Target')
        }*/
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
        gameMission
        // chaserSpan,
        // chasedSpan

    // the game data object
    var battle = 
    {
        title: '', 
        players: [], // name, url, status (chased | chaser), control (left | right)
        mission: ['chaser', 'chased'] 
    }

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
        }
    }

    // kick off when the web page is ready
    $(document).ready(function() 
    {
        step1()    
    })

    function step1() // intro
    {
        console.log('step1')

        introScreen = $('#introScreen')
        step2Btn = $('#step2Btn')

        step2Btn.on('click', step2)
    }
    
    function step2() // game options    
    {
        console.log('step2')

        optionsScreen = $('#optionsScreen')
        pairsGroup = $('#pairsGroup')
        playersAvatars = $('#playersAvatars')
        step3Btn = $('#step3Btn')

        introScreen.hide()
        optionsScreen.show()

        $('a.pairs-btn').on('click', pairChosen)


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
        step3Btn.on('click', step3)
    }

    function step3()
    {
        gameScreen = $('#gameScreen')
        gameMission = $('#gameScreen h1')
        // chaserSpan = $('#gameScreen h1 span.chaser')
        // chasedSpan = $('#gameScreen h1 span.chased')

        optionsScreen.hide()
        gameScreen.show()

        var game = new Game();
        game.initCrafty({w:config.stage.width, h:config.stage.height})

        // start loading things
        // Crafty.scene('loading')

        Crafty.scene('main')
    }




    
    // A loading scene -- pull in all the slow things here and create sprites
    /*Game.prototype.loadingScene = function() 
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
        
    };*/

    // Player component    
    /*Crafty.c('Player', {        
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
    });*/



    
})()