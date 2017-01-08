#pragma strict
public class JoelBossController extends MonoBehaviour {
	// Would be private but for needing to be accessed in BossStrategy classes,
	// thus public and @Hidden. The BossStrategy classes do move logic into their own
	// classes but they're a pain in the neck versus just putting all the methods
	// in JoelBossController, at which point these @HideInInspector vars could
	// become private again.
	@HideInInspector
	public var state : BossStrategy;
	@HideInInspector
	public var rb : Rigidbody;
	@HideInInspector
	public var audioSource : AudioSource;
	@HideInInspector
	public var player : GameObject;

	// public
	public var boundary : Boundary;
	public var fireCount : int = 5;
	public var fireRate : float = .5f;
	public var fireDelay : float = 1f;
	public var fireCountChange : int = 1;
	public var fireRateChange : float = .9f;
	public var shotSpawn : Transform;
	public var missile : GameObject;
	public var lives : int = 4;
	public var audioHurt : AudioClip;
  public var audioHint : AudioClip;
  public var audioDie : AudioClip;
	public var audioIntro : AudioClip;
	public var audioShoot : AudioClip;
	public var explosion : GameObject;
	public var powerup : GameObject;
	public var speed : int = 5;
	public var smoothing : int = 8;
	public var boltFireRate : float = 1;
	public var bolt : GameObject;
	public var restPosition : Vector3;
	public var enterSpeed : float = 4f;
  public var hintAfterShots : int = 20;
  private var timesShot : int = 0;

	function Start() {
		rb = GetComponent.<Rigidbody> ();
		audioSource = GetComponent.<AudioSource> ();
		player = GameObject.Find("Player");

	    state = BossStrategyEnter();
	}

	function OnTriggerEnter(other : Collider) {
    print("Entered trigger for " + other + " (name=" + other.name + "); I am " + name);
	  if (other.CompareTag("playerbolt")) {
      Destroy(other.gameObject);
      timesShot += 1;
      // bug: OnTriggerEnter called twice as often as I would expect, so timesShot
      // grows 2x as fast as it should.  Thus the '* 2' below.
      if (timesShot == hintAfterShots * 2 && state != BossStrategyDie) {
        StartCoroutine(GiveHint());
      }
	  }
	}

  function GiveHint() {
    var music : AudioSource = GameObject.FindWithTag("GameController").GetComponent.<AudioSource>();
    music.volume *= .2f;
    Time.timeScale = 0.0000001f; // not zero, so WaitForSeconds will work
    yield WaitForSeconds(.5f * Time.timeScale);
    audioSource.PlayOneShot(audioHint, 1f);
    while (audioSource.isPlaying) {
      yield WaitForSeconds(.1f * Time.timeScale);
    }
    music.volume *= 5f;
    Time.timeScale = 1f;
  }

	function OnCollisionEnter(collision : Collision) {
	  state.OnCollisionEnter(collision);
	}

	function FixedUpdate() {
	  if (state && !state.begun) {
	      state.bc = this;
	      state.begun = true;
	      StartCoroutine(state.Begin());
	  }

	  StartCoroutine(state.Behaving());

	  var pos : Vector3 = transform.position;
	  pos.x = Mathf.Clamp (pos.x, boundary.xMin, boundary.xMax);
	  transform.position = pos;
	}

}


/* Strategies ******************************************************** */

class BossStrategy {
  public var begun : boolean = false;
  public var bc : JoelBossController = null;

  public function Begin() : IEnumerator {}

  public function Behaving() : IEnumerator {}

  public function OnCollisionEnter(collision : Collision) : IEnumerator {}
}

// enter: coming onscreen to restPosition
class BossStrategyEnter extends BossStrategy {

  public function Begin() : IEnumerator {
    bc.audioSource.PlayOneShot(bc.audioIntro);
    bc.StartCoroutine(ShakeCamera());
    if (bc.player) bc.player.GetComponent.<PlayerController>().PenIn();
  }

  function ShakeCamera() {
	  var startPos = Camera.main.transform.position;
	  var shake : float = .3f;
	  var wait : float = .03f;
	  while (bc.state instanceof BossStrategyEnter) {
	    Camera.main.transform.position.x += shake;
	    yield WaitForSeconds(wait);
	    Camera.main.transform.position.x -= shake;
	    yield WaitForSeconds(wait);
	    Camera.main.transform.position.x -= shake;
	    yield WaitForSeconds(wait);
	    Camera.main.transform.position.x += shake;
	    yield WaitForSeconds(wait);
	  }
	  Camera.main.transform.position = startPos;
  }

  public function Behaving() : IEnumerator {
    bc.transform.position = Vector3.MoveTowards(
      bc.transform.position, 
      bc.restPosition, 
      bc.enterSpeed * Time.deltaTime);
    if ((bc.transform.position - bc.restPosition).magnitude < .1) {
      yield WaitForSeconds(bc.fireDelay);
      // Yielding means we'll get a bunch of Behaving() calls all setting the state.
      // Trying to fix this bug with a flag that waits for Behaving() to finish before
      // starting a new Behaving() makes things run half as fast for some reason.
      // Simplest to just check whether we've not yet changed states.
      if (bc.state instanceof BossStrategyEnter) {
        bc.state = BossStrategyFight();
      }
    }
  }
}

// fighting: following player and shooting bolts
class BossStrategyFight extends BossStrategy {

  public function Begin() : IEnumerator {
    if (bc.player) bc.player.GetComponent.<PlayerController>().UnPenIn();
 	while (bc.player && bc.state instanceof BossStrategyFight) {
	  bc.Instantiate(bc.bolt, bc.shotSpawn.position, bc.shotSpawn.rotation);
	  bc.audioSource.PlayOneShot(bc.audioShoot, .4f);
	  yield WaitForSeconds(bc.boltFireRate);
	}
  }

  public function Behaving() : IEnumerator {
    if (!bc.player) return;

    var toPlayer : Vector3 = bc.player.transform.position - bc.shotSpawn.position;
    var dirToMove : int = Mathf.Sign(toPlayer.x);

    bc.rb.velocity = Vector3(
      Mathf.Lerp(bc.rb.velocity.x, dirToMove * bc.speed, bc.smoothing * Time.deltaTime),
      0f,
      0f);
  }

  function OnCollisionEnter(collision : Collision) : IEnumerator {
    bc.lives -= 1;
    if (bc.lives <= 0) {
      bc.state = BossStrategyDie();
    }
    else {
      bc.fireCount += bc.fireCountChange;
      bc.fireRate *= bc.fireRateChange;
      var newState : BossStrategySpin = BossStrategySpin();
      newState.forceAtPoint = collision.contacts[0].point;
      bc.state = newState;
    }
  }
}


// spinning: struck by player, shooting missiles
class BossStrategySpin extends BossStrategy {
  public var forceAtPoint : Vector3;

  public function Begin() : IEnumerator {
    bc.audioSource.PlayOneShot(bc.audioHurt);
    if (bc.player) bc.player.GetComponent.<PlayerController>().PenIn();

	var force : int = 100;
	// make sure we spin extra hard around X to spread out missiles.
	// The other axes are just to look cool.
	var xSpin = Random.Range(80, 150) * Mathf.Sign(Random.value - .5);
	bc.rb.AddForceAtPosition (Vector3 (
		xSpin,
		Random.Range (-force, force),
		Random.Range (-force, force)
		), 
		forceAtPoint);

	bc.StartCoroutine(ShootMissiles(bc.fireCount, bc.fireRate, bc.fireDelay));
  }

  function ShootMissiles(count : int, rate : float, delay : float) {
    yield WaitForSeconds(delay);
	for (var i : int = 0; i < count; i++) {
	  // Find the direction shotSpawn is pointing, in world space
	  var currFwdVec : Vector3 = bc.shotSpawn.forward;
	  // Remove y component so it's pointing in whatever x/z dirs it was, but not
	  // up or down
	  currFwdVec.y = 0f;
	  // Extend to standard length
	  var rot = currFwdVec.normalized * 20;
	  bc.Instantiate(bc.missile, bc.shotSpawn.position, Quaternion.LookRotation(rot));
	  bc.audioSource.PlayOneShot(bc.audioShoot, .4f);
	  if (bc.player) bc.missile.GetComponent.<MissileMover>().target = bc.player.transform;
	  if (i != count - 1) {
	    yield WaitForSeconds(rate);
	  }
	}
	if (bc.player && bc.lives <= 2) {
		bc.Instantiate(bc.powerup, bc.shotSpawn.position,
		    Quaternion.LookRotation(bc.shotSpawn.position - bc.player.transform.position));
	}
	bc.state = BossStrategyRecover();
  }

}


// recovering: moving back to restPosition
class BossStrategyRecover extends BossStrategy {
  
  public function Begin() : IEnumerator {
	bc.rb.velocity = Vector3.zero;
  }

  public function Behaving() : IEnumerator {
    var rb : Rigidbody = bc.rb;
    var targetPosition : Vector3 = bc.restPosition;
    var desiredVelocity = (targetPosition - rb.position).normalized * 100;
    var desiredRotation = Quaternion.identity;

	rb.angularVelocity = Vector3.zero;
    rb.velocity = Vector3.MoveTowards(rb.velocity, desiredVelocity, 5 * Time.deltaTime);
    rb.rotation = Quaternion.Slerp(rb.rotation, Quaternion.identity, 5 * Time.deltaTime);

    if ((rb.position - targetPosition).magnitude < .2) {
      bc.transform.position = targetPosition;
      bc.transform.rotation = desiredRotation;
      rb.velocity = Vector3.zero;
      bc.state = BossStrategyFight();
    }
  }
}


// die: spinning until it explodes
class BossStrategyDie extends BossStrategy {
  
  public function Begin() : IEnumerator {
    if (bc.player) bc.player.GetComponent.<PlayerController>().PenIn();
    bc.rb.maxAngularVelocity = 30;
    bc.audioSource.PlayOneShot(bc.audioDie);
    yield WaitForSeconds(3.5);
    bc.Instantiate(bc.explosion, bc.transform.position, bc.transform.rotation);
    bc.Destroy(bc.gameObject);
    GameObject.Find("Game Controller").GetComponent.<GameController>().Win();
  }

  public function Behaving() : IEnumerator {
    bc.rb.AddTorque(bc.transform.up * 5 * Time.deltaTime, ForceMode.VelocityChange);
    bc.rb.AddTorque(bc.transform.right * 10 * Time.deltaTime, ForceMode.VelocityChange);
  }
}
