/*=================================================

PART 10: Sound effects

In this lesson we are going to make the audio
effects of our game. Check more about web audio
API in this link:
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API

=================================================*/

var audio = {
  start: function () {
    
/*=================================================

If there's no audio context we need to ceate it.

=================================================*/    
    
    if (!audio.ctx) {
      audio.ctx = new AudioContext();

/*=================================================

We save the current audio timestamp in seconds.
https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/currentTime

=================================================*/  

      var now = audio.ctx.currentTime;
      
/*=================================================

We need a gain node to control de volume.
https://developer.mozilla.org/en-US/docs/Web/API/GainNode

=================================================*/    
    
      audio.volume = new GainNode(audio.ctx);
      audio.volume.connect(audio.ctx.destination);
      audio.volume.gain.setValueAtTime(0.2, now);

/*=================================================

We will use an oscillator to make all our audio.
https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode

=================================================*/ 
      
      audio.oscillator = audio.ctx.createOscillator();
      audio.oscillator.type = 'sine';
      var frequency = audio.oscillator.frequency;
      frequency.setValueAtTime(0, now);

/*=================================================

The oscillator node needs to be connected to the 
gain node if we want to control it's volume.

=================================================*/ 
      
      audio.oscillator.connect(audio.volume);
      audio.oscillator.start();
      
    } /* close audio.start function */
  },

/*=================================================

Now we can create a quick low volume beeb sound to
be played whenever the player shoots.

=================================================*/    

  shoot: function () {
    var now = audio.ctx.currentTime;
    audio.volume.gain.setValueAtTime(0.1, now);
    var frequency = audio.oscillator.frequency;
    frequency.setValueAtTime(800, now);
    frequency.setValueAtTime(0, now+0.1);
  },
  
/*=================================================

Now we do the same but let's use two frequencies 
for when the asteroids get hit and make the sound
just a little bit lowder. 

=================================================*/    
  
  hit: function () {
    var now = audio.ctx.currentTime;
    audio.volume.gain.setValueAtTime(0.2, now);
    var frequency = audio.oscillator.frequency;
    frequency.setValueAtTime(400, now);
    frequency.setValueAtTime(600, now+0.1);
    frequency.setValueAtTime(0, now+0.2);
  },

/*=================================================

Let's go crazy with our game start sound!

=================================================*/    
  
  toggle: function () {
    var now = audio.ctx.currentTime;
    audio.volume.gain.setValueAtTime(0.1, now);
    var frequency = audio.oscillator.frequency;
    frequency.setValueAtTime(1500, now);
    frequency.setValueAtTime(1000, now+0.1);
    frequency.setValueAtTime(200, now+0.2);
    frequency.setValueAtTime(500, now+0.3);
    frequency.setValueAtTime(0, now+0.5);
  }
  
}; /* close audio global var */

/*=================================================

And let's attach our start functions to the player
input. We want to follow audio best practices and
avoid being blocking policies.
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices

=================================================*/  

addEventListener('mousedown', audio.start);
addEventListener('keydown', audio.start);

/*=================================================

That's all! Next lesson "P11-game-loop.js" is the 
last one. Keep going, you are almost there!

=================================================*/