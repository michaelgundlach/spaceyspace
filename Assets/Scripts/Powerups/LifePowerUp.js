#pragma strict

public class LifePowerUp extends PowerUp {
  function Activate() {
    if (pc.lives < pc.maxLives) {
      pc.lives += 1;
    }
    // TODO bug: we have to wait for our audio to play before destroying ourselves.
    // which means you can't get a second instantaneous powerup while the first
    // one's audio is still playing.  audio should be played by the Player game object,
    // or maybe all sounds could be played by a static helper audio source.  Or we
    // could instantiate a game object just to play the audio source for a powerup.
    yield WaitForSeconds(1); // time for audio to play before Deactivate.
    Deactivate();
  }
}