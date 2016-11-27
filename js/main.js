var game = new Phaser.Game(640,360, Phaser.AUTO);



var GameState={
  init: function(){

    this.scale.scaleMode=Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally=true;
    this.scale.pageAlignVertically=true;
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.cursors=this.game.input.keyboard.createCursorKeys();
    this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    //GAME CONSTANTS

    COMPRESSION_AREA_HEAD=this.game.world.centerX-70;
    COMPRESSION_AREA_FEET=this.game.world.centerX-60;
    BREATHING_AREA_FEET=COMPRESSION_AREA_HEAD-5;
    BREATHING_AREA_HEAD=BREATHING_AREA_FEET-35;


    this.WALKING_SPEED=100;
    COMPRESSION_RYTHM_FAST=500;
    COMPRESSION_RYTHM_SLOW=600;
    COMPRESSION_RESET_TIMER=2000;
    TIME_TO_VENTILATE=5000;

    BREATH_LONG=1200;
    BREATH_SHORT=800;

    compressionCount=0;
    compressionCountOK=undefined;
    startTime=undefined;
    fastCounter=0;
    goodCounter=0;
    slowCounter=0;

    breathCount=0;
    breathCountOK=undefined;
    breathStart=undefined;
    breathStop=undefined;
    breathDuration=undefined;

    correctRatioCB=undefined;
    correctRatioCBCounter=0;

    gameOverConditionWin=1;


  },
  preload: function(){

    game.load.bitmapFont('carrier_command', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');
    game.load.atlasJSONArray('pixelguy', 'guyspritesheet.png', 'guyspritesheet.json');
    game.load.atlasJSONArray('victim', 'victimspritesheet.png', 'victimspritesheet.json');
    game.load.atlasJSONArray('ambu', 'ambu.png', 'ambu.json');
    //game.load.image('pixel', 'assets/images/image.png');
    //game.load.image('victim', 'assets/images/vitima.png');
  },






  //CREATE===================================================================================================================================
  create: function(){
    //pixelguy
    pixelguy=this.game.add.sprite(this.game.world.centerX,this.game.world.centerY,'pixelguy', 'image.png');
    pixelguy.smoothed = false;
    pixelguy.scale.setTo(5);
    pixelguy.anchor.setTo(0.5)
    this.game.physics.arcade.enable(pixelguy)

    //animations
    pixelguy.animations.add('walkright', [6,7,8,9], 4, true);
    pixelguy.animations.add('walkleft', [10, 11, 12, 13], 4, true);


    //vitima
    victim=this.game.add.sprite(this.game.world.centerX,this.game.world.centerY,'victim', 'vitima200000000.png');
    victim.smoothed = false;
    victim.scale.setTo(5);
    victim.anchor.setTo(0.5,0)
    this.game.physics.arcade.enable(victim)

    //ambu
    ambu=this.game.add.sprite(this.game.world.centerX-90,210,'ambu', 'ambu0000.png');
    ambu.smoothed = false;
    ambu.scale.setTo(5);
    ambu.visible=false;

    ambuu=this.game.add.sprite(this.game.world.centerX-85,205,'ambu', 'ambu0000.png');
    ambuu.smoothed = false;
    ambuu.scale.setTo(5);
    ambuu.visible=false;



    //Text
    stateText = game.add.bitmapText(this.game.world.centerX, this.game.world.centerY, 'carrier_command','',34);
    stateText.anchor.setTo(0.5, 0.5);

    //DEBUGTEXT  text = game.add.bitmapText(game.world.centerX, 0, 'carrier_command', "- You pushed -\n0 times !", 10);
    text = game.add.bitmapText(game.world.centerX, 50, 'carrier_command', "", 20);
text.anchor.setTo(0.5, 0);
  rythmAnalizer=game.add.text(0, 0,"rythm analyzer", {
    font: "10px Arial",
    fill: "#fff",
    align: "center"
  });



  },









    //UPDATE===================================================================================================================================
  update: function(){
    pixelguy.body.velocity.x=0;

    if(this.cursors.left.isDown){
      pixelguy.body.velocity.x=-this.WALKING_SPEED;
      pixelguy.animations.play('walkleft');
      victim.frame=1;
    }

    else if(this.cursors.right.isDown){
      pixelguy.body.velocity.x=this.WALKING_SPEED;
      pixelguy.animations.play('walkright');
    }
    else{
      //guy.animations.stop();
      pixelguy.frame=0
    };


    //COMPRESSIONS
    if(pixelguy.body.x<(COMPRESSION_AREA_FEET)&&pixelguy.body.x>(COMPRESSION_AREA_HEAD)){
      this.cursors.down.onDown.add(counterFunction,this);
      if(this.cursors.down.isDown){
        pixelguy.frame=1;
        victim.frame=2;
      }
      else{
      pixelguy.frame=2;
      victim.frame=1;
    }

    }
    else{
      this.cursors.down.onDown.remove(counterFunction,this);
      victim.frame=1;
    }


    //BREATHS
    if(pixelguy.body.x<(BREATHING_AREA_FEET)&&pixelguy.body.x>(BREATHING_AREA_HEAD)){
      pixelguy.frame=3;
      if(this.cursors.up.isDown){
        victim.frame=3;
        ambuu.visible=false;
        ambu.visible=false;
        if(this.cursors.down.isDown){
          pixelguy.frame=4;
         victim.frame=3;
         ambu.visible=true;
          this.spaceKey.onDown.add(breathFunction,this)
          this.spaceKey.onUp.add(breathFunctionEnd,this)
          if(this.spaceKey.isDown){
            victim.frame=0;
        }
      }

      else if (!this.cursors.down.isDown) {
        this.spaceKey.onDown.remove(breathFunction,this)
        this.spaceKey.onUp.remove(breathFunctionEnd,this)
        if(this.spaceKey.isDown){
      checkBreathing();
    }
      }

      else{
        ambu.visible=false;
        this.spaceKey.onDown.remove(breathFunction,this)
        this.spaceKey.onUp.remove(breathFunctionEnd,this)
      }
}
    else{
      ambu.visible=false;
      this.spaceKey.onDown.remove(breathFunction,this)
      this.spaceKey.onUp.remove(breathFunctionEnd,this)
      if(this.cursors.down.isDown){
        pixelguy.frame=4;
        ambuu.visible=true;
      victim.frame=1;
        if(this.spaceKey.isDown){
         victim.frame=1;
         ambuu.frame=1;
      }
      else ambuu.frame=0;
      }
      else ambuu.visible=false;
    }

    }
    else{
      resetBreathAreaAnim();
    };

    if(correctRatioCBCounter==gameOverConditionWin){
      gameOver();
    }

  }

};
function checkBreathing(){
  pixelguy.frame=5;
}
function counterFunction(){
  if (breathCount==2&&compressionCountOK){
    rythmAnalizer.setText("Fast: "+fastCounter+"\nGood: "+ goodCounter+"\nSlow: "+slowCounter)
    correctRatioCB=true;
    correctRatioCBCounter++;
    compressionCount=0;
  }
  else correctRatioCB=false;
  breathCount=0;
timerText="";
  if(!startTime){
    startTime=new Date().getTime();
  }
  else{
    stopTime=new Date().getTime();
    compressionTimer=stopTime-startTime;
    if(compressionCount>0){
        if(compressionTimer<COMPRESSION_RYTHM_FAST){
            timerText="Too fast!";
            fastCounter++;
        }
        else if(compressionTimer>COMPRESSION_RYTHM_FAST && compressionTimer<COMPRESSION_RYTHM_SLOW){
            timerText="Good Rithm!";
            goodCounter++;
        }
        else if(compressionTimer>COMPRESSION_RYTHM_SLOW){
            timerText="Too slow!";
            slowCounter++;
        }
    }

    if(compressionCount!=30 && compressionTimer>COMPRESSION_RESET_TIMER){
      compressionCount=0;
      resetRythmAnalyser();
    }
    else if (compressionCount==30 && compressionTimer>TIME_TO_VENTILATE){
      compressionCount=0;
      resetRythmAnalyser();
    }

    }
    startTime=new Date().getTime();
  compressionCount++;
  //DEBUGTEXT  text.setText("- You have pushed -\n" + compressionCount + " times !\n" + timerText+"\n"+correctRatioCB+"\n"+correctRatioCBCounter);
  text.setText(compressionCount+" : ");
};

function breathFunction(){
  ambu.frame=1;
  ambuu.frame=1;
  if (breathCount==0){
    if(compressionCount==30){
    compressionCountOK=true;
  }
  else compressionCountOK=false;
  //compressionCount=0;
}

  breathCount++;
  breathStart=new Date().getTime();

};
function breathFunctionEnd(){
  ambu.frame=0;
  ambuu.frame=0;
  breathStop=new Date().getTime();
  breathDuration=breathStop-breathStart;
  //DEBUGTEXT text.setText("- You have pushed -\n" + compressionCount + " times !\n"+ "breath count: "+breathCount+"\n"+"breath duration: "+breathDuration);
  text.setText(compressionCount+" : "+breathCount);
}
function resetRythmAnalyser(){
  fastCounter=0;
  goodCounter=0;
  slowCounter=0;
}

function resetBreathAreaAnim(){
  ambu.visible=false;
  ambuu.visible=false;
}
function gameOver(){
    stateText.text="GAME OVER";
    stateText.visible=true;
    game.input.onTap.addOnce(restart,this);
}
function restart(){
  game.state.start(game.state.current);
}


game.state.add('GameState', GameState);
game.state.start('GameState')
