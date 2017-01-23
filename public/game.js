var players= [];
var bullets = [];
var Chests = []
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
}
class Chest {
  constructor(game, chest){
  this.game = game;
  this.chest = chest;
  this.addSprite();
  }

  addSprite(){
    this.sprite = this.game.add.sprite(this.chest.x, this.chest.y, 'chest')
    // this.game.physics.p2.enable(this.sprite, false);
    this.sprite.body= null
    this.sprite.id = this.chest.id;
  }

  move(chest){
    if(this.sprite.alive){
        this.sprite.kill();
    }
    this.chest = chest;
    this.addSprite();
}


}

class Player {
    constructor(game, socket) {
        this.healthBar = new HealthBar(game, {x: 200, y: 200, width: 120, isFixedToCamera: false, height: 20 });
        this.game = game;
        this.socket = socket;
        this.exp= 0;
        this.health= 100;
        this.direction = "Left";
        // this.id = socket.io.engine.id;
        this.id = name;
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
          this.sprite.loadTexture('myShipLeft')
          this.sprite.body.moveLeft(this.sprite.speed);
      }
      if (cursors.right.isDown || wasd.right.isDown)
      {
          this.sprite.loadTexture('myShipRight')
          this.sprite.body.moveRight(this.sprite.speed);
      }
      if (cursors.up.isDown || wasd.up.isDown)
      {
          this.direction = "Up"
          this.sprite.loadTexture('myShipUp')
          this.sprite.body.moveUp(this.sprite.speed);
      }
      if (cursors.down.isDown || wasd.down.isDown)
      {
          this.direction = "Down"
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
        this.healthBar.setPercent(this.sprite.health);
        this.healthBar.setPosition(this.sprite.x+10 , this.sprite.y-100  )
        if(this.fireRate > 200) this.fireRate = 500- this.sprite.exp/2;
        this.sprite.speedEnhance = Math.floor(this.sprite.exp/100)*100
        if(this.sprite.speed <1500)this.sprite.speed = this.sprite.speed_base + this.sprite.speedEnhance
        let playerCount =  Object.keys(players).length+1

        let sortedPlayers=  []
        let index =0
        for(var i in players)
        {
          sortedPlayers[index] = {exp: players[i].sprite.exp, name: players[i].enemy.id}
          index++
          }
          sortedPlayers.push({exp: this.sprite.exp, name: this.id})
        sortedPlayers.sort(function(a,b){
          return b.exp - a.exp
        })







        game.camera.focusOnXY(this.sprite.body.x, this.sprite.body.y)

        // console.log(sortedPlayers)
        game.debug.text('===Leader Board===', 950, 60)
        if(sortedPlayers[0])
        game.debug.text('1.' + sortedPlayers[0].name + '  Exp: ' + sortedPlayers[0].exp, 950, 80)
        else game.debug.text('1. -----'  , 950, 80)
        if(sortedPlayers[1])
        game.debug.text('2.' + sortedPlayers[1].name  + '  Exp: ' + sortedPlayers[1].exp, 950, 100)
        else game.debug.text('2. -----'  , 950, 100)
        if(sortedPlayers[2])
        game.debug.text('3.' + sortedPlayers[2].name  + '  Exp: ' + sortedPlayers[2].exp, 950, 120)
        else game.debug.text('3. -----'  , 950, 120)


        game.debug.text('You: '+ this.id, 32,  60)
        game.debug.text('Players: ' + playerCount, 32, 80)
        game.debug.text('Fire Rate: ' + this.fireRate + 'ms', 32, 100);
        game.debug.text('Speed: ' + this.sprite.speed, 32, 120);
        game.debug.text(this.sprite.exp + " EXP", this.sprite.x - game.camera.x - 15, this.sprite.y - game.camera.y+ 5);
        this.socket.emit('move_player', this.toJson());

    }
}

class Enemy {
    constructor(game, enemy) {
        this.healthBar = new HealthBar(game, {x: 200, y: 200, width: 120, isFixedToCamera: false, height: 20 });
        this.game = game;
        this.enemy = enemy;
        this.addSprite();
    }

    addSprite(){
        this.replacementString = "otherShip" +this.enemy.direction
        this.sprite = this.game.add.sprite(this.enemy.x, this.enemy.y, this.replacementString);
        this.sprite.health = this.enemy.health
        this.game.physics.p2.enable(this.sprite, false);
        this.sprite.body.setZeroDamping();
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
  Chests = [];

  game.physics.startSystem(Phaser.Physics.P2JS);
  game.physics.p2.restitution = 0.8;

  game.world.setBounds(-1000,-1000,2000,2000)
  background = game.add.tileSprite(-1000,-1000,2000,2000, 'background')
 game.stage.disableVisibilityChange = true;



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
      this.socket.emit('new_player', this.player.toJson());

      this.socket.on('getChests', (chests) => {
              for (var chest of chests) {

                  Chests[chest.id] = new Chest(game, chest);
              }
      });

      this.socket.on('claim_Chest', (data)=>{
        Chests[data.chest.id].sprite.destroy()
        Chests[data.chest.id]= null
        Chests[data.chest.id]= new Chest(game, data.chest)
        if(this.player.id === data.id ) {
          if(this.player.sprite.health > 50)
          this.player.sprite.health = 100
          else{
            this.player.sprite.health +=50
          }
          this.player.sprite.exp +=20
        }

      })

      this.socket.on('new_player', (enemy) => {
          this.players[enemy.id] = new Enemy(game, enemy, this.groupColision);
          // console.log(this.players)
      });

      this.socket.on('fire', (data)=>{
        let bullet= new Bullet(this.game, this.socket);
        bullets[bullet.id]=bullet
        bullet.fire(data.x, data.y, data.mouseX, data.mouseY, data.playerId);

      });

      this.socket.on('hit', (bullet)=>{
        let shooter = bullets.children[bullet.bulletHit].playerId
        if(shooter)
        {
        bullets.children[bullet.bulletHit].destroy()
        if(this.player.id === shooter) this.player.sprite.exp +=10
        if(this.player.id === bullet.shipName) {
          this.player.health -=10
          this.player.sprite.health -=10
        }
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
          this.players[id].healthBar.kill();
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

function checkChestOverlap(chests, ship){
  let shipBounds = ship.getBounds()
  let shipName = ship.id
  let chest = null;
  for(var z = 0;z< Chests.length; z++){
    if(Chests[z]){
      chest = Chests[z].sprite.getBounds()

    }
    if( chest && Phaser.Rectangle.intersects(shipBounds, chest)) return z
  }
}

let chestHit
let refreshTimeChest = 0
function update(){
  game.stage.disableVisibilityChange = true;
  if (player) {
          player.update(game);

          if(game.time.now > refreshTimeChest){
          chestHit = null
          chestHit = checkChestOverlap(Chests, player.sprite)
          if(chestHit || chestHit ===0){
            // console.log(chestHit)
            socket.emit('claim_Chest', {data: chestHit, id: player.id})
            refreshTimeChest= game.time.now+100
          }
      }

  let bulletHit
  if(Object.keys(players.length)){
    for(var i in players)
    {
      // console.log(players[i].sprite.health)
      players[i].healthBar.setPercent(players[i].sprite.health)
      players[i].healthBar.setPosition(players[i].sprite.x+10 , players[i].sprite.y-100  )
      bulletHit = null
      bulletHit = checkOverlap(bullets,players[i].sprite)
      // console.log(players)
      if(bulletHit){
        socket.emit('hit', {bulletHit, shipName: players[i].sprite.id})
        break;
        }

      }

      }
  }

      game.debug.text('fps: '+ game.time.fps || '--', 32, 140);


}
