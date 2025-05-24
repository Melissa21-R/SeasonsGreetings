class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }


    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 1000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = config.width / 720;
        this.elaspedTime = 0;
        this.timerActive = false;
    }

    create() {

        //load in sounds
        this.boingSound = this.sound.add("boing");
        this.coinSound = this.sound.add("coinBoing");

        if(!this.sound.get("background"))
        {
            this.backGroundMusic = this.sound.add("background", {loop: true, volume: 0.5});
            this.backGroundMusic.play();
        }
        //add fastest time storer
        if(!localStorage.getItem("FastestTime"))
        {
            localStorage.setItem("FastestTime", 0); 
        }
        this.fastestTime = parseFloat(localStorage.getItem("FastestTime"));
        //start my timer
        this.timerActive = true; 

        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("seasonworld", 18, 18, 40, 80);
       

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("Main-Platform", "tiles_main");
        this.tilesetFarm = this.map.addTilesetImage("Farm-Platformer", "tiles_farm");
        this.tilesetCandy = this.map.addTilesetImage("Candy-Platform", "tiles_candy");
        this.tilesetBG = this.map.addTilesetImage("Backround-Map", "tiles_bg");
        

        // Create a layer
        this.bg = this.map.createLayer("Background", [this.tileset, this.tilesetFarm, this.tilesetCandy, this.tilesetBG], 0, 0);
        this.treeClouds = this.map.createLayer("Trees-Mushrooms-Clouds", [this.tileset, this.tilesetFarm, this.tilesetCandy, this.tilesetBG], 0, 0);
        this.groundLayer = this.map.createLayer("Platforms", [this.tileset, this.tilesetFarm, this.tilesetCandy, this.tilesetBG], 0, 0);
        this.decor = this.map.createLayer("Decoration", [this.tileset, this.tilesetFarm, this.tilesetCandy, this.tilesetBG], 0, 0);
        

        this.animatedTiles.init(this.map);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collision: true,
        });

         this.treeClouds.setCollisionByProperty({
            collision: true
        });


        this.anims.create({
            key: 'coin-spin',
            frames: this.anims.generateFrameNumbers('tilemap_sheet', {
                start: 151,  // starting frame of coin animation
                end: 152     // ending frame (adjust based on tileset animation)
            }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'flag-wave',
            frames: this.anims.generateFrameNumbers('tilemap_sheet', {
                start: 112,
                end: 111
            }),
            frameRate: 6,
            repeat: -1
        });

        this.coins = this.map.createFromObjects("Coins-End", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });
        
        this.coins.forEach(coin => {
            coin.anims.play('coin-spin');  // play animation for coins
        });

        this.theStart = this.map.createFromObjects("Coins-End", {
            name: "flag",
            key: "tilemap_sheet",
            frame: 112
        });

        this.theStart.forEach(flag => {
            flag.anims.play('flag-wave');
        });

        this.theStart = this.map.createFromObjects("Coins-End", {
            name: "start",
            key: "tilemap_sheet",
            frame: 131
        });

        this.endFlags = this.map.createFromObjects("Coins-End", {
            name: "end",
            key: "tilemap_sheet",
            frame: 131
        });

        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.endFlags, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);
        this.endGroup = this.add.group(this.endFlags);

        // set up player avatar
        this.spawnPoint = this.map.findObject("Coins-End", obj => obj.name === "start");
        my.sprite.player = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, "frog", "idle");
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.treeClouds);

        my.vfx.coinParticles = this.add.particles(0, 0, "star",
            {
                scale: {start: 5, end: 0.1},
                lifespan: 350,
                gravityY: -400,
                alpha: {start: 1, end: 0.1},
            }
        );
        my.vfx.coinParticles.stop();

        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            this.elaspedTime -= 5.00; 
            obj2.destroy(); // remove coin on overlap
            my.vfx.coinParticles.explode(12, obj2.x, obj2.y);
            this.coinSound.play();
            
        });

        //collison detection with end flag
        if(this.physics.add.overlap(my.sprite.player, this.endGroup, () =>
            {
                this.timerActive = false;
                if(this.elaspedTime < this.fastestTime || this.fastestTime == 0)
                {
                    localStorage.setItem("FastestTime", this.elaspedTime); 
                    this.fastestTime = this.elaspedTime;
                }
                if(this.sound.get("background"))
                {
                    this.backGroundMusic.destroy();
                }
                this.scene.stop("platformerScene");
                this.scene.start("over", {finalTime: this.elaspedTime.toFixed(2), fastTime: this.fastestTime.toFixed(2)});
            }
        ));
       
        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true;
            this.physics.world.debugGraphic.clear();
        }, this);

        //RESET DEBUG
        this.physics.world.drawDebug = false;
        this.physics.world.debugGraphic.clear();

       // movement vfx here
        my.vfx.walking = this.add.particles(0, -5, 'runVFX', {
            lifespan: 350,
            gravityY: -400,
            alpha: { start: 1, end: 0.1 },
            scale: { start: 1.2, end: 0.1 },
            speedX: { min: -20, max: 20 },
            speedY: { min: 10, max: 40 },
            maxAliveParticles: 5,
            frequency: 100
        });
        my.vfx.walking.stop();  

        my.vfx.jump = this.add.particles(0, -10, 'whoosh', 
            {
                lifespan: 350,
                gravityY: -400,
                alpha: { start: 1, end: 0.1 },
                scale: { start: 1.5, end: 0.1 },
                speedX: { min: -20, max: 20 },
                speedY: { min: 10, max: 40 },
                maxAliveParticles: 1,
                frequency: 100
            }
        );
        my.vfx.jump.stop(); 

        
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        //camera code here
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
        /*this.events.on('postupdate', () => {
            const cam = this.cameras.main;
            //cam.scrollY = Math.round(cam.scrollY / 2) * 2;
        });*/
       
        console.log(this.map.widthInPixels/2 * this.SCALE - this.map.widthInPixels/2 + 10);
        console.log(this.map.widthInPixels/2 * this.SCALE);
        console.log(this.SCALE);
        console.log(this.map.widthInPixels/2);
        console.log(window.innerWidth);
        console.log(config.width);

        console.log("L");
        console.log(this.map.widthInPixels / (window.innerWidth - 50) * (window.innerHeight - 20));

        let aspectRatio = (this.map.heightInPixels * SCALE / 4) / (this.map.widthInPixels * SCALE);

        this.timerText = this.add.text(
            (this.map.widthInPixels/2 * this.SCALE - this.map.widthInPixels/2)/*Align to left edge*/ + 15, 
            (this.map.heightInPixels/8 * this.SCALE - this.map.heightInPixels/8)/*Align to top edge*/ + 5,
            'Time: 0.00', 
            {
                fontSize: '25px',
                fill: '#ffffff',
                fontFamily: 'monospace'
            }
        );
        this.timerText.setOrigin(0, 0);
        this.timerText.setScrollFactor(0);
        this.timerText.setDepth(1);

        this.timerBG = this.add.rectangle(
            (this.map.widthInPixels/2 * this.SCALE - this.map.widthInPixels/2), 
            (this.map.heightInPixels/8 * this.SCALE - this.map.heightInPixels/8),
            this.timerText.width + 30,         // add padding
            this.timerText.height + 10,
            0x000000               // black color in hex
        ).setOrigin(0, 0).setDepth(0).setScrollFactor(0);  // behind text
       
        

    }

    

    update() 
    {
        
        //update my timerrrr
        if(this.timerActive)
        {
            console.log(20);
            this.elaspedTime += this.game.loop.delta / 1000; //puts my ms into seconds
            this.timerText.setText("Time: " + this.elaspedTime.toFixed(2)); //shows the two decimal places
        }

        this.cameras.main.scrollY = Math.round(this.cameras.main.scrollY / 2) * 2;

        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('hop', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.resetFlip();;
            my.sprite.player.anims.play('hop', true);
            // particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, true);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // vfx stop playing
            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
       
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.vfx.jump.explode(10, my.sprite.player.x, my.sprite.player.y + my.sprite.player.height / 2); 
            this.boingSound.play();
        }
       

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        this.tileUnderPC = this.groundLayer.getTileAtWorldXY(my.sprite.player.x, my.sprite.player.y + my.sprite.player.height / 2 + 1, true);
        if(this.tileUnderPC && this.tileUnderPC.properties.slip)
        {
            my.sprite.player.setDragX(100);
            
        }
        else
        {
            my.sprite.player.setDragX(this.DRAG);
           
        }

       
    }
}