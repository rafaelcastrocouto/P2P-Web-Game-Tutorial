/*================================================

PART 06: Drawing on the canvas

It's time to draw our ships and asteroids on 
the screen with the canvas API. 
https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial

The first thing to do is to get the context, this
is where all canvas methods are stored.
We will use the '2d' context that allow us to draw
lines, arcs, images, rectangles, etc. 

=================================================*/

var canvas = document.querySelector('.screen');
var ctx = canvas.getContext('2d');

/*================================================

The width and height tells the number of pixels
the browser will calculate for the canvas.

=================================================*/

canvas.width = 256;
canvas.height = 256; 

/*================================================

We need a camera object with a few values.

The position on top of the player ship, the
rotation poiting down (angle in radians) and
the lens XY values for pan and Z for zoom.

=================================================*/

var cameraOffset = 5;

var camera = {
  position: { x: player.ship.x, y: player.ship.y - cameraOffset, z: 10 },
  rotation: { x: -Math.PI * 0.9, y: 0, z: 0 },
  lens: { x: canvas.width / 2, y: canvas.height / 2, z: 120 }
};

/*================================================

Now let's create our "draw" global variable to
hold our beautyful art.

=================================================*/

var draw = {
  
/*================================================

To create custom RGB (red, green and blue ) colors
we will use the customization values. 
If you are not familiar with RGB take a look here:
https://en.wikipedia.org/wiki/RGB_color_model

Let's use the attack for our red channel, the 
speed for the green and the control for the blue.

Since the customization values go from 0 to 100
we need to scale them. 

=================================================*/

  color: function (p) {
    var r = p.attack * 2.5;
    var g = p.speed * 2.5;
    var b = p.control * 2.5;
    return 'rgba('+r+','+g+','+b+', 1)';
  },
  
/*================================================

With our color function we can now create a 
function to draw a single colored line. 
First we project each point to our camera 
then we use the canvas API to stroke our line. 
We will only draw the line if the points are
inside out screen space.

=================================================*/

  line: function (color, start, end, width=1) {
    
    var s = draw.projectToCamera(start);
    var e = draw.projectToCamera(end);

/*================================================

To avoid clipping ships on the edge of the screen
we use an offset value.

=================================================*/

    var o = 25;
    var inScreen = function (p) {
      return (p.x > -o && p.x < canvas.width  + o && 
              p.y > -o && p.y < canvas.height + o);
    };

/*================================================

We want all our lines ends to be rounded so let's 
set the line cap value to round.
https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap

=================================================*/

    if (inScreen(s) && inScreen(e)){
    
      ctx.lineCap = "round";    
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(e.x, e.y);
      ctx.stroke();
      ctx.closePath();
    }
    
  }, /* close draw.line function */

/*================================================

Easy peasy, now let's make a circle. As before,
fist we project the center point. Let's also make 
our circles default line width equal to one pixel
and our fill color transparent.

=================================================*/

  circle: function (color, circle, width=1, fill='#0000') {
    
    var c = draw.projectToCamera({
      x: circle.x,
      y: circle.y
    });

/*================================================

Not let's calculate the radius projection.

=================================================*/

    var radiusPoint = draw.projectToCamera({
      x: circle.x + circle.r, y: circle.y
    });
    c.r = radiusPoint.x - c.x;

/*================================================

And let's use the canvas API to draw an full arc.

=================================================*/
    if (c.r >= 0) {
      ctx.lineWidth = width;
      ctx.fillStyle = fill;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI*2);
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }
    
  }, /* close draw.circle function */

/*================================================

That was too easy, come on. Let's make something 
fancier, shall we? Let's make a function that will
draw in 3D! All we gotta do is to scale the size 
of our 3D points, I mean stars, along their Z axis.
Then we can just use the fill rectangle function.

=================================================*/

  dot: function (color, p3d) {

/*================================================
    
Our stars Z value are between 8 and -8
We want our stars size to stay between 1.5 and 0.5
We invert the sign and divide by world.height to
get a factor between 0 and 1. Now we just jave to
subtract the factor from the maximum desired value.

=================================================*/
    
    var factor = -p3d.z / 8;
    var size = 1.5 - factor;
    var p = draw.projectToCamera(p3d);
    
    ctx.fillStyle = color;
    ctx.fillRect(p.x, p.y, size, size);
    
  }, /* close draw.dot function */

/*================================================

Now you are wondering how that project function
works right? If you never heard about a projection
don't worry, I got you covered.
https://en.wikipedia.org/wiki/3D_projection

But if you think that's too much math, just skip
all this camera details and move forward.

If you are still with me, let's dig in.
I'll store the camera for brevity.

=================================================*/

  projectToCamera: function (p) {
    var c = camera;

/*================================================

If our point don't have a Z axis value, let's 
assume it's equal to 0.

=================================================*/

    if (!p.z) p.z = 0;

/*================================================

First we pre-store our camera rotation cosines 
to avoid recalculating them.

=================================================*/
    var sin = {
      x: Math.sin(c.rotation.x),
      y: Math.sin(c.rotation.y),
      z: Math.sin(c.rotation.z),
    };
    var cos = {
      x: Math.cos(c.rotation.x),
      y: Math.cos(c.rotation.y),
      z: Math.cos(c.rotation.z)
    };

/*================================================

Now we store the distance between the camera and
the point, that's a simple subtraction. 

=================================================*/

    var a = {
      x: p.x - c.position.x,
      y: p.y - c.position.y,
      z: p.z - c.position.z
    };

/*================================================

We need to project each distance, for that we need
our old friend Euler. More specifically his works
on how to orient rigid bodies.

If you love maths and wanna dive real deep, go on:
https://en.wikipedia.org/wiki/Euler_angles

If you think you already are too deep then just
try to keep this image in your mind:
https://en.wikipedia.org/wiki/File:EulerProjections.svg

=================================================*/

    var szx = sin.z*a.x,
        szy = sin.z*a.y,
        czx = cos.z*a.x,
        cyz = cos.y*a.z,
        czx = cos.z*a.x,
        czy = cos.z*a.y,
        szyczx = szy+czx,
        czyszx = czy-szx;
        
    var d = {
      x: (cos.y*(szyczx))-(sin.y*a.z),
      y: (sin.x*(cyz+(sin.y*(szyczx)))+(cos.x*(czyszx))),
      z: (cos.x*(cyz+(sin.y*(szyczx)))-(sin.x*(czyszx))),
    };

/*================================================

That was the most complex part of this function.
I'll admit that it's hard to grasp. But if you
are still here, that means you've understood it
a little better right?

Now that everything is projected we still need to
scale the distances with our camera zoom. 
This will make the illusion that our stars further 
away from the camera are moving slower.
To do that we are gonig to need a scale factor.

=================================================*/

    var factor = c.lens.z / d.z;

/*================================================

If our "d.z" value is equal to zero we will have a
math problem. It's not possible to divide by zero:
https://en.wikipedia.org/wiki/Division_by_zero

That will happen when the point has the same
Z value as the camera zoom.
In our game this wont happen because our camera
Z value is greater then all other values.

But just to keep our code error free, let's
avoid this scenario with a simple if statement 
and just set our factor to zero when that
condition occour. That's how the engineers
solve problems ( deal with it mathematicians >:D )

=================================================*/

    if (d.z == 0) factor = 0;

/*================================================

Now we can calculate our 2d point by this factor. 
The last thing to do is add our lens XY positions 
to pan the image to the center of the screen.

=================================================*/

    var d2 = {
      x: (factor * d.x) + c.lens.x,
      y: (factor * d.y) + c.lens.y
    };

/*================================================

Now we can return our projected point to be drawn.

=================================================*/
    
    return d2;

  }, /* close draw.projectToCamera function */

/*=================================================

Let's create a function to keep the player ship
on the middle of our screen.

=================================================*/

  moveCamera: function () {
    
/*=================================================

We move the camera by copying our ship position, 
this way our ship will always be on the center 
of the screen while playing.

=================================================*/
    
    if (!player.actionInput.editing) {
      camera.position.x = player.ship.x;
      camera.position.y = player.ship.y - cameraOffset;
    } 
      
/*=================================================

And we animate our starfield by moving our camera
to the left.

=================================================*/
      
    else {
      camera.position.x += 0.05;
      world.limit(camera.position);
    }

  }, /* close draw player function */
  
/*================================================

To create the infinity illusion we will create 8 
mirrored images. For this to work we have to make 
sure our camera is far enough from the original.
It will look like this:  

  M M M
  M O M
  M M M

I see a loop there ( and some mother issues :D )
So the middle image is our origin. In our loop,
that's when x and y are equal to 0.

=================================================*/

  loopXY: function (callback) {
    loop( -1, 2, function (x) {
      loop( -1, 2, function (y) {
        callback(x, y);
      });
    });
  },

/*================================================

Now we can draw mirrored dots, circles and lines.

=================================================*/
  
  dotMirrored: function (color, p) {
    draw.loopXY(function (x, y) {
       var mp = {
        x: p.x + (x * world.width),
        y: p.y + (y * world.height),
        z: p.z
      };
      draw.dot(color, mp);
    });
  },

/*================================================

That's a great effect, we will use it on our stars.
Let's use it on our circles as well. We will use 
this function to draw our bullets and asterois.

We will just pass along the line color, width and 
fill color values.

=================================================*/
  
  circleMirrored: function (color, c, width, fill) {
    draw.loopXY(function (x, y) {
       var mc = {
        x: c.x+(x*world.width),
        y: c.y+(y*world.height),
        r: c.r
      };
      draw.circle(color, mc, width, fill);
    });
  },

/*================================================

We also need mirrored lines to apply this effect
on our ships. For brevity start = s and end = e

=================================================*/

  lineMirrored: function (color, s, e, width) {

    draw.loopXY(function (x, y) {
      
       var start = {
        x: s.x+(x*world.width),
        y: s.y+(y*world.height),
        z: s.z
      };
      var end = {
        x: e.x+(x*world.width),
        y: e.y+(y*world.height),
        z: e.z
      };
      draw.line(color, start, end, width);
        
    }); /* close loopXY function */
    
  }, /* close draw.lineMirrored function */

/*================================================

Last we have simple function that just clears out
all our canvas screen with the clearRect method.

=================================================*/
  
  clear: function () {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
}; /* close draw global var */

/*================================================

That was the longest lesson, if you made this far
you the next ones will be easy. Next we are going 
to use this functions to draw a parallax starfield.

What are you waiting for? Go to "P07-tv-stars.js"

=================================================*/

