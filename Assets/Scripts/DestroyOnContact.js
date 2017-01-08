#pragma strict

public var explosion : GameObject;
private var gameController : GameController;
public var scoreValue : int;

function Start() {
  var gameControllerObject = GameObject.FindWithTag("GameController");
  if (gameControllerObject) {
    gameController = gameControllerObject.GetComponent.<GameController>();
  }
}
function OnTriggerEnter(other : Collider) {
    if (other.CompareTag("boundary") || other.CompareTag("enemy") || other.CompareTag("powerup")) {
      return;
    }

    if (other.CompareTag("Player") && other.GetComponent.<PlayerController>().invincible) {
      return;
    }

    if (other.CompareTag("enemy") && gameObject.CompareTag("missile")) {
      return;
    }

    if (other.CompareTag("missile") && other.CompareTag("enemy")) {
      return;
    }

    if (other.CompareTag("Player")) {
      gameController.DamagePlayer();
    }
    else {
      Destroy(other.gameObject);
    }

    if (explosion) {
        Instantiate(explosion, transform.position, transform.rotation);
    }

    gameController.AddScore(scoreValue);
    Destroy(gameObject);
   
}