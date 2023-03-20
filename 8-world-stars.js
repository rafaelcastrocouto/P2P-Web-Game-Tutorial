/*=================================================

PART 8: Drawing stars and resizing the world

In this lesson we will build our starfiled, 
so lest's start choosing the number of
starts in our sky.

=================================================*/

world.maxStars = 256;

/*=================================================

Now, as usual, let's make an object to store our 
drawing methods.

=================================================*/
var worldDraw = {
  
/*=================================================

Let's add some stars to our world. They will just
have random values for their positions.

=================================================*/
  
  createStar: function () {
    
    var star = {
      x: Math.random() * world.width,
      y: Math.random() * world.height,
  
/*=================================================

We want the Z position of our stars to stay 
somewhere between -8 and +8

=================================================*/
      
      z: (-0.5 + Math.random()) * 2 * 8
    };
    
    return star;
    
  }, /* close createStar function */
  
/*=================================================

Now we will create our starfield.
We need an array to store their positions.

=================================================*/

  buildStars: function () {
    
    world.starsList = [];

/*=================================================

Time to use a loop to create a bunch of starts 
with a random positions in our world. 
Let's assign them a random Z axis values relative 
to our camera position, this will give them a nice 
parallax effect.

=================================================*/
    
    loop(0, world.maxStars, function () {
      var newStar = worldDraw.createStar();
      world.starsList.push(newStar);
    });
    
  }, /* close buildStars function */

/*=================================================

If the user resizes the browser window, we want
to keep our game screen fitting all available
scale. There are two possibilities for the
screen ratio: portrait and landscape.
I'll create a "c" camera variable just to keep 
the code short.

=================================================*/

  resize: function() {
    
    var c = draw.camera;

/*=================================================

To check for the window ratio we need to compare it 
to our game world ratio, so let's calculate them both.

=================================================*/

    var windowRatio = innerWidth / innerHeight;
    var worldRatio = world.width / world.height;

/*=================================================

If we are in portrait mode, we want our canvas to
have same width as the browser inner window. The
height will be calcutated with the ratio.

=================================================*/

    if (windowRatio < worldRatio) {
      canvas.width = innerWidth;
      canvas.height = canvas.width / worldRatio;

/*=================================================

To scale our drawings and make them fit the screen
we just have to adjust our camera lens zoom.

=================================================*/

      c.lens.z = c.position.z * (innerWidth / world.width);

    } /* close if portrait ratio */
    
/*=================================================

Now we do the same for the landscape mode.

=================================================*/

    else {
      canvas.height = innerHeight;
      canvas.width = canvas.height * worldRatio;
      c.lens.z = c.position.z * (innerHeight / world.height);
    }

/*=================================================

Last we set our camera lens to keep it on the 
center of the screen.

=================================================*/

    draw.camera.lens.x = canvas.width / 2;
    draw.camera.lens.y = canvas.height / 2;

  }, /* close resize function */


/*=================================================

Since the resize function calculates and redraws
a lot of things we want to throttle it's calls.
With throttling, you run a function immediately, 
and wait a specified amount of time before 
running it again. Any additional attempts to run 
it before that time period is over are ignored.

To achieve this we need two booleans, one to 
check if we are waiting and another to check if
we should call the function after the delay.

=================================================*/
  
  wait: false,
  delayCall: false,
  waitInterval: 60, /* miliseconds */
  
  delayResize: function () {
    
    if ( !worldDraw.wait ) {

/*=================================================

If we are not waiting we can just call the function
and set the booleans with their proper values.

=================================================*/
      
      worldDraw.resize();
      worldDraw.wait = true;
      worldDraw.delayCall = false;
      
    } else {

/*=================================================

If the function is called again we will call it
after the delay. To prevent repeated delay calls
we need to clear the previous timeouts.

=================================================*/
      
      clearTimeout(worldDraw.timeout);
      worldDraw.delayCall = true;
    }

/*=================================================

To create a timeout  we use setTimeout.
Read more about it here:
https://developer.mozilla.org/en-US/docs/Web/API/setTimeout

=================================================*/

	worldDraw.timeout = setTimeout(function () { 
      
/*=================================================

After the wait period we reset the wait value 
and call again if it was not called before.

=================================================*/
      
      worldDraw.wait = false 
      if (worldDraw.delayCall) worldDraw.resize();
      
    }, worldDraw.waitInterval );
    
  }, /* close delayResize function */

/*=================================================

So we have two things to draw in our world, the 
asteroids and the starts.
We should have the asteroids function on lesson 3
but fisrt I wanted to introduce the drawing function.
Since now we already implemented the draw methods 
we just need to loop through each array and choose 
our colors and line widths.

=================================================*/
  
  allAsteroids: function () {
    loop(asteroids.list, function(a) {
      draw.circleMirrored('lightgrey', a, 2, '#fff1');
    });
  },
  
  allStars: function () {
    loop(world.starsList, function(s) {
      draw.dotMirrored('white', s, 4);
    });
  },

/*=================================================

Last we start our client world. We need to call
the function we created earlier to build our 
starfield. We also call the resize function one
first time and attach it to the propper event.

=================================================*/

  start: function () {
    worldDraw.buildStars();
    worldDraw.resize();
    window.addEventListener('resize', worldDraw.delayResize);
  }

}; /* close world global var */


worldDraw.start(); 

/*=================================================

On p09-players-draw.js we will draw our ships!

=================================================*/

