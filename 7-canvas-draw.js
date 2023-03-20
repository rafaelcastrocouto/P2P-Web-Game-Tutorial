/*================================================

PART 7: Drawing on the canvas

It's time to draw our ships and asteroids on 
the screen. To achieve that we are going to use
the canvas API.
https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial

The first thing to do is to get the context, this
is where all canvas methods are stored.
We will use the '2d' context that allow us to draw
lines, arcs, images, rectangles, etc. 

The other possible values for the context are: 
"webgl" and "webgl2" that produce a 3d context
and "bitmaprenderer" that draw image bitmaps.
Maybe someday I'll alsowrite a tutorial for them.

=================================================*/

var canvas = document.querySelector('.screen');

var ctx = canvas.getContext('2d');

/*================================================

We want all our lines ends to be rounded so let's 
set the line cap value to round.
https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap

=================================================*/

ctx.lineCap = "round";

/*================================================

Now let's create our "draw" global variable to
hold our beautyful art.

=================================================*/

var draw = {
  
/*================================================

To start simple, let's create a function to draw
a single colored line. First we project each
point to our camera then we use the canvas API
to stroke our line. Let's also set a default line
width of 1 pixel.

=================================================*/

  line: function (color, start, end, width=1) {
    ctx.lineWidth = width;
    var s = draw.projectToCamera(start);
    var e = draw.projectToCamera(end);
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(e.x, e.y);
    ctx.stroke();
    ctx.closePath();
  },

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

    ctx.lineWidth = width;
    ctx.fillStyle = fill;
    ctx.strokeStyle = color;
    
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI*2);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    
  }, /* close circle function */

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
    
  }, /* close dot function */

/*================================================

Now you are wondering how that project function
works right? If you never heard about a projection
don't worry, I got you covered.
https://en.wikipedia.org/wiki/3D_projection

But if you think that's too much math, just skip
all this camera details and move forward.

If you are still with me, let's dig in.
First we need a camera object with a few values.

The position on the middle of the world, the
rotation poiting down (angle in radians) and
the lens XY values for pan and Z for zoom.

=================================================*/
  
  camera: {
    position: { x: world.width / 2, y: world.height / 2, z: 8 },
    rotation: { x: -Math.PI, y: 0, z: 0 },
    lens: { x: canvas.width / 2, y: canvas.height / 2, z: 100 }
  },

/*================================================

Now let's break the project function down.
I'll store the camera for brevity.

=================================================*/

  projectToCamera: function (p) {
    var c = draw.camera;

/*================================================

If our point don't have a Z axis value, let's 
assume it's equal to 0.

=================================================*/

    if (!p.z) p.z = 0;

/*================================================

First we pre-store our camera rotation sines and 
cosines for performance reasons.

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

We will first multiply each XY distance
by the cosine of the Z axis camera rotation.
Since our camera rotation is locked pointing 
down to the XY plane with no Z rotation, 
this cosine value is always equal to one,
so it won't change anything.

Then we scale our distance X by the cosine 
of the Y rotation. This is also always 
equal to one, meaning no changes are made 
to our X distances.

Next we scale the Y valuethe X axis cosine.
Since we rotated our camera around the X axis
by 90 degrees, this value will be minus one.
So our Y distances sign will be inverted, top 
becomes bottom and bottom becomes top.

=================================================*/

    var d = {
      x: a.x * cos.z * cos.y,
      y: a.y * cos.z * cos.x,

/*================================================

Now we can scale the Z distance. It will also
change it's sign because of the X cosine.

=================================================*/

      z: a.z * cos.x * cos.y
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

  }, /* close projectToCamera function */


/*=================================================

Let's create a function to keep the player ship
on the middle of our screen.

=================================================*/

  moveCamera: function () {

    var c = draw.camera;
    
/*=================================================

We move the camera by copying our ship position, 
this way our ship will always be on the center 
of the screen while playing.

=================================================*/
    
    if (!player.actionInput.editing) {
      c.position.x = player.ship.x;
      c.position.y = player.ship.y;
    } 
      
/*=================================================

And we animate our starfield by moving our camera
to the left.

=================================================*/
      
    else {
      c.position.x += 0.05;
      world.limit(c.position);
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
    
  }, /* close dotMirrored function */

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
    
  }, /* close circleMirrored function */

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
        
    }); /* close loopXY */
    
  }, /* close lineMirrored function */

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

Last we have simple function that just clears out
all our canvas screen with the clearRect method.

=================================================*/
  
  clear: function () {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
}; /* close draw global var */

/*================================================

Next we are going to use this functions to draw a 
parallax starfield.

What are you waiting for? Go to P08-world-draw.js!

=================================================*/

