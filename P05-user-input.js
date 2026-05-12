/*================================================

PART 05: Mouse, touch and keyboard input

To make our user interface work we will create 
three methods. Two of them will let the user
enter and leave the UI. The last one will
allow him to customize his ship.

As before we will define it as a global variable
to make it accessible to our other client files.

=================================================*/

var ui = {
  
/*================================================

First lets get all our user interface DOM elements, 
so we can control them with JS.

Read mode about the DOM here: 
https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction

=================================================*/
 
  start: function () {

/*================================================

We need to select the shi menu and the inGame menu.

Let's get them with the "querySelector" method.
https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector

=================================================*/ 
   
    ui.menus = {
      shipMenu: document.querySelector('.shipMenu'),
      inGameMenu: document.querySelector('.inGameMenu')
    }
    
/*================================================

We also need to select all sliders and buttons.
To avoid doing it one by one let's use some arrays.

=================================================*/
    
    ui.sliders = {};
    
    loop(['attack','speed','control'], function (n) {
      ui.sliders[n] = document.querySelector('input[name='+n+']')
    });

/*================================================

We do the same for our mobile controls.

=================================================*/
    
    ui.mobileControls = {};
     
    loop(['up','left','right','shoot'], function (n) {
      ui.mobileControls[n] = document.querySelector('button[name='+n+']')
    });

/*================================================

And we also need to save our menu toggle buttons.

=================================================*/
    
    ui.toggleButtons = {};
    
    loop(['play','edit'], function (n) {
      ui.toggleButtons[n] = document.querySelector('button[name='+n+']')
    });
   
/*================================================

Now let's start listening to the user inputs.

For each slider we are going to listen to
three events: "change", "mousemove", "keyup".

All of them will trigger the "ui.customize" function
we just created.

We have two nested loops here, they will apply 
all events to all sliders.

=================================================*/

    var sliderEvents = ['change','mousemove','keyup'];
    
    loop(ui.sliders, function (slider) {
      loop(sliderEvents, function (event) {
        slider.addEventListener(event, ui.customize);
      });
    });
   
/*================================================

Then we attach the "ui.toggle" method to the our
play button. It will be triggered when clicked
and will allow the player to leave the user
interface and start playing.

=================================================*/

    ui.toggleButtons.play.addEventListener('click', function () {
      ui.toggle(false);
    });

/*================================================

Next we attach the "toggle" method to the our
Edit button. It will allow the player to get
back to the ui.

=================================================*/

    ui.toggleButtons.edit.addEventListener('click', function () {
      ui.toggle(true);
    });

/*================================================

Now we attach mouse events to each one of our 
control buttons.

=================================================*/
    
    loop(ui.mobileControls, function (control) {
      
      var press = function (event) {
        player.actionInput[event.target.name] = true;
      };
      
      control.addEventListener('mousedown', press);

      var release = function (event) {
        player.actionInput[event.target.name] = false;
      };
      
      control.addEventListener('mouseup', release);
      control.addEventListener('mouseleave', release);
     
    }); /* close ui.mobileControls loop */

/*================================================

Since touch input can have multiple targets at the
same time, we need to loop over all targets.

=================================================*/
    
    const touchEvent = function (event) {

/*================================================

First we consider none of them are being touched.

=================================================*/
      
      loop(ui.mobileControls, function (control) {
        player.actionInput[control.name] = false;
      });

/*================================================

Then we check what elements are being touched.
https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint

=================================================*/
      
      loop(event.touches, function (touch) {
        
        var touched = document.elementFromPoint(touch.clientX, touch.clientY);
        
/*================================================

We only turn on the touched elements that we can 
find in the mobile controls list.
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/in

=================================================*/
        
        if (touched.name in ui.mobileControls) {
          player.actionInput[touched.name] = true;
        }
        
      }); /* close event.touches loop */
      
    }; /* close touch event */
    
    addEventListener('touchstart', touchEvent);
    addEventListener('touchmove', touchEvent);
    addEventListener('touchend', touchEvent);
    addEventListener('touchcancel', touchEvent);

/*================================================

Let's use our library to handle gamepad inputs
https://github.com/alvaromontoro/gamecontroller.js

=================================================*/   
    
    gameControl.on('connect', function(gp) {
      for (let x = 0; x < Math.min(17, gp.buttons); x++) {

/*================================================

Before event runs only once when the button is pressed.

=================================================*/ 
        
        gp.before('button' + x, function() {

/*================================================

Gamepad up and down will change the menu focus
while customizing the ship.

=================================================*/ 
          
          if (player.actionInput.editing) {
            
            const focusable = document.querySelectorAll('.shipMenu [name]');
            const index = Array.prototype.indexOf.call(focusable, document.activeElement);
            
/*================================================

If no element is focused let's just use the first one.

=================================================*/ 
            
            let next = focusable[0];

/*================================================

If some element is focused we can select the next one
or click if it's a button.

=================================================*/ 
            
            if (index >= 0){
              if (x == 12) next = focusable[index - 1];
              if (x == 13) next = focusable[index + 1];
              if (x == 0 || x == 2 || x ==  5) document.activeElement.click();
            }
            if (x == 12 || x == 13) next.focus();
            
          } /* close if player is editing condition */
          
/*================================================

If game is ready, start button toggle ship edit.

=================================================*/ 

          if ((x == 8 || x == 9) && game.ready) ui.toggle(!player.actionInput.editing);
          
        }); /* close gp before button press function */
        

        gp.on('button' + x, function() {
          
/*================================================

Gamepad left and right will change the element 
customation value.

=================================================*/ 
          
          if (player.actionInput.editing) {
            if (x == 14) document.activeElement.value = Number(document.activeElement.value) - 1;
            if (x == 15) document.activeElement.value = Number(document.activeElement.value) + 1;
            if (x == 14 || x == 15) ui.customize({target: document.activeElement});
          }
          
/*================================================

Gamepad buttons to control the ship in game.

=================================================*/ 
        
          if (!player.actionInput.editing) {
            if (x == 4 || x == 12) player.actionInput['up'] = true;
            if (x == 14) player.actionInput['left'] = true;
            if (x == 15) player.actionInput['right'] = true;
            if (x == 0 || x == 2 || x == 5 ) player.actionInput['shoot'] = true;
          }
        }); /* close gp on button function */
        
        gp.after('button' + x, function() {
          if (!player.actionInput.editing) {
            if (x == 4 || x == 12) player.actionInput['up'] = false;
            if (x == 14) player.actionInput['left'] = false;
            if (x == 15) player.actionInput['right'] = false;
            if (x == 0 || x == 2 || x == 5 ) player.actionInput['shoot'] = false;
          }
        });
        
      } /* close for all buttons loop */

/*================================================

Lastly let's add directional axis control.

=================================================*/
      
      for (let x = 0; x < Math.min(2, gp.axes); x++) {
        const directions = ['up', 'right', 'left'];
        for (let d = 0; d < directions.length; d++) {
          gp.on(directions[d] + x, function() {
            if (!player.actionInput.editing) player.actionInput[directions[d]] = true;
          });
          gp.after(directions[d] + x, function() {
            if (!player.actionInput.editing) player.actionInput[directions[d]] = false;
          });
        }
      }
    }); /* close gameControl function */
    
  }, /* close ui.start function */
   
/*================================================

Now let's create a way for our user to leave 
the edit screen and start playing.

=================================================*/

  toggle: function (state) {
    
    player.actionInput.editing = state;

/*================================================

We need toggle the menus visibility.

=================================================*/
    
    ui.menus.shipMenu.classList.toggle('hidden', !state);
    ui.menus.inGameMenu.classList.toggle('hidden', state); 

/*================================================

Stop the ship movement.

=================================================*/   

    player.ship.v = 0;

/*================================================

And lastly we add some audio to our button!

=================================================*/    

    if (audio.ctx) audio.toggle();
    
  }, /* close ui.toggle function */

/*================================================

That was easy! Now let's create the method that 
will allow the ship customization.

=================================================*/

  customize: function (event) {

/*================================================

First let's store the currently targeted slider.
Read more about the events here:
https://developer.mozilla.org/en-US/docs/Web/API/Event

=================================================*/

    var targetSlider = event.target;

/*================================================

Now let's list all our current bonus values.

=================================================*/

    var bonus = {};
   
    loop(ui.sliders, function (slider) {
      bonus[slider.name] = Number(slider.value);
    });

/*================================================

The total sum of bonus points is 150, that's 3 times
our default input value (50). Let's sum up all user
customization bonus and check if the player has any
extra points.

=================================================*/

    var sum = bonus.attack + bonus.speed + bonus.control;
    var extraPoints = (sum - 150);

/*================================================

For each slider that is not the one being 
targeted we are going to subtract those extra
points. But since we have two extra sliders to 
edit, we are going to divide this value by two.

=================================================*/
    
    loop(ui.sliders, function (slider) {
      
      if (targetSlider !== slider) {
        bonus[slider.name] -= (extraPoints/2);

/*================================================

Then we assign the new value in order to move the
slider with the new bonus value.

=================================================*/  
        
        slider.value = bonus[slider.name];
        
      } /* close if targetSlider condition */
      
    }); /* close ui.sliders loop */

/*================================================

Now let's replace this bonus values to our player
object using the Object.assign. The pratical 
effect is the same as: 

  player.attack  = bonus.attack;
  player.speed   = bonus.speed;
  player.control = bonus.control;

But with the advantage of doing it in a single line
Read more about the assign method here:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

=================================================*/

    Object.assign(player, bonus);

  } /* close ui.customize function */

}; /* close ui global var */

/*================================================

Let's create the functions that will be triggered
when the user presses a keyboard button.

But first we need to make a list of our valid keys
that we are going to allow. Here's good resource 
about keyboard events for you to dig in:
https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent

=================================================*/

var keyboard = {

  validPressKeys: {
    'ArrowUp'   : 'up',
    'KeyW'      : 'up',
    'KeyM'      : 'up',
    'ArrowLeft' : 'left',
    'KeyA'      : 'left',
    'Comma'     : 'left',
    'ArrowRight': 'right',
    'KeyD'      : 'right',
    'Period'    : 'right',
    'Space'     : 'shoot',
    'KeyS'      : 'shoot',
    'Slash'     : 'shoot'
  },

/*================================================

Now let's start our keyboard event listeners.

=================================================*/

  start: function () {

/*================================================

When a user presses a key we check if it's listed
in our valid press keys list.

=================================================*/

    addEventListener('keydown', function(event) {
      var key = event.code;
      
      var pressAction = keyboard.validPressKeys[key];

/*================================================

If it is a valid press key, we set it's' 
pressedKeys value to true.

=================================================*/
      
      if (pressAction) {
        
        player.actionInput[pressAction] = true;

      }  /* close if pressAction condition */

/*================================================

If the user presses E or escape we toggle the UI.

=================================================*/
      
      if (key == 'KeyE' || key == 'KeyP') {
        ui.toggle(!player.actionInput.editing);
      }

    });  /* close keydown event listener */

/*================================================

Now we will do the same thing with the "keyup"
event, but our state will now be false;

=================================================*/

    addEventListener('keyup', function(event) {
      
      var key = event.code;
      var pressAction = keyboard.validPressKeys[key];
      
      if (pressAction) {
        player.actionInput[pressAction] = false;
      }
      
    });/* close keyup event listener */

  } /* close keyboard.start function */

}; /* close keyboard global var */

/*================================================

And that's all for our user inputs. Let's 
start drawing on lesson "P06-canvas-draw.js"

=================================================*/


