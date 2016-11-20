var game = new Phaser.Game(640,360, Phaser.AUTO);

var GameState={
  init: function(){
    this.scale.scaleMode=Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally=true;
    this.scale.pageAlignVertically=true;
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.cursors=this.game.input.keyboard.createCursorKeys();

    this.WALKING_SPEED=100;
    compressionCount=0;
    startTime=undefined;


  },
  preload: function(){
    game.load.atlasJSONArray('guy', 'guyspritesheet.png', 'guyspritesheet.json');
    game.load.atlasJSONArray('victim', 'victimspritesheet.png', 'victimspritesheet.json');
    //this.load.image('guy', 'assets/images/newguy.png');
  },
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
    text = game.add.text(game.world.centerX, 0, "- You pushed -\n0 times !", {
    font: "10px Arial",
    fill: "#ff0044",
    align: "center"
});

text.anchor.setTo(0.5, 0);


  },
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
}
    }
  }
};
function counterFunction(){
  if(!startTime){
    startTime=new Date().getTime();
  }
  else{
    stopTime=new Date().getTime();
    compressionTimer=stopTime-startTime;
    if(compressionTimer>2000){
      compressionCount=0;
    }
    startTime=new Date().getTime();
  }
  compressionCount++;
  text.setText("- You have pushed -\n" + compressionCount + " times !\n" + compressionTimer);
};

game.state.add('GameState', GameState);
game.state.start('GameState')
