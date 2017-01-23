

var gameWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
var gameHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
var players= [];
var bullets = [];
var socket;
var player


class Bullet {
  constructor(game, socket){
    this.game = game;
    this.socket=socket;
    this.damage= 10;
  }


  fire ( x, y, mouseX, mouseY, id) {

          var bullet = bullets.getFirstDead();
          bullet.reset(x, y);
          bullet.playerId= id
          game.physics.arcade.moveToXY(bullet, mouseX, mouseY, 600);




}

  update(){

  }


}

class Player {
    constructor(game, socket) {
        this.game = game;
        this.socket = socket;
        this.exp= 0;
        this.health= 100;
        this.direction = "Left";
        this.id = socket.io.engine.id;
        this.speed_base = 200;
        this.speed = this.speed_base
        this.x = this.game.world.randomX;
        this.y = this.game.world.randomY;
        this.fireRate = 500;
        this.nextFire= 0

        this.addSprite();
    }

    addSprite(){
        this.sprite = this.game.add.sprite(this.x, this.y, 'myShipLeft');
        this.game.physics.p2.enable(this.sprite);
        this.sprite.body.setZeroDamping();
        this.sprite.body.fixedRotation = true;
        this.sprite.body.collideWorldBounds = true;


        this.sprite.id = this.id;
        this.sprite.health = this.health;
        this.sprite.color = this.color;
        this.sprite.exp = this.exp;
        this.sprite.speed_base = 200;
        this.sprite.speedEnhance = 0
        this.sprite.speed = this.sprite.speed_base

        this.game.camera.follow(this.sprite);
    }


    toJson () {
        return {
            id: this.sprite.id,
            speed: this.sprite.speed,
            exp: this.sprite.exp,
            x: this.sprite.x,
            y: this.sprite.y,
            direction: this.direction,
            health: this.health
        };
    }

    update(game){
      let cursors = game.input.keyboard.createCursorKeys();
      let wasd = {
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: game.input.keyboard.addKey(Phaser.Keyboard.S),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D),
          };
      let space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      if (cursors.left.isDown || wasd.left.isDown)
      {
          this.direction = "Left"
          // console.log('moving left')
          this.sprite.loadTexture('myShipLeft')
          this.sprite.body.moveLeft(this.sprite.speed);
      }
      if (cursors.right.isDown || wasd.right.isDown)
      {
          this.direction = "Right"
          // console.log('moving right')
          this.sprite.loadTexture('myShipRight')
          this.sprite.body.moveRight(this.sprite.speed);
      }
      if (cursors.up.isDown || wasd.up.isDown)
      {
          this.direction = "Up"
          // console.log('moving up')
          this.sprite.loadTexture('myShipUp')
          this.sprite.body.moveUp(this.sprite.speed);
      }
      if (cursors.down.isDown || wasd.down.isDown)
      {
          this.direction = "Down"
          // console.log('moving down')
          this.sprite.loadTexture('myShipDown')
          this.sprite.body.moveDown(this.sprite.speed);
      }
      if (game.input.activePointer.isDown || space.isDown)
      {
      if (game.time.now > this.nextFire && bullets.countDead() > 0)
        {

          this.nextFire = game.time.now + this.fireRate;
          this.socket.emit('fire', {x: this.sprite.body.x, y: this.sprite.body.y, mouseX: game.input.mousePointer.worldX, mouseY: game.input.mousePointer.worldY, playerId: this.id})
        }

      }

        if(this.sprite.health <= 0 ){
          this.socket.emit('kill_player', this.id)
        }
        if(this.fireRate > 200) this.fireRate = 500- this.sprite.exp/2;
        this.sprite.speedEnhance = Math.floor(this.sprite.exp/100)*100
        this.sprite.speed = this.sprite.speed_base + this.sprite.speedEnhance
        let playerCount =  Object.keys(players).length+1
        game.camera.focusOnXY(this.sprite.body.x, this.sprite.body.y)
        game.debug.text('Players: ' + playerCount, 32, 80)
        game.debug.text('Fire Rate: ' + this.fireRate + 'ms', 32, 100);
        game.debug.text('Speed: ' + this.sprite.speed, 32, 120);
        game.debug.text(this.sprite.exp + " XP", this.sprite.x - game.camera.x - 10, this.sprite.y - game.camera.y+ 5);
        game.debug.text(this.sprite.health + " HP", this.sprite.x - game.camera.x - 15, this.sprite.y - game.camera.y-10);
        // game.physics.arcade.moveToPointer(this.sprite, this.speed);

        this.socket.emit('move_player', this.toJson());
    }
}

class Enemy {
    constructor(game, enemy) {
        this.game = game;
        this.enemy = enemy;
        this.addSprite();
    }

    addSprite(){
        this.replacementString = "otherShip" +this.enemy.direction
        this.sprite = this.game.add.sprite(this.enemy.x, this.enemy.y, this.replacementString);
        this.game.physics.p2.enable(this.sprite, false);
        this.sprite.body.setZeroDamping();

        // this.setColision();
        this.sprite.body.fixedRotation = true;
        this.sprite.body.immovable = false;
        this.sprite.body.collideWorldBounds = true;
        this.sprite.id = this.enemy.id;
        this.sprite.color = this.enemy.color;
        this.sprite.exp = this.enemy.exp;
        this.sprite.speed_base = 500;
        this.sprite.speed = this.enemy.speed;
    }
    move(ship){
        if(this.sprite.alive){
            this.sprite.kill();
        }
        this.enemy = ship;
        this.addSprite();
    }


}


var game = new Phaser.Game(1280, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload () {
  game.load.image('background', './assets/real/background.png')

  game.load.image('myShipUp', './assets/real/myShipUp.png');
  game.load.image('myShipDown', './assets/real/myShipDown.png');
  game.load.image('myShipLeft', './assets/real/myShipLeft.png');
  game.load.image('myShipRight', '././assets/real/myShipRight.png');

  game.load.image('otherShipUp', './assets/real/otherShipUp.png');
  game.load.image('otherShipDown', './assets/real/otherShipDown.png');
  game.load.image('otherShipLeft', './assets/real/otherShipLeft.png');
  game.load.image('otherShipRight', './assets/real/otherShipRight.png');

  game.load.image('bullet', './assets/real/bullet.png')

  game.load.image('chest', './assets/real/chest.png');
  game.time.advancedTiming = true;

}

function create(){
  socket = io.connect(window.location.host);
  players =[];

  game.physics.startSystem(Phaser.Physics.P2JS);
  // game.physics.p2.setImpactEvents(true);
  game.physics.p2.restitution = 0.8;

  game.world.setBounds(-1000,-1000,2000,2000)
  background = game.add.tileSprite(-1000,-1000,2000,2000, 'background')




  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.p2;
  bullets.createMultiple(1000, 'bullet', 0, false);
  bullets.setAll('anchor.x', 0.5);
  bullets.setAll('anchor.y', 0.5);
  bullets.setAll('outOfBoundsKill', true);
  bullets.setAll('checkWorldBounds', true);


  setEventHandlers(game);
}

function setEventHandlers(game){
  this.socket.on('connect', () => {
      this.player = new Player(game, socket);
      player = this.player
      console.log(this.player)
      this.socket.emit('new_player', this.player.toJson());


      // new player
      this.socket.on('new_player', (enemy) => {
          this.players[enemy.id] = new Enemy(game, enemy, this.groupColision);
          console.log(this.players)
      });

      this.socket.on('fire', (data)=>{
        let bullet= new Bullet(this.game, this.socket);
        bullets[bullet.id]=bullet
        bullet.fire(data.x, data.y, data.mouseX, data.mouseY, data.playerId);

      });

      this.socket.on('hit', (bullet)=>{
        let shooter = bullets.children[bullet.bulletHit].playerId
        if(shooter)
        {console.log(shooter, ' just hit ' ,bullet.shipName)
        bullets.children[bullet.bulletHit].destroy()
        if(this.player.id === shooter) this.player.sprite.exp +=10
        // console.log('this is the player hitting', this.player)
        if(this.player.id === bullet.shipName) this.player.sprite.health -=10
      }
      })

      // Player
      this.socket.on('move_player', (enemy) => {
          if(this.players[enemy.id]){
              this.players[enemy.id].move(enemy);
          }
      });

      this.socket.on('kill_player', (user) => {
          if(this.player.id == user) {
              this.player.sprite.kill();
              this.player.x = game.world.randomX;
              this.player.y = game.world.randomY;
              this.player.exp = 0;
              this.player.health= 100;
              this.player.addSprite();
          }
      });

      this.socket.on('logout', (id) => {
          this.players[id].sprite.kill();
          delete this.players[id];
      });
  });


}

function checkOverlap(bullets, ship){

  let shipBounds = ship.getBounds()
  let shipName= ship.id
  // console.log('shipname', shipName)
  for (var x =0; x< bullets.children.length; x++){
    let bullet = bullets.children[x].getBounds()
    if(Phaser.Rectangle.intersects(shipBounds, bullet) && shipName !=bullets.children[x].playerId) return x
  }



  return false
}

function update(){
  game.stage.disableVisibilityChange = true;
  // console.log(player)
  if (player) {
          player.update(game);
          // console.log(players)
          // game.physics.arcade.overlap(bullets, players[] )

      }

  //     game.physics.arcade.overlap(bullets, player, Bullet.hitMe, null, this)
  let bulletHit
  if(Object.keys(players.length)){
    for(var i in players)
    {
      bulletHit = null
      bulletHit = checkOverlap(bullets,players[i].sprite)
      if(bulletHit){
        socket.emit('hit', {bulletHit, shipName: players[i].sprite.id})
        break;
        }





  //     // console.log(players[i].sprite)
  //   game.physics.arcade.overlap(bullets, players[i].sprite, gotHit, null, this)
  }
  //
  }

      // game.debug.cameraInfo(game.camera, 32, 32);
      game.debug.text('fps: '+ game.time.fps || '--', 32, 140);
}

function gotHit(){
  console.log('outer hit function')
}
