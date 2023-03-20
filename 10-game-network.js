/*================================================

PART 10: Network, frame loop and game start

This is our last lesson, we are going to begin
making our game network logic. Don't worry, our
library will handle all the heavy lifting. 
We just need to make a list and some events.

=================================================*/

var network = {
  
  list: {},
  
  start: function () {

/*================================================

Start web4 network, it will create one id for us.
   
=================================================*/

    var net = net4web({ debug: 2 });

    net.on('ready', function (event) {

      player.id = event.detail.id;

/*================================================

We are going to use the login date to control
who's in charge of the asteroids.

=================================================*/
      
      player.loginDate = new Date().valueOf();
      
/*================================================

Now that we have an id and a date value we can add
our own data to the game player list and turn on
the play button.

=================================================*/
    
      game.playerList[player.id] = player;
      ui.toggleButtons.play.disabled = false;
      
    }); /* close 4webReady event */

/*================================================

The join event will fire when a new player joins 
the game and will allow us to send data over the
peer connection.

=================================================*/

    net.on('connection', function (event) {
      console.log('x', event)
      var connection = event.detail.connection;

/*================================================

We save the connection to the network list in 
order to reuse it later.

=================================================*/ 
      
      network.list[event.detail.id] = connection;
      
    }); /* close connection event */
    
/*================================================

When we receive data it can be a new player data,
updated asteroids list or a bullet hit.

=================================================*/
    
    net.on("data", function (event) {
      
      var data = event.detail.data;

/*================================================

If we receive new player data we add them to the
list and keep track of the connection date.

=================================================*/
      
      if (data.player) {
        
        game.playerList[data.id] = data.player;
        data.player.lastDate = new Date().valueOf();

/*================================================

Now we check who is the oldest player, that's the
one who's gonna be in charge of calculating all
asteroids position.

=================================================*/

        var playerInCharge = player;
        loop(game.playerList, function (p) {
          if (p.loginDate < player.loginDate) {
            playerInCharge = p;
          }
        });
        var isInCharge = (player == playerInCharge);
        player.inChargeOfAstroids = isInCharge;
        
      } /* close if data.player */

/*================================================

If we receive the asteroids data, we update our 
asteroids list when we are not in charge of them.

=================================================*/
      
      if (data.asteroids) {
        
        if (!player.inChargeOfAstroids) {
          asteroids.list = data.asteroids;
        }
        
      } /* close if data.asteroids */

/*================================================

If we receive bullet hit data, we spawn smaller
asteroids if when we are in charge of them.

=================================================*/
      
      if (data.hit) {
        
        if (player.inChargeOfAstroids) {
          asteroids.spawnSmallAsteroids(a);
        }
        
      } /* close if data.hit */
      
    }); /* close 4webData event */
    
  }, /* close network start function */

/*================================================

Our broadcast function just need to add our id
and send the data to all our peers.
A simple loop will do the trick.

=================================================*/
  
  broadcast: function (data) {
    
    data.id = player.id;
    
    loop(network.list, function (connection) {
      connection.send(data);
    });
    
  } /* close broadcast function */
  
}; /* close network global var */


/*================================================

Our last global object will hold the function to
start our game, one to draw our frames, the physics
and the main game loop.

=================================================*/

var game = {

  playerList: {},

/*================================================

Since JavaScript will provide us with a length
property for objects we need to create a function
to return the number of players.
We just can use the list of keys in the object,
it's an array so we can just return it's length.
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys

=================================================*/
  
  numberOfPlayers: function () {
    return Object.keys(game.playerList).length;
  },

/*================================================

Now let's create our game start function.

=================================================*/
  
  start: function () {
    
/*================================================

First we initialize our game network.

=================================================*/
    
    if (window['net4web']) network.start();
    
/*================================================

If there's no network it means the game is going
to be single player. If that's the case we can 
create an id and add the single player to the list.

=================================================*/

    else {
      player.id = 'singleplayer';
      game.playerList[player.id] = player;

/*================================================

We also need to enable the play button.

=================================================*/
      
      ui.toggleButtons.play.disabled = false;
      
    } /* close else singleplayer */
    
/*================================================

And the last thing to do is initialize our game 
loop with it's first single call.

=================================================*/
    
    game.frameProcess();
    
  }, /* close start function */

/*================================================

The frame physics method will calculate the 
asteroids and players positions.

=================================================*/
  
  framePhysics: function () {
    
    playerPhysics.move();
    playerPhysics.turn();
    playerPhysics.shoot();
    playerPhysics.bullets();

    network.broadcast({player});
    
  /*================================================
  
  We also need to check if our bullets are hitting.
  We need to use our collide funcion to check each
  asteroid on our list against a each bullet.
  
  =================================================*/
    
    loop(asteroids.list, function(a, asteroidIndex) {
      
      loop(player.bullets, function(b, bulletIndex) {

        if (asteroids.collide(a, b)) {
          asteroids.collision(a, asteroidIndex, bulletIndex);
        };
    
      }); /* close player.bullets loop  */
      
    }); /* close asteroids.list loop  */  
    
/*================================================

Now we use our move and limit function to calculate
new positions and make sure our asteroids are 
inside our map limits.

=================================================*/

    if (player.inChargeOfAstroids) {
      
      loop(asteroids.list, function(a, asteroidIndex) {
        
        asteroids.move(a);
        world.limit(a);   
  
      }); /* close asteroid.list loop  */

      network.broadcast({asteroids: asteroids.list});
      
    } /* close if inChargeOfAstroids */
    
  }, /* close framePhysics function  */
  
/*================================================

The frame draw method will clear the canvas,
move the camera to the player ship position,
and draw all stars, asteroids and players ships.

=================================================*/
  
  frameDraw: function () {
    draw.clear();
    draw.moveCamera();
    worldDraw.allStars();
    
/*=================================================

We only draw the ships and asteroids if the player 
is not editing the ship.

=================================================*/
    
    if (!player.actionInput.editing) {
      worldDraw.allAsteroids();
      playerDraw.allShips();
    }
  },

/*================================================

The main frame loop function will first calculate 
alll physics, broadcast the player and asteroids
and draw the new frame.

Then it will call itself again in the next repaint
with the requestAnimationFrame method.
https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame

=================================================*/
  
  frameProcess: function () {
    
/*================================================

If the player is not on the user interface screen
we calculate their movement, turning and shots.

=================================================*/

    if (!player.actionInput.editing) {
      game.framePhysics();
    }

/*================================================

Then we draw everything and loop the frame process.

=================================================*/
    
    game.frameDraw();
    requestAnimationFrame(game.frameProcess);
    
  } /* close frameProcess funcion */
  
}; /* close game global var */

/*=================================================

Last we attach the game start method to the browser 
window. This way it will only be called when 
all DOM nodes are loaded.

=================================================*/

addEventListener('DOMContentLoaded', game.start);

/*=================================================

And we are finished! There are a lot of features
we could implement next, like a scoreboard,
create an inputfor player names, ship collisions, 
music and sound effects, etc.

If you want to learn more of the web game coding
universe, with more tutorials like this, please
give me some feedback!

I really hope you liked this journey.

Cheers! Bye bye...

=================================================*/

