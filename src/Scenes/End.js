class End extends Phaser.Scene
{
    constructor()
    {
        super("over");

        this.my = {sprite: {}};

        this.bodyX = 300;
        this.bodyY = 350;
    }

 
   
    create(time) 
    {
        this.add.text(innerWidth/2, 150, 'Level Completed',
            {
                fontSize: '40px',
                fill: '#ffffff',
                fontFamily: '"Press Start 2P"'
            }
        ).setOrigin(0.5, 0.5);
        
        
        this.add.text(innerWidth/2, 300, 'Time: ' + time.finalTime + ' seconds', 
        {
            fontSize: '40px',
            fill: '#ffffff',
            fontFamily: '"Press Start 2P"',
        }).setOrigin(0.5, 0.5);;

        this.add.text(innerWidth/2, 450, 'Fastest Time: ' + time.fastTime + ' seconds', 
        {
            fontSize: '40px',
            fill: '#ffffff',
            fontFamily: '"Press Start 2P"',
        }).setOrigin(0.5, 0.5);


        
        this.playAgain = this.add.text(innerWidth/2, 600, "Play Again",
            {
                fontSize: '40px',
                fill: '#ffffff',
                fontFamily: '"Press Start 2P"',
            }
        ).setOrigin(0.5, 0.5).setDepth(1).setInteractive({useHandCursor: true});

        this.timerBG = this.add.rectangle(
            innerWidth/2,
            this.playAgain.y + this.playAgain.height / 2 - 20,
            this.playAgain.width + 35,         // add padding
            this.playAgain.height + 35,
            0x228B22                // green color in hex
        ).setOrigin(0.5, 0.5).setDepth(0);  // behind text


        this.playAgain.on("pointerdown", () =>
        {
            this.scene.stop("over");
            this.scene.get("platformerScene").scene.restart();
        })
        
    }

   
    update() 
    {   
        
    }
}


