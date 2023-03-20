/*================================================

PART 6: Keyboard input

Let's create the functions that will be triggered
when the user presses a keyboard button.

But first we need to make a list of our valid keys
that we are going to allow. Here's good resource 
about keyboarb events for you to dig in:
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

Now let's start our event listeners.

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

/*================================================

And now send the event to our peers with the key 
state set to true.

=================================================*/

       // network.broadcast({ input: player.actionInput });

      }  /* close if pressAction */

/*================================================

If the user presses E or escape we toggle the UI.

=================================================*/
      
      if (key == 'KeyE' || key == 'KeyP') {
        ui.toggle(!player.actionInput.editing);
      }

    });  /* close addEventListener keydown */

/*================================================

Now we will do the same thing with the "keyup"
event, but our state will now be false;

=================================================*/

    addEventListener('keyup', function(event) {
      
      var key = event.code;
      var pressAction = keyboard.validPressKeys[key];
      
      if (pressAction) {
        player.actionInput[pressAction] = false;
       // network.broadcast({ input: player.actionInput });
      }
      
    });/* close addEventListener keyup */

  } /* close start function */

}; /* close keyboard global var */

/*================================================

=================================================*/

keyboard.start();

/*================================================

And that's all for our keyboard inputs.
Let's build our mouse interactions in our next 
lesson "p11-client-mouse"

=================================================*/

