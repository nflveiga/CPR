MyGame.gameplayState = function (game) {
};

MyGame.gameplayState.prototype = {
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

flashTimer=0;

checkedSafety=!false;
checkedAwake=!false;
checkedBreathing=!false;
calledForHelp=!false;
survivalChain=!false;

    compressionCount=0;
    compressionCountOK=undefined;
    startTime=undefined;

    //COMPRESSION COUNTERS
    fastCounter=0;
    goodCounter=0;
    slowCounter=0;
    totalGoodCounts=0;
    totalFastCounts=0;
    totalSlowCounts=0;

    //TIMING COMBOS
    comboCount=0;
    comboRecord=0;

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

    //game.load.bitmapFont('carrier_command', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');
    game.load.atlasJSONArray('pixelguy', 'guyspritesheet.png', 'guyspritesheet.json');
    game.load.atlasJSONArray('victim', 'victimspritesheet.png', 'victimspritesheet.json');
    game.load.atlasJSONArray('ambu', 'ambu.png', 'ambu.json');
    game.load.image('dangerArea', 'assets/images/redzone0000.png');
    //game.load.image('victim', 'assets/images/vitima.png');
  },

  //CREATE===================================================================================================================================
  create: function(){
    //pixelguy
    pixelguy=this.game.add.sprite(30,this.game.world.centerY+50,'pixelguy', 'image.png');
    pixelguy.smoothed = false;
    pixelguy.scale.setTo(5);
    pixelguy.anchor.setTo(0.5)
    this.game.physics.arcade.enable(pixelguy)

    //animations
    pixelguy.animations.add('walkright', [6,7,8,9], 6, false);
    pixelguy.animations.add('walkleft', [10, 11, 12, 13], 6, false);
    pixelguy.animations.add('callHelp', [18,19,18,19,18,18,19,19,18], 4, false);
    pixelguy.animations.add('checkSafety', [14,14,0,15,15], 6, false);


    //vitima
    victim=this.game.add.sprite(this.game.world.centerX,this.game.world.centerY+50,'victim', 'vitima200000000.png');
    victim.smoothed = false;
    victim.scale.setTo(5);
    victim.anchor.setTo(0.5,0)
    this.game.physics.arcade.enable(victim)

    //ambu
    ambu=this.game.add.sprite(this.game.world.centerX-90,210+50,'ambu', 'ambu0000.png');
    ambu.smoothed = false;
    ambu.scale.setTo(5);
    ambu.visible=false;

    ambuu=this.game.add.sprite(this.game.world.centerX-85,205+50,'ambu', 'ambu0000.png');
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
  comboText=game.add.bitmapText(20, 40, 'carrier_command', '', 10);
  comboText.visible=false;

  //tutorialText=game.add.bitmapText(game.world.centerX, 40, 'carrier_command', "First, check safety!", 8);
  //tutorialText.anchor.setTo(0.5);
  //actionText=game.add.bitmapText(game.world.centerX, 60, 'carrier_command', "press -spacebar-", 8);
  //actionText.anchor.setTo(0.5);


//hotKeys
  this.key1 = game.input.keyboard.addKey(Phaser.Keyboard.ONE);

  //floor
  dangerArea=game.add.sprite(this.game.world.centerX-10,this.game.world.centerY+130,'dangerArea');
  dangerArea.anchor.setTo(0.5,0)
  dangerArea.scale.setTo(50,5);
  dangerArea.visible=true;



  },

    //UPDATE===================================================================================================================================
  update: function(){
    pixelguy.animations.currentAnim.onComplete.add(function () {	pixelguy.frame=0;}, this);
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
      //pixelguy.animations.stop();
      if(!calledForHelp){
      this.key1.onDown.add(callHelp,this);
    }
    else this.key1.onDown.remove(callHelp,this);
      //pixelguy.frame=0
    };


    //COMPRESSIONS
    if(pixelguy.body.x<(COMPRESSION_AREA_FEET)&&pixelguy.body.x>(COMPRESSION_AREA_HEAD)){
      if(this.spaceKey.isDown){
        this.cursors.down.onDown.remove(counterFunction,this);
        pixelguy.frame= 16;
        if(this.cursors.down.isDown){
          checkAwake();

        }
      }
      else{
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
        checkSurvivalChain();
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
      if(!checkedSafety){
        if(!checkOverlap(pixelguy, victim)){
      this.spaceKey.onDown.add(checkSafety,this);
    }
    }
    else this.spaceKey.onDown.remove(checkSafety,this);

    if(correctRatioCBCounter==gameOverConditionWin){
      gameOver();
    }
    flashArea();


  },


};

function flashArea(){
  flashTimer += game.time.elapsed;
  if ( flashTimer >= 1000 ){
    flashTimer -= 1000;
    dangerArea.visible = !dangerArea.visible;
  }
}

function checkSurvivalChain(){
  if(!survivalChain){
    gameOver();
  };
}


function checkAwake(){
  pixelguy.frame= 17;
  if(checkedSafety && !checkedBreathing && !calledForHelp){
  checkedAwake=true;
  tutorialText.setText("He does not react!!! Is he breathing?");
  actionText.setText("go to the green area, press -up- to open airway + -spacebar- to listen");
}
else gameOver()
}

function checkOverlap(spriteA, spriteB) {

    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();

    return Phaser.Rectangle.intersects(boundsA, boundsB);

}
function checkSafety(){
  if(!checkedAwake && !checkedBreathing && !calledForHelp){
  checkedSafety=true;
  tutorialText.setText("It's safe!!! approach the victim and check if he responds!");
  actionText.setText("go to the green area, then press -spacebar- + -down arrow-");
  pixelguy.animations.play('checkSafety');
  pixelguy.animations.currentAnim.onComplete.add(function () {
    pixelguy.frame=0;
}, this);
}
else gameOver();
}

function callHelp(){
  pixelguy.animations.play('callHelp');
  pixelguy.animations.currentAnim.onComplete.add(function () {	pixelguy.frame=0;}, this);
  if(checkedSafety && checkedAwake && checkedBreathing){
  calledForHelp=true;
  survivalChain=true;
  tutorialText.setText("help is on the way!now start cpr!");
  actionText.setText("go to green area and start making compressions (press -down-)");
}
else gameOver();
}

function checkBreathing(){
  pixelguy.frame=5;
  if(checkedSafety&& checkedAwake && !calledForHelp){
  checkedBreathing=true;
  tutorialText.setText("He does not breathe! this is an emergency! call help!!");
  actionText.setText("press -1- to call help!");
}
else gameOver();
}
function counterFunction(){
  if (compressionCount==0){
    checkSurvivalChain();
  };


  if (breathCount==2&&compressionCountOK){
    totalGoodCounts=totalGoodCounts+goodCounter;
    totalFastCounts=totalFastCounts+fastCounter;
    totalSlowCounts=totalSlowCounts+slowCounter;
    rythmAnalizer.setText("Fast: "+fastCounter+"\nGood: "+ goodCounter+"\nSlow: "+slowCounter+"\n"+ totalFastCounts+" | "+ totalGoodCounts+" | "+totalSlowCounts)
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
            resetComboText();
        }
        else if(compressionTimer>COMPRESSION_RYTHM_FAST && compressionTimer<COMPRESSION_RYTHM_SLOW){
            timerText="Good Rithm!";
            goodCounter++;
            comboCount++;
            comboText.setText("GOOD TIMING x"+comboCount+"\nRecord: "+comboRecord);
            comboText.visible=true;
        }
        else if(compressionTimer>COMPRESSION_RYTHM_SLOW){
            timerText="Too slow!";
            slowCounter++;
            resetComboText();
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
  //text.setText("- You have pushed -\n" + compressionCount + " times !\n" + timerText+"\n"+correctRatioCB+"\n"+correctRatioCBCounter);
  text.setText(compressionCount+" : ");

};


function resetComboText(){
  if(comboCount>comboRecord&&comboCount<30){
    comboRecord=comboCount;
  }
  comboCount=0;
  comboText.visible=false;
};

function breathFunction(){
  ambu.frame=1;
  ambuu.frame=1;
  if (breathCount==0){
    checkSurvivalChain();
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
  game.state.start('gameOverState');
    //stateText.text="GAME OVER";
    //stateText.visible=true;
    //game.input.onTap.addOnce(restart,this);
}
function restart(){
  game.state.start(game.state.current);
}


//game.state.add('GameState', GameState);
//game.state.start('GameState')
