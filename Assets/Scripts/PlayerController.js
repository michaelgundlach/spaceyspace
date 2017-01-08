#pragma strict

@HideInInspector
public var invincible : boolean = false;
private var rb : Rigidbody;
public var speed : int;
public var tilt: float;
private var boundary : Boundary;
public var smallPen : Boundary;
public var bigPen : Boundary;
public var shot : GameObject;
public var shotSpawn : Transform;
public var nextFire : float = 0.0f;
public var fireRate : float = 0.5f;
private var audioSource : AudioSource;
public var audioLaser : AudioClip;
public var audioHurt : AudioClip;
public static var startLives : int = 3;
public var maxLives : int;
@HideInInspector
public var lives : int;
public var explosion : GameObject;
private var beingPenned : boolean = false;
public var smoothing : int = 20;

private var poweredUp : boolean = false;

class Boundary {
  var xMin : float;
  var xMax : float;
  var zMin : float;
  var zMax : float;
}

public function LoseALife() : int {
  Blink();
  lives -= 1;
  if (lives == 0) {
     Instantiate(explosion, transform.position, transform.rotation);
  } else {
    audioSource.PlayOneShot(audioHurt);
  }
  return lives;
}

function OnGUI() {
  GUI.Box(new Rect(80, 50, lives * 50, 20), lives + "");
}

function SetVisible(visible : boolean) {
  for (var renderer : Renderer in transform.GetComponentsInChildren.<Renderer>()) {
    renderer.enabled = visible;
  }
}
function Blink() {
  invincible = true;
  for (var i = 0; i < 5; i++) {
	  SetVisible(false);
	  yield WaitForSeconds(.1);
	  SetVisible(true);
	  yield WaitForSeconds(.1);
  }
  invincible = false;
}

function Update() {
  if ((Input.GetButton("Fire1") || Input.GetKey(KeyCode.Z)) && Time.time > nextFire) {
    nextFire = Time.time + fireRate;
    Instantiate(shot, shotSpawn.position, shotSpawn.rotation);
    audioSource.PlayOneShot(audioLaser, .4f);
  }
}

function Start () {
  rb = GetComponent.<Rigidbody>();
  audioSource = GetComponent.<AudioSource>();
  lives = startLives;
  boundary = bigPen;
}

// Get moved backward into a smaller pen
public function PenIn() {
  beingPenned = true;
}
public function UnPenIn() {
  boundary = bigPen;
}

function FixedUpdate () {
	var moveHorizontal : float = Input.GetAxis("Horizontal");
	var moveVertical : float = Input.GetAxis("Vertical");
	if (beingPenned) {
	  if (rb.position.z <= smallPen.zMax) {
	    boundary = smallPen;
	    beingPenned = false;
	  } else {
	    moveVertical = -1;
	  }
	}
	var movement : Vector3 = Vector3(moveHorizontal, 0.0f, moveVertical);
	rb.velocity = movement * Time.deltaTime * speed;
	rb.position = Vector3(
	  Mathf.Clamp(rb.position.x, boundary.xMin, boundary.xMax),
	  0.0f,
	  Mathf.Clamp(rb.position.z, boundary.zMin, boundary.zMax)
	);
	rb.rotation = Quaternion.Euler(0.0f, 0.0f, rb.velocity.x * -tilt);
}
