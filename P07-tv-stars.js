/*=================================================

PART 07: Drawing stars and TV effect

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
    
  }, /* close worldDraw.createStar function */
  
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
    
  }, /* close worldDraw.buildStars function */

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
  }

}; /* close worldDraw global var */

/*=================================================

To achieve that old TV screen effect let's just
draw 1px height rectangles with another canvas.

=================================================*/

var tvEffect = {

  canvas: document.querySelector('.screenEffect'),

  start: function () {
    
    tvEffect.ctx = tvEffect.canvas.getContext('2d');
    tvEffect.ctx.fillStyle = 'black';
/*=================================================

We just need 1px width and our CSS style will
scale the canvas horizontally. Setting the height
to zero will force our loop to update the height.

=================================================*/
    
    tvEffect.canvas.width = 1;
    tvEffect.canvas.height = 0;
    
  }, /* close tvEffect.start function */
  
  draw: function () {

/*=================================================

The innerHeight property tells us the height of the 
window in pixels.
https://developer.mozilla.org/en-US/docs/Web/API/Window/innerHeight

=================================================*/
    
    if (tvEffect.canvas.height != innerHeight) {
      
      tvEffect.canvas.height = innerHeight;

/*=================================================

We just need to loop half of the height since we
will have one black line and one transparent line.
This math is not hard at all, is it? 1+1=2

We will use the fillRect canvas context method to
draw our 1px horizontal black lines.
https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillRect

=================================================*/
      
      loop(0, innerHeight / 2, function (i) {
        tvEffect.ctx.fillRect(0, i * 2, canvas.width, 1);
      }); 
      
    } /* close if change innerHeight condition */
  
  } /* close tvEffect.draw function */
  
}; /* close tvEffect global var */

/*=================================================

That's is it, that was quick, right? Now on 
"P08-players-ship.js" we will draw our ships!

=================================================*/

