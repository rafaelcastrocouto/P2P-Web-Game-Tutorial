/*================================================

PART 10: Network, frame loop and game start

This is our last lesson, we are going to begin
making our game network logic. Don't worry, our
library will handle all the heavy lifting. 
We just need to make a list and add some events.

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

    window.net = net

/*================================================

We save the methods we will need to use later.

=================================================*/

    network.on = net.on;
    network.broadcast = net.broadcast;
    network.numberOfPlayers = net.numberOfPlayers;
    
/*================================================

Lastly we attach our network events.

=================================================*/
    
    network.on('ready', network.ready);
    network.on('data', network.data);
    network.on('left', network.left);
    
  }, /* close network.start function */

/*================================================

When our connection is ready the library will 
create one id for us. We also save the login 
date to check who's in charge of the asteroids.

=================================================*/
  
  ready: function (event) {

    player.id = event.detail.id;
    player.loginDate = event.detail.loginDate;
    
/*================================================

Now that we have an id and a date value we can
turn on the play button.

=================================================*/

    ui.toggleButtons.play.disabled = false;
    
  }, /* close network.ready function */
  
/*================================================

When we receive data it can be a new player data,
updated asteroids list or a bullet hit.

=================================================*/
  
  data: function (event) {

    var data = event.detail.content.data;

/*================================================

If we receive new player data we add them to the
network player list.

=================================================*/
    
    if (data.player) {
      network.list[event.detail.id] = data.player;
    }

/*================================================

If we receive the asteroids data, we update our 
asteroids list when we are not in charge of them.

=================================================*/
    
    if (data.asteroids && !player.inChargeOfAstroids) {
      asteroids.list = data.asteroids;
    }

/*================================================

If we receive bullet hit data, we remove the 
asteroid and spawn two smaller ones.

=================================================*/
    
    if (data.hit && player.inChargeOfAstroids) {
      var asteroidIndex = data.hit.index;
      var asteroid = asteroids.list[asteroidIndex];
      asteroids.hit(asteroid, asteroidIndex);
    }
    
  }, /* close network.data function */
  
/*================================================

When we hit an asteroid we broadcast it's position.

=================================================*/
  
  hit: function (asteroidIndex) {

    if (network.broadcast) {
      network.broadcast({hit: asteroidIndex});
    }
  
  },
  
/*================================================

We need to check who is the player in charge, 
that's the one who's gonna be calculating all
asteroids position.

=================================================*/
  
  inChargeCheck: function () {
    
/*================================================

If there's player is in single player mode or if 
there's no one else, we must be in charge.

=================================================*/
    
    if (player.id == 'singlePlayer' || 
        network.numberOfPlayers() == 0) {
      
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

When a player leaves we just need to remove them
from the list. The delete operator, as you might 
imagine, removes a property from an object:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete

=================================================*/
  
  left: function (event) {
    delete network.list[event.detail.id];
  }
  
}; /* close network global var */

/*================================================

Our last global object will hold the function to
start our game, one to draw our frames, the physics
and the main game loop.

=================================================*/

var game = {

/*================================================

Now let's create our game start function. First we 
start the TV effect and build our starfield.

=================================================*/
  
  start: function () {

    tvEffect.start();
    worldDraw.buildStars();
    
/*================================================

Now we attach all our user control events.

=================================================*/
    
    ui.start();
    keyboard.start();
    
/*================================================

All set to initialize our game network.

=================================================*/
    
    if (window['net4web']) network.start();
    
/*================================================

If there's no network it means the game is going
to be single player. If that's the case we can 
create an id and add the single player to the list.

=================================================*/

    else {
      
      player.id = 'singlePlayer';
      player.inChargeOfAstroids = true;

/*================================================

We also need to enable the play button.

=================================================*/
      
      ui.toggleButtons.play.disabled = false;
      
    } /* close else singlePlayer condition */
    
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
  
  physicsFrame: function () {
    
    if (!player.actionInput.editing) {
      playerPhysics.move();
      playerPhysics.turn();
      playerPhysics.shoot();
      playerPhysics.bullets();
    }
    
  /*================================================
  
  We also need to check if our bullets are hitting.
  We need to use our collide function to check each
  asteroid on our list against each bullet.
  
  =================================================*/
    
    loop(asteroids.list, function(a, asteroidIndex) {
      loop(player.bullets, function(b, bulletIndex) {

/*================================================

If they collide we add a point to the player score,
remove the bullet and run our asteroids hit function.

=================================================*/ 
        
        if (asteroids.collide(a, b)) {

          player.score += 1;
          player.bullets.splice(bulletIndex, 1);
          
          if (player.inChargeOfAstroids) {
            asteroids.hit(a, asteroidIndex);
          }

/*================================================

When the player is not in charge we just tell 
everyone that we were able to hit.

=================================================*/
            
          else {
            network.hit({index: asteroidIndex});
          }
          
        } /* close if asteroids.collide condition */
    
      }); /* close player.bullets loop  */
    }); /* close asteroids.list loop  */  
    
/*================================================

Now if we are in charge, we use our move and limit 
function to calculate new positions and make sure 
our asteroids are inside our map limits.

=================================================*/
    
    if (player.inChargeOfAstroids) {
      
 /*================================================

If there are no asteroids we must build them.

=================================================*/    

      if (asteroids.list.length == 0) {
        asteroids.list = asteroids.buildAll();
      }
      
      loop(asteroids.list, function(a, asteroidIndex) {
        
        asteroids.move(a);
        world.limit(a);   
  
      }); /* close asteroid.list loop  */
      
    } /* close if player.inChargeOfAstroids condition */
    
  }, /* close game.physicsFrame function */
  
/*================================================

The frame draw method will clear the canvas,
move the camera to the player ship position,
and draw all stars, asteroids, players ships
and the TV effect.

=================================================*/
  
  drawFrame: function () {
    
    draw.clear();
    draw.moveCamera();
    worldDraw.allStars();
    worldDraw.allAsteroids();
    playerDraw.allShips();
    tvEffect.draw();
    
  },  /* close game.drawFrame function */

/*================================================

The main frame loop function will first calculate 
all game physics and draw the new frame.

First the check if we are in charge.

=================================================*/
  
  frameProcess: function () {
    
    network.inChargeCheck();
      
/*================================================

If the player is not on the user interface screen
we calculate their movement, turning and shots.

=================================================*/
    
    game.physicsFrame();

/*================================================

Now we broadcast all information we calculated to
our friends.

=================================================*/
    
    if (network.broadcast) {
      
      network.broadcast({player});
      
      if (player.inChargeOfAstroids) {
        network.broadcast({asteroids: asteroids.list});
      }
      
    }

    
/*================================================

Then we draw everything with our draw function.

=================================================*/

    game.drawFrame();

    highScores.update();

/*================================================

Then it will call itself again in the next repaint
with the requestAnimationFrame method.
https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame

=================================================*/    
    
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

