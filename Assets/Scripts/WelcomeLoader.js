#pragma strict

public static var difficulty = 1;

function Update () {
	if (Input.GetKeyDown("1")) {
	  PlayerController.startLives = 100;
	  SceneManager.LoadScene("Main");
	}
	if (Input.GetKeyDown("2")) {
	  PlayerController.startLives = 3;
	  SceneManager.LoadScene("Main");
	}
}
