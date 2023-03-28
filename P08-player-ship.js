/*=================================================

PART 08: Drawing the ship

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
    var speedBonus = 0.2 + (p.speed/150);

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

To add some engine fire effect we can draw some 
extra lines on the ship back.

=================================================*/

    if (p.actionInput.up) {
      fire = 1.5 * speedBonus + (speedBonus * Math.random());
    
    var pfire = {
      x: s.x - (fire * vertical.x),
      y: s.y - (fire * vertical.y)
    }
    
    draw.lineMirrored('#fff5', p2, pfire, width);
    draw.lineMirrored('#fff5', p3, pfire, width);
      
    }
    
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

  allShips: function() {
    
    loop(network.list, function (p) {
      
/*=================================================

If another player is in edit mode we don't wanna 
draw their ship as well.

=================================================*/
        
      if (!p.actionInput.editing) {
        playerDraw.ship(p);
      }

    }) /* close network.list loop */

/*=================================================

We can't forget to draw our own ship.

=================================================*/
    
    if (!player.actionInput.editing) {
      playerDraw.ship(player);
    }
    
  } /* close playerDraw.allShips function */
  
}; /* close playerDraw global var */

/*=================================================

Now let's make the high scores list, first we 
select out list.

=================================================*/

var highScores = {

  list: document.querySelector('.highScores'),
  
/*=================================================

The update function will sort all the players by 
score then loop over the player list to fill in the 
label's text content.

=================================================*/
  
  update: function () {

    var allPlayers = [player, ...Object.values(network.list)];
    allPlayers.sort(function (a, b) { return b.score - a.score });

    loop(highScores.list.children, function(item, index){
      if (allPlayers[index]) {
        var p = allPlayers[index];
        var score = p.score;
        item.textContent = 'Player'+(index + 1)+': '+score;
        item.style.color = draw.color(p);
      }
    });
  }
  
};

/*=================================================

Next lesson is "P09-audio-oscillator.js". 
Let's make some noise!!!

=================================================*/


