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

We start web4 network, with our bot token and the
channel id. 

=================================================*/

    var net = net4web({
      channelId: '01GVQDK26HWZQ8KKJ78C1AMWVY',
      token: 'PGo5TJg0NwsPy03UjV-S8V9r5NfDJQiri6oYqcvh_eitIvOu9_Sx3DP1F1hS50hK'
    });

/*================================================

We save the methods we will need to use later.

=================================================*/
    
    network.on = net.on;
    network.broadcast = net.broadcast;
    network.numberOfPlayers = net.numberOfPlayers;
    
/*================================================

When our connection is ready the library will 
create one id for us.

=================================================*/
    
    network.on('ready', function (event) {

      player.id = event.detail.id;

/*================================================

We are going save the login date to be able to 
check who's in charge of the asteroids.

=================================================*/

      player.loginDate = event.detail.loginDate;
      
/*================================================

Now that we have an id and a date value we can
turn on the play button.

=================================================*/

      ui.toggleButtons.play.disabled = false;
      
    }); /* close network ready event listener */
    
/*================================================

When we receive data it can be a new player data,
updated asteroids list or a bullet hit.

=================================================*/
    
    network.on("data", function (event) {

      var data = event.detail.content.data;
      
/*================================================

If we receive new player data we add them to the
list and keep track of the connection date.

=================================================*/
      
      if (data.player) {
        
        network.list[data.id] = data.player;
        network.list[data.id].lastDate = new Date().valueOf();
        
      } /* close if data.player condition */

/*================================================

If we receive the asteroids data, we update our 
asteroids list when we are not in charge of them.

=================================================*/
      
      if (data.asteroids) {
        
        if (!player.inChargeOfAstroids) {
          asteroids.list = data.asteroids;
        }
        
      } /* close if data.asteroids condition */

/*================================================

If we receive bullet hit data, we spawn smaller
asteroids if when we are in charge of them.

=================================================*/
      
      if (data.hit) {
        
        if (player.inChargeOfAstroids) {
          asteroids.spawnSmallAsteroids(a);
        }
        
      } /* close if data.hit condition */
      
    }); /* close network data event listener */
    
  }, /* close network.start function */
  
/*================================================

We need to check who is the player in charge, 
that's the one who's gonna be calculating all
asteroids position.

=================================================*/
  
  inChargeCheck: function () {

/*================================================

Let's be sure we won't make a disconnected player
in charge of the asteroids.

=================================================*/
    
    network.disconnectCheck();
    
/*================================================

If there's no one else we must be in charge.

=================================================*/
    
    if (network.numberOfPlayers() == 1) {
      player.inChargeOfAstroids = true;
    } 

/*================================================

We loop over the list to see who's the oldest
player, they will be the one in charge. 

=================================================*/
    
    else {
      var playerInCharge = player;
      loop(network.list, function (p) {
        if (p.loginDate < player.loginDate) {
          playerInCharge = p;
        }
      });
      
/*================================================

We finally check if we are in charge.

=================================================*/
      
      var inCharge = (player == playerInCharge);
      player.inChargeOfAstroids = inCharge;
      
    }
    
  }, /* close network.inChargeCheck function */

/*================================================

If we don't receive data from a player for more
than seconds we remove them from the list. We also
have to update who's in charge of the asteroids.

=================================================*/
  
  disconnectCheck: function () {
    
    loop(network.list, function (p) {
      if (new Date().valueOf() - p.lastDate > 2000) {
        delete network.list[p.id];
      }
    }); /* game.playerList loop  */

  } /* close network.disconnectCheck function */
  
}; /* close network global var */


/*================================================

Our last global object will hold the function to
start our game, one to draw our frames, the physics
and the main game loop.

=================================================*/

var game = {

/*================================================

Now let's create our game start function and 
create our starfield.

=================================================*/
  
  start: function () {

    worldDraw.buildStars();
    
/*================================================

Now we attach all our user control events.

=================================================*/
    
    ui.start();
    keyboard.start();
    
/*================================================

All set to initialize our game network.

=================================================*/
    
    
    if (window['Net4web']) network.start();
    
/*================================================

If there's no network it means the game is going
to be single player. If that's the case we can 
create an id and add the single player to the list.

=================================================*/

    else {
      
      player.id = 'singleplayer';

/*================================================

We also need to enable the play button.

=================================================*/
      
      ui.toggleButtons.play.disabled = false;
      
    } /* close else singleplayer condition */
    
/*================================================

And the last thing to do is initialize our game 
loop with it's first single call.

=================================================*/
    
    game.frameProcess();
    
  }, /* close game.start function */

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
  We need to use our collide function to check each
  asteroid on our list against a each bullet.
  
  =================================================*/
    
    loop(asteroids.list, function(a, asteroidIndex) {
      
      loop(player.bullets, function(b, bulletIndex) {

        if (asteroids.collide(a, b)) {
          asteroids.hit(a, asteroidIndex, bulletIndex);
        };
    
      }); /* close player.bullets loop  */
      
    }); /* close asteroids.list loop  */  
    
/*================================================

Now we use our move and limit function to calculate
new positions and make sure our asteroids are 
inside our map limits.

=================================================*/

    network.inChargeCheck();
    
    if (player.inChargeOfAstroids) {
      
      loop(asteroids.list, function(a, asteroidIndex) {
        
        asteroids.move(a);
        world.limit(a);   
  
      }); /* close asteroid.list loop  */

      network.broadcast({asteroids: asteroids.list});
      
    } /* close if player.inChargeOfAstroids condition */
    
  }, /* close game.framePhysics function */
  
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
      playerDraw.allShips(network.list);
    }
    
    tvEffect();
    
  },  /* close game.frameDraw function */

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
    
  } /* close game.frameProcess function */
  
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

