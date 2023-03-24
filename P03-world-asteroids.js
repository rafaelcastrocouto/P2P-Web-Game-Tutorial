/*=================================================

PART 3: Building our world

Now the first thing we are going to to is build our
asteroids.

We need some values for the big asteroids and
also for the small ones. Feel free to play around
with this values and check the result in game.

=================================================*/

var bigAsteroid = {
  speed: 0.1, /* maximum speed */
  size:  1.5, /* minimum radius */
  delta: 0.8  /* size variation */
};

/*================================================

Our small asteroids will have the same structure
as the big ones, but you guessed, their speed will
be bigger and their radius will be smaller!

=================================================*/

var smallAsteroid = {
  speed: 0.2,
  size: 0.5,
  delta: 0.5
};

/*================================================

To keep our world data well organized, let's
also store all the values in a single object.
Now let's declare our world values:

=================================================*/

var world = {
  width: 32,
  height: 32,
  maxAsteroids: 4,
  
/*================================================

We want our asteroids, ships and to stay in the world limits.
If they reach the screen limit we are going to
move them to the opposite side.

=================================================*/

  limit: function (a) {
    if (a.x < 0) a.x = world.width;
    if (a.x > world.width) a.x = 0;
    if (a.y < 0) a.y = world.height;
    if (a.y > world.height) a.y = 0;
  },
    
};

/*================================================

Next we make a function to add some random values
and add variation to each asteroid size and speed.
The argument we pass to our function called "a" 
can hold the values for big or small asteroids.

=================================================*/

var buildAsteroid = function (a) {
  
  var asteroid = {
  
/*================================================

Each asteroid should have a random position on
the world. Since "Math.random()" returns a number
from 0 to 1* we need to multiply this random
number by the dimensions we have (width and height)
to place our asteroid on a random position within
our world boundaries.

* It's actually 0.999... but it's way easier to
think of it as being just one.

=================================================*/

    x: Math.random() * world.width,
    y: Math.random() * world.height,

/*================================================

Now let's assign some random speed values to use 
later when we make our asteroid move. 
First we subtract our random value from 0.5, 
this will result in a value from -0.5 to 0.5. 
We need those negative values
otherwise our asteroid will only move left or down.

Then we multiply the random speed by a small 
number (0.05) to make our asteroid move 
just a little slower on both axis.

=================================================*/

    vx: (0.5 - Math.random()) * a.speed,
    vy: (0.5 - Math.random()) * a.speed,

/*================================================

The last value our asteroid need is a radius.
We start with a positive value, that will define
the minimum radius accepted (0.25). We add to
this a random number from 0 to 1.5, and
we have finished creating the asteroid.

=================================================*/

    r: a.size + (Math.random() * a.delta)

  };  /* close asteroid object */

  return asteroid;
  
}; /* close buildAsteroid global function */

/*================================================

To make it easier to loop over all our lists 
let's make a function can handle number ranges, 
arrays and objects. 
Learn more about how to use the for loop here:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for

=================================================*/

var loop = function (startOrArrayOrObject, endOrCallback, callback) {

  if (startOrArrayOrObject.constructor.name == 'Number') {
    
    var start = startOrArrayOrObject;
    var end = endOrCallback;
    
    for (var index=start; index < end; index++) {
      callback(index);
    }
    
  } /* close if start is number condition */
    
  if (startOrArrayOrObject.constructor.name == 'Array' ||
      startOrArrayOrObject.constructor.name == 'TouchList') {
    
    var array = startOrArrayOrObject;
    var callback = endOrCallback;
    
    for (var index=0; index < array.length; index++) {
      var item = array[index];
      callback(item, index);
    }
    
  } /* close if start is array condition */

/*================================================
  
If the list is not an array is going to be an 
object. In that case we are going to use the 
for..in loop. Read more about it here:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in

=================================================*/
  
  if (startOrArrayOrObject.constructor.name == 'Object') {
    
    var object = startOrArrayOrObject;
    var callback = endOrCallback;
    
    for (var key in object) {
      var item = object[key];
      callback(item, key);
    }
    
  } /* close if start is object condition */
  
}; /* close loop global function */

/*================================================

Let's make our asteroids move!
We need a few methods to control them,
so let's create an object to store those
functions called asteroids.

=================================================*/

var asteroids = {

/*================================================

We will need an array to store all our asteroids.

=================================================*/
  
  list: [],

/*================================================

Now we need a bunch of asteroids to fill all that
empty space, so let's create a function 
that will do just that.

=================================================*/

  build: function () {

/*================================================

We need an empty array to store our asteroids.

=================================================*/

    var array = [];

/*================================================

Now we are going make a loop to repeat our
asteroid creation. We are going to initialize 
our world with big asteroids.

=================================================*/

    loop(0, world.maxAsteroids, function () {

      var asteroid = buildAsteroid(bigAsteroid);

/*================================================

Now we add our new big asteroid to our array.

=================================================*/

      array.push(asteroid);

/*================================================

Don't forget to close the for loop. And lastly we
return our array full of asteroids.

=================================================*/

   }); /* close numberOfAsteroids loop */

    return array;

  }, /* close asteroids.build function */

/*================================================

To calculate their new positions we just need to 
add their velocity to each axis.
Note that "a += b" is the same as "a = a + b"
  
=================================================*/

  move: function (a) {
    a.x += a.vx;
    a.y += a.vy;
  },

/*================================================

Our asteroids can collide with the bullets. 
To achieve that let's make a function to
check for collisions. In the tutorial we will only
make the asteroids collide with the bullets, but
you can easily add a radius to the ships and check
their coliision like in a real game.
Or if your ship has a special shape it must use
a more advanced collision scheme.

Here I'll explain how we make a simple circular 
collision check:

=================================================*/

  collide: function (a, b) {

/*================================================

First we calculate the distance between the
asteroid "a" and the bullet "b".

We have two distances, one for "x" and another 
for "y". Both are easiy calculated with a simple
subtraction. Don't worry about negative values.

=================================================*/

    var dx = a.x - b.x;
    var dy = a.y - b.y;

/*================================================

That will provide us with the sides of a triangle. 
The hypotenuse of this triangle is our distance "d"

              (a)
               .....        "d" = hypotenuse
               .    .....
"y" distance   .         .....
 (a.y - b.y)   .              .....
               .........................(b)
                    "x" distance
                     (a.x - b.x)

We can calculate "d" with some Pythagoras.
If you can't remember I'll refresh your memory:

  A*A + B*B = C*C, in out code that will become:

        d = square root ( x*x + y*y )

=================================================*/

    var d = Math.sqrt( dx*dx + dy*dy );

/*================================================

The multiplication will remove any negative value.

If the final distance "d" between a and bis smaller 
than the sum of both radius (a.r + b.r), 
we can be sure that they are colliding.  
       
    .       .            .         .       .    .              
  .          .   d    .     .     .          .     .   
 .      a-----:------:---b   .   .     a----:-:-b   . 
  .          .        .     .     .          .     .   
    .      .             .         .        .   .            
    
=================================================*/
    
    return (d < (a.r + b.r));

  }, /* close asteroids.collide function */

  
/*================================================

The collide function we just implemented will make
a collision check. When it happens we are goin to
fire a hit event.

=================================================*/
  
  hit: function (a, asteroidIndex, bulletIndex) {

/*================================================

Let's start with some audio effect: BOOM!!! 

=================================================*/  
    
    audio.hit();
    
/*================================================

First we delete the bullet by removing it from the
player bullet list.

=================================================*/  

    player.bullets.splice(bulletIndex, 1);

/*================================================

If we are in charge of the astroids we also need
to update the asteroids list.

=================================================*/      
    
    if (player.inChargeOfAstroids) {
      
/*================================================

We also need to remove the asteroid.

=================================================*/
      
      asteroids.list.splice(asteroidIndex, 1);

/*================================================

If the list length is zero that means we have no
asteroids so we build new ones.

=================================================*/
      
      if (asteroids.list.length == 0) {
        asteroids.list = asteroids.build();
      }
      
    } /* close if player.inChargeOfAstroids condition */
    
/*================================================

If the asteroid is big enough we spawn two 
smaller asteroids!

=================================================*/
  
     if (a.r > 0.9) {
       
       if (player.inChargeOfAstroids) {
         asteroids.spawnSmallAsteroids(a);
       }
       
/*================================================

When the player is not in charge we just tell 
everyone that we were able to hit.

=================================================*/
         
       else if (network.ready) {
         network.broadcast({hit: a});
       }
       
     }  /* close if big asteroid condition */
  
  }, /* close asteroids.hit function */

  
/*================================================

When a big asteroid is destroyed, it will spawn two
smaller and faster asteroids on the same position
of the big asteroid.

We are going to loop two times, it's not pretty 
but it's better than ctrl+c and ctrl+v.

=================================================*/

  spawnSmallAsteroids: function (bigA) {
    loop(0, 2, function () {
      var smallA = buildAsteroid(smallAsteroid);
      smallA.x = bigA.x; /* same x position */
      smallA.y = bigA.y, /* same y position */
      asteroids.list.push(smallA);
    });
  }

}; /* close asteroids global var */

/*================================================

Now that we have a galaxy full of asteroids,
let's make our ships and let our players 
shoot and destroy them! Go on to the next
lesson: "P04-player-physics.js"

=================================================*/

