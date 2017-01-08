#pragma strict
import UnityEngine.SceneManagement;

@HideInInspector
public var player : GameObject;
public var hazards : GameObject[];
public var dropShips : GameObject[];
public var dropShipsStartAtScore : int = 100;
public var dropShipChance : float = .2;
public var spawnValues : Vector3;
public var hazardCount : int;
public var spawnWait : float;
public var waveWait : float;
private var score : int = 0;
public var scoreText : GUIText;
public var gameOverText : GUIText;
public var restartText : GUIText;
private var gameOver : boolean = false;
private var restart : boolean = false;
public var bossMusic : AudioClip;
public var winMusic : AudioClip;
public var boss : GameObject;
public var numWavesBeforeBoss : int = 2;
public var bossEntryDelay : float = 4f;

function Start () {
  UpdateScoreText();

  restartText.text = "";
  gameOverText.text = "";

  StartCoroutine(SpawnWaves());
}

function Update() {
  if (restart) {
    if (Input.GetKeyDown(KeyCode.R)) {
      SceneManager.LoadScene("Welcome");
    }
  }
}

function SpawnWaves () {
    for (var i : int = 0; i < numWavesBeforeBoss; i++) {
      if (gameOver) {
        break;
      }
      SpawnWave();
      yield WaitForSeconds(waveWait);
    }
    if (!gameOver) {
      BossEnters();
    }
}

function SpawnWave() {
    for (var i = 0; i < hazardCount; i++) {
        SpawnRandomHazard();
        yield WaitForSeconds(spawnWait);
    }
}

function SpawnRandomHazard() {
    var spawnPosition = Vector3(
      Random.Range(-spawnValues.x, spawnValues.x), spawnValues.y, spawnValues.z
    );
    var spawnRotation = Quaternion.identity;

    var go : GameObject;
    if (score >= dropShipsStartAtScore && Random.value >= (1 - dropShipChance)) { 
      go = dropShips[Random.Range(0, dropShips.Length)];
    } else {
      go = hazards[Random.Range(0, hazards.Length)];
    }
    Instantiate(go, spawnPosition, spawnRotation);
}

function BossEnters() {
  StartCoroutine(ChangeMusic(bossMusic, 2f, bossEntryDelay-1, 1f));
  yield WaitForSeconds(bossEntryDelay);
  Instantiate(boss, Vector3(0f, 0f, 18f), Quaternion.LookRotation(Vector3.forward));
}

function ChangeMusic(newMusic : AudioClip, fadeOutTime : float, pauseTime : float, fadeInTime : float) {
  var audio : AudioSource = GetComponent.<AudioSource>();
  var i : float;
  for (i = 1.0f; i >= 0; i -= .1f) {
    audio.volume =  i;
    yield WaitForSeconds(fadeOutTime / 10f);
  }
  audio.Stop();
  yield WaitForSeconds(pauseTime);
  audio.clip = newMusic;
  audio.Play();
  for (i = 0.0f; i <= 1; i += .1f) {
    audio.volume =  i;
    yield WaitForSeconds(fadeInTime / 10);
  }
  audio.volume = 1f;
}

public function Win() {
  StartCoroutine(ChangeMusic(winMusic, 0f, 2f, 0f));
  GameOver(true);
}

public function DamagePlayer() {
  if (player.GetComponent.<PlayerController>().LoseALife() == 0) {
    Destroy(player);
    GameOver(false);
  }
}

public function AddScore(amt : int) {
  score += amt;
  UpdateScoreText();
}


function UpdateScoreText() {
  scoreText.text = "Score: " + score;
}

function GameOver(win : boolean) {
  if (gameOver) { return; }

  gameOver = true;
  if (win) {
    gameOverText.text = "CONGRATULATIONS!  YOU ARE A WINNER!";
  } else {
    gameOverText.text = "GAME OVER!";
  }
  yield WaitForSeconds(2);
  restart = true;
  restartText.text = "Press 'R' to restart.";
}
