MyGame.gameOverState = function (game) {
};

MyGame.gameOverState.prototype = {
init: function(){
  this.scale.scaleMode=Phaser.ScaleManager.SHOW_ALL;
  this.scale.pageAlignHorizontally=true;
  this.scale.pageAlignVertically=true;

  goodTimingPercentage=(totalGoodCounts/(totalGoodCounts+totalFastCounts+totalSlowCounts))*100
},

preload: function () {
game.load.atlasJSONArray('skull', 'skull.png', 'skull.json');
game.load.atlasJSONArray('alive', 'alive.png', 'alive.json');
},


create: function () {
  titleText = game.add.bitmapText(this.game.world.centerX, 50, 'carrier_command','GAME OVER',34);
  titleText.anchor.setTo(0.5);
  conditionsText = game.add.bitmapText(25, 100, 'carrier_command','Checked safety: '+checkedSafety+"\n\nChecked mental status: "+checkedAwake+"\n\nChecked breathing: "+checkedBreathing+"\n\nCalled for help: "+calledForHelp,10);
  timingText = game.add.bitmapText(25, 300, 'carrier_command','on rythm compressions: '+goodTimingPercentage+"%",10);

  if(goodTimingPercentage>=75){
    cprResult='You saved a life!'
    resultSprite= game.add.sprite(400,150, 'alive');
    resultSprite.smoothed = false;
    resultSprite.scale.setTo(5);
    resultSprite.animations.add('wave', [0,1], 3, true);
    resultSprite.animations.play('wave');
  }
  else{
    cprResult= 'The patient died!'
  resultSprite= game.add.sprite(400,150, 'skull');
  resultSprite.smoothed = false;
  resultSprite.scale.setTo(5);
  resultSprite.animations.add('wave', [0,1], 3, true);
  resultSprite.animations.play('wave');
}
resultText =  game.add.bitmapText(400, 100, 'carrier_command',cprResult,10);




},
update: function(){
  flashText();
  if (game.input.activePointer.isDown){
    this.state.start('gameplayState');
}
  }

};
