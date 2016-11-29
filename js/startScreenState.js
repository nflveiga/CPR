var MyGame = {};
MyGame.startScreenState = function (game) {
};
MyGame.startScreenState.prototype = {
init: function(){
  this.scale.scaleMode=Phaser.ScaleManager.SHOW_ALL;
  this.scale.pageAlignHorizontally=true;
  this.scale.pageAlignVertically=true;
},

preload: function () {
game.load.bitmapFont('carrier_command', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');
},
create: function () {
  titleText = game.add.bitmapText(this.game.world.centerX, this.game.world.centerY, 'carrier_command','PIXEL CPR',34);
  titleText.anchor.setTo(0.5);
  clickText=game.add.bitmapText(this.game.world.centerX, this.game.world.centerY+80, 'carrier_command','click/tap screen to play',8);
  clickText.anchor.setTo(0.5);
  authorText=game.add.bitmapText(640, 360, 'carrier_command','2016 Nuno Veiga',6);
  authorText.anchor.setTo(1);

  flashTextTimer = 0
//this.state.start('StateB');
},
update: function(){
  flashText();
  if (game.input.activePointer.isDown){
    this.state.start('gameplayState');
}
  }

};

function flashText(){
  flashTextTimer += game.time.elapsed;
  if ( flashTextTimer >= 1000 ){
    flashTextTimer -= 1000;
    clickText.visible = !clickText.visible;
  }
}






//Update functionupdate(){    timer += game.time.elapsed; //this is in ms, not seconds.    if ( timer >= 1000 )    {        timer -= 1000;        text.visible = !text.visible;    }}
