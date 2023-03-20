/*=================================================

PART 9: Drawing the player ship

In this lesson we are just going to draw our ships.

=================================================*/

var playerDraw = {

/*================================================

So let's start drawing one ship. It'll have a diamond 
shape, one triangle for the front and one for
the back. Let's give those triangle points
some names:

          . p1
         .:.
        . : .
       .  :  .
      .   :   .
     .    :    .
 p2 ......x...... p3
      .   :   .
        . : .
          . p4
                  
That's a pretty ship right? If you think you
can do better go on and edit this function!

=================================================*/

  ship: function(p) {

    var s = p.ship;

/*=================================================

Let's create a custom color for our ship based on
the customization values. 

=================================================*/
    
    var color = draw.color(p);
    
/*================================================
                  
First lets calculate our rotation projections for
points p1 and p4, they will be translated 
vertically in relation to our ship position.

=================================================*/

    var vertical = {
      x: (s.h / 2) * Math.sin(s.a),
      y: (s.h / 2) * Math.cos(s.a)
    };

/*================================================
                  
Now lets calculate our projections for points 
p2 and p3, they will be translated 
horizontally in relation to our ship.

=================================================*/

    var horizontal = {
      x: (s.w / 2) * Math.sin(s.a+(Math.PI/2)),
      y: (s.w / 2) * Math.cos(s.a+(Math.PI/2))
    };

/*================================================
                  
In order to change the ship dimension with the
player customization, we will calcutate some
bonus dimensions. 

We will start with add a minimum value and add
the bonus values. Since the bonus value is too
big, from 0 to 100, we will scale it down with
a division. 

=================================================*/

    var attackBonus = 1.2 + (p.attack/100);
    var speedBonus = 0.1 + (p.speed/150);

/*================================================
                  
We will invert the logic for the control bonus value 
with a subtraction because we want small fast ships
and large slow ships.

=================================================*/

    var controlBonus = 1.2 - (p.control/200);

/*================================================
                  
Now we have everything we need to calculate all 
of our four ship points. First let's do the 
vertical points p1 and p4.

=================================================*/

    var p1 = {
      x: s.x + (attackBonus * vertical.x),
      y: s.y + (attackBonus * vertical.y)
    };
    
    var p4 = {
      x: s.x - (speedBonus * vertical.x),
      y: s.y - (speedBonus * vertical.y)
    };

/*================================================
                  
Now we calculate our horizontal points p2 and p3.

=================================================*/

    var p2 = {
      x: s.x + (controlBonus * horizontal.x),
      y: s.y + (controlBonus * horizontal.y)
    };
    var p3 = {
      x: s.x - (controlBonus * horizontal.x),
      y: s.y - (controlBonus * horizontal.y)
    };

/*================================================
                  
And last we can draw all our ship lines.

=================================================*/

    var width = 2;
    
    draw.lineMirrored(color, p1, p2, width);
    draw.lineMirrored(color, p1, p3, width);
    draw.lineMirrored(color, p4, p2, width);
    draw.lineMirrored(color, p4, p3, width);
    
/*================================================

Now let's draw our bullets. We just need to loop
and use our draw mirrored circle function.

=================================================*/

    loop(p.bullets, function(bullet) {
      draw.circleMirrored(color, bullet);
    });
    
  }, /* close playerDraw.ship function */

  
/*=================================================

Now all we have to create a function to draw all
players ships. We just need to loop over our 
players list and call the draw ship function.

=================================================*/

  allShips: function(playerList) {
    
    loop(game.playerList, function (p) {
      
/*=================================================

If another player is in edit mode we don't wanna 
draw their ship as well.

=================================================*/
        
      if (!p.actionInput.editing) playerDraw.ship(p);

    }) /* close game.playerList loop */

  } /* close playerDraw.allShips function */
  
}; /* close playerDraw global var */

/*=================================================

Next lesson "P10-game-loop.js" is the last one.
Keep going, you are almost there!

=================================================*/

