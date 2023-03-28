/*=================================================

PART 04: Calculating player physics

This is the most important file in our game from
the player's perspective. Here we will calculate 
their ships positions, the bullets movement 
and all user input from keyboard.

As before, lets put all our values in small
objects. That makes easier to remember where
each data is stored.

=================================================*/

var player = {

/*=================================================

To track the input, we just need an object.

=================================================*/

  actionInput: {

/*=================================================

Each player can either be in or out of the
ship user interface. That's where the player will
begin the game and where it's able to customize
their ship. We keep track of it with a boolean.

=================================================*/

    editing: true,
    
/*=================================================

We are going to add more input in the future but
this is enough to start our game.

=================================================*/
    
  }, /* close player.actionInput object */ 

/*=================================================

Here we store the player's ship bonus values.

=================================================*/

  attack: 50,
  speed: 50,
  control: 50,

/*=================================================

And each player will have a list of their bullets.

=================================================*/

  bullets: [],

/*=================================================

Each player will have his custom ship, with lots of
dimensions and movement values. The positions x, y
in the middle of the screen, w for width, 
h for height, a for angle, and so on...

=================================================*/

  ship: {
    
    x: /*Math.random() **/ world.width,
    y: /*Math.random() **/ world.height,
    w: 1.2,        /* width */
    h: 1.5,        /* height */

                   /* Attack: */
    
    maxDelay: 65,  /* maximum delay between shots */
    delay: 0,      /* current delay */

                   /* Speed: */
    
    v: 0,          /* current speed */
    vx: 0, vy: 0,  /* velocities (x,y) */
    max: 0.01,     /* maximum speed */
    motor: 0.0005, /* acceleration force */
    brake: 0.996,  /* speed reduction */

                   /* Control: */
    
    a: 0,          /* current angle */
    va: 0,         /* current turning speed */
    turn: 0.02,    /* turning force */ 
    momento: 0.8,  /* rotation reduction */

  }, /* close player.ship object */

  score: 0

}; /* close player global var */

/*================================================

You might be wondering how I came up with all those
values and the answer is simple: testing it out.
If you play around with them a bit you will see
how easy it is to make your own crazy values!

Now let's make out ships move!
I'm gonna create a "s" variable just for
code brevity. 

=================================================*/

var playerPhysics = {
  
  move: function () {
    
    var s = player.ship;
    
/*================================================

If the player is pressing up we make it move.

=================================================*/

    if (player.actionInput.up) {

/*================================================

We need to adjust the speed customization value
that goes from 0 to 100. That's way too much.
So we just multiply it by a very small number.

=================================================*/
      
      var mBonus = (player.speed * 0.00005);

/*================================================

To calculate the current speed "s" we add the motor
and the bonus speed value to the current speed.

=================================================*/
            
      s.v += (s.motor + mBonus);
    
/*================================================

We need to cap his speed to the maximum speed
using our speed bonus in order for the speed bonus 
to increase the ship top speed.

=================================================*/
    
      var maxSpeed = s.max + (player.speed * 0.001);
    
      if ( s.v > maxSpeed ) s.v = maxSpeed;
  
/*================================================

If the player is not pressing up or his speed is
greater than the maximum speed, we make it break.

To calculate the break speed we multiply the 
current speed by the brake value. This works
beacuse our break value is smaller than one.

We will also adjust the breaking speed taking in 
consideration our control bonus value.

=================================================*/

    } /* close if player.actionInput.up condition */
    
    else s.v *= s.brake - (player.control * 0.0005);
    
/*================================================

To calculate our new composite velocities we need some
trigonomery. If you are not familiar with sine and 
cosine functions, you can learn a lot here:
https://en.wikipedia.org/wiki/Trigonometric_functions

=================================================*/

    s.vx = s.v * Math.sin(s.a);
    s.vy = s.v * Math.cos(s.a);

/*================================================

To make the ship change position we just need to 
add our velocities to the ship x and y position.

=================================================*/

    s.x += s.vx;
    s.y += s.vy;

/*================================================

Finally we reuse the limit function to keep our
ships inside our boundaries.

=================================================*/
    
    world.limit(s);

  }, /* close playerPhysics.move function */

/*================================================

Now let's make the turning mechanics. 
Again I'm gonna create a "s" variable just for
code brevity.
I'll also create a pi2 variable for the same reason.

=================================================*/

  turn: function (p) {
    var s = player.ship;
    var pi2 = Math.PI*2;

/*================================================

Let's calculate the anglular speed "va" that the 
ship will rotate. Again we will reduce the bonus 
value that's between 1 and 100, just like we did 
for the speed bonus. We add this reduced value 
to the ship's default turn angle.

=================================================*/

    var turnAngle = s.turn + (player.control * 0.0008);

/*================================================

If one of the control keys is pressed we will receive
this data in our keyPress function and store in 
the keys object; If it's set to true, that means
we can add our turnAngle value to our velocity angle.

=================================================*/

    if (player.actionInput.right) s.va = turnAngle;

/*================================================

To turn around the other way we just need to
multiply by -1;

=================================================*/
    
    if (player.actionInput.left) s.va = turnAngle * -1;

/*================================================

If no turn keys are pressed we want our ship to
stop spinning. It's the same logic as the breaks

=================================================*/

    else s.va *= s.momento;

/*================================================

Now we just need to add our velocity angle to
the ship current angle to make it rotate.

=================================================*/

    s.a += s.va;

  }, /* close playerPhysics.turn function */

/*================================================

Time to shoot some asteroids!

=================================================*/

  shoot: function(p) {
    
    var s = player.ship;
    
/*================================================

To control the shooting speed we are going to 
use our player current delay counter. 
It will go down every loop call.

=================================================*/

    s.delay -= 1;

/*================================================

If the player is not editing his ship
and is pressing a shoot key and the
current delay is smaller than 0, 
that means we can shoot.

=================================================*/

    if (!player.actionInput.editing && 
         player.actionInput.shoot && 
         s.delay < 0) {

/*================================================

Let's start with some nice shooting sound!

=================================================*/

      if (audio.ctx) audio.shoot();
      
/*================================================

To allow the player to shoot again we need set our
current delay to a value greater than 0.
Let's use our default delay time, but we gonna
subtract some time. 

Let's make this reducted time scale with the
player attack so the more attack the player
has, the faster he will be able to shoot.
To achieve this, let's remove a fraction of the
attack bonus from the delay.

=================================================*/

      s.delay = s.maxDelay - (player.attack * 0.6);
      
/*================================================

We want our attack bonus to make our bullets faster

=================================================*/

      var speedBonus = 1 + player.attack * 0.01;
      
/*================================================

The first place our bullet will appear must be
at the point in front of our ship, not the center.
Let's calculate this offset so we can add it to
the ship position.

=================================================*/

      var offsetBonus = (player.attack/100);
      
      var offset = {
        x: (s.h/2 + offsetBonus) * Math.sin(s.a),
        y: (s.h/2 + offsetBonus) * Math.cos(s.a)
      };
      
/*================================================

Now we can create our first bullet. As I said
we add the offset to both x and y positions.

=================================================*/
      
      var bullet = {
        x: s.x + offset.x,
        y: s.y + offset.y,

/*================================================

We can add a small fraction of our attack bonus to
our bullet radius to make them more menacing.

=================================================*/

        r: 0.1 + (player.attack * 0.005),

/*================================================

Now we need to calculate the bullet speed.
Fist we need a vector pointing to the same direction
as our ship. We already have that, it's the same
as the offset we just calculated before.
Let's just tune it down a little, we don't want
our bullet too fast.

We also need to take into account the ship speed 
and add it to the bullet speed, this will simulate
the bullet inertia. And we also increase the 
speed with our speedBonus.

=================================================*/

        vx: ((offset.x * 0.14) + s.vx) * speedBonus,
        vy: ((offset.y * 0.14) + s.vy) * speedBonus,

/*================================================

We don't want our bullet to run forever, so we will
add a life time. This will limit the shooting range.

We want our attack to reach about half of our screen
width and we are gonna dencrease this range with a
fraction of the player attack value. This way players
with more attack will have greater shooting range,
but not that much since the speed of the bullets
will also take into account the attack bonus.

=================================================*/

        life: 75 - (player.attack * 0.5)

      }; /* close bullet object */

/*================================================

Now that we hane our pretty bullet we can add it
to the player bullet list.

=================================================*/

      player.bullets.push(bullet);
      
    } /* close if can shoot condition */
    
  }, /* close playerPhysics.shoot function */
  
/*================================================

Now let's move our bullets and check if they 
are hitting something.

=================================================*/

  bullets: function () {
    
    loop(player.bullets, function(b, bulletIndex) {
      
/*================================================

Like with our asteroids, we just need to add the
x and y velocities, and add some bonus as well.
keep the map limit and we are good to go.

=================================================*/

      b.x += b.vx;
      b.y += b.vy;

      world.limit(b);   
      
/*================================================

Our bullet is getting older!

=================================================*/

      b.life--;
      
/*================================================

If our bullet life has ended we need to remove it
from the list. The splice method is explained here:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice

=================================================*/
      
      if (b.life < 0) {
        player.bullets.splice(bulletIndex, 1);
      }

    }); /* close player.bullets loop */

  } /* close playerPhysics.bullets function */
  
}; /* close playerPhysics global var */

/*================================================

That was a lot, right! Well it was all of our game
physics and player management in one file. 
Take a break, drink some water and eat a cake,
you deserve it!

After you are done head to "P05-user-input.js"

=================================================*/

