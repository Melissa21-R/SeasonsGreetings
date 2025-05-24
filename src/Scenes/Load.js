class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        //this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
        this.load.atlas("frog", "FrogNPC.png", "FrogNPC.json");
        this.load.image("runVFX", "runningVFX.png");
        this.load.image("star", "star.png");
        this.load.image("whoosh", "jump.png"); 
        this.load.audio("boing", "drop_003.ogg");
        this.load.audio("coinBoing", "jingles_SAX04.ogg");
        this.load.audio("background", "exploration-chiptune-rpg-adventure-theme-336428.mp3");

        // Load tilemap information
        this.load.image("tiles_main", "tilemap_packed_main.png");
        this.load.image("tiles_farm", "tilemap_packed_farm.png");
        this.load.image("tiles_candy", "tilemap_packed.png");
        this.load.image("tiles_bg", "tilemap-backgrounds_packed.png");

        this.load.tilemapTiledJSON("seasonworld", "seasonworld.tmj");   // Tilemap in JSON

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed_main.png",{
            frameWidth: 18,
            frameHeight: 18
        });
       

    }

    create() {

        this.anims.create({
            key: 'idle',
            frames: [{ key: 'frog', frame: 'idle' }],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: [{ key: 'frog', frame: 'jump' }]
        });

        this.anims.create({
            key: 'midJump',
            frames: [{ key: 'frog', frame: 'midJump' }]
        });

        // Optional: make a hop animation by sequencing frames
        this.anims.create({
            key: 'hop',
            frames: [
                { key: 'frog', frame: 'idle' },
                { key: 'frog', frame: 'jump' },
                { key: 'frog', frame: 'midJump' },
                { key: 'frog', frame: 'idle' }
            ],
            frameRate: 10,
            repeat: -1
        });
        


        this.scene.start("platformerScene");

    }

    // Never get here since a new scene is started in create()
    update() {
    }
}