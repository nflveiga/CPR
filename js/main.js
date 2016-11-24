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
    game.load.atlasJSONArray('guy', 'guyspritesheet.png', 'guyspritesheet.json');
    game.load.atlasJSONArray('victim', 'victimspritesheet.png', 'victimspritesheet.json');

  },






  //CREATE===================================================================================================================================
  create: function(){


    //create guy
    guy=this.game.add.sprite(this.game.world.centerX-100,this.game.world.centerY,'guy', 'newguy.png');
    guy.anchor.setTo(0.5)
    guy.scale.setTo(2);
    this.game.physics.arcade.enable(guy)

    //animations
    guy.animations.add('walkright', [5, 6], 10, true);
    guy.animations.add('walkleft', [3, 4], 10, true);

    //create victim
    victim=this.game.add.sprite(this.game.world.centerX,this.game.world.centerY,'victim', 'victim.png');
    victim.anchor.setTo(0.5)
    victim.scale.setTo(2);
    this.game.physics.arcade.enable(victim)


    //Text
    stateText = game.add.text(this.game.world.centerX,this.game.world.centerY,"", { font: '20px Arial', fill: '#ff0044' });
    stateText.anchor.setTo(0.5, 0.5);

    text = game.add.text(game.world.centerX, 0, "- You pushed -\n0 times !", {
    font: "10px Arial",
    fill: "#ff0044",
    align: "center"
});
text.anchor.setTo(0.5, 0);
  rythmAnalizer=game.add.text(0, 0,"rythm analyzer", {
    font: "10px Arial",
    fill: "#fff",
    align: "center"
  });



  },









    //UPDATE===================================================================================================================================
  update: function(){
    guy.body.velocity.x=0;

    if(this.cursors.left.isDown){
      guy.body.velocity.x=-this.WALKING_SPEED;
      guy.animations.play('walkleft');
    }
    else if(this.cursors.right.isDown){
      guy.body.velocity.x=this.WALKING_SPEED;
      guy.animations.play('walkright');
    }
    else{
      guy.animations.stop();
      guy.frame=0
    };

    //COMPRESSIONS
    if(guy.body.x<(this.game.world.centerX-50)&&guy.body.x>(this.game.world.centerX-60)){
      this.cursors.down.onDown.add(counterFunction,this);
      if(this.cursors.down.isDown){
        guy.frame=2;
        victim.frame=1;
      }
      else{
      guy.frame=1;
      victim.frame=0;
    }

    }
    else{
      this.cursors.down.onDown.remove(counterFunction,this);
      victim.frame=0;
    }

    //BREATHS
    if(guy.body.x<(this.game.world.centerX-60)&&guy.body.x>(this.game.world.centerX-100)){
      if(this.cursors.up.isDown){
        victim.frame=2;
        if(this.cursors.down.isDown){
          victim.frame=3;
          this.spaceKey.onDown.add(breathFunction,this)
          this.spaceKey.onUp.add(breathFunctionEnd,this)
          if(this.spaceKey.isDown){
            victim.frame=4;
        }
      }
}
    else{
      this.spaceKey.onDown.remove(breathFunction,this)
      this.spaceKey.onUp.remove(breathFunctionEnd,this)
      if(this.cursors.down.isDown){
        victim.frame=5;
        if(this.spaceKey.isDown){
          victim.frame=6;
      }
      }
    }

    }
    if(correctRatioCBCounter==gameOverConditionWin){
      gameOver();
    }
  }
};
function counterFunction(){
  if (breathCount==2&&compressionCountOK){
    rythmAnalizer.setText("Fast: "+fastCounter+"\nGood: "+ goodCounter+"\nSlow: "+slowCounter)
    correctRatioCB=true;
    correctRatioCBCounter++;
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
  text.setText("- You have pushed -\n" + compressionCount + " times !\n" + timerText+"\n"+correctRatioCB+"\n"+correctRatioCBCounter);
};

function breathFunction(){
  if (breathCount==0){
    if(compressionCount==30){
    compressionCountOK=true;
  }
  else compressionCountOK=false;
  compressionCount=0;
}

  breathCount++;
  breathStart=new Date().getTime();

};
function breathFunctionEnd(){
  breathStop=new Date().getTime();
  breathDuration=breathStop-breathStart;
  text.setText("- You have pushed -\n" + compressionCount + " times !\n"+ "breath count: "+breathCount+"\n"+"breath duration: "+breathDuration);
}
function resetRythmAnalyser(){
  fastCounter=0;
  goodCounter=0;
  slowCounter=0;
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
