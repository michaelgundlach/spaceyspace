#pragma strict

public var startWait : Vector2;
public var maneuverTime : Vector2;
public var maneuverWait : Vector2;
public var dodgeSpeed: Vector2;
public var tilt : float;
public var boundary : Boundary;
public var smoothing : float;

private var targetManeuver : float;
private var rb : Rigidbody;

function Start() {
  rb = GetComponent.<Rigidbody>();
  StartCoroutine(Evade());
}

function Evade() {
  yield WaitForSeconds(Random.Range(startWait.x, startWait.y));
  while (true) {
      targetManeuver = Random.Range(dodgeSpeed.x, dodgeSpeed.y) * -Mathf.Sign(transform.position.x);
      yield WaitForSeconds(Random.Range(maneuverTime.x, maneuverTime.y));
      targetManeuver = 0;
      yield WaitForSeconds(Random.Range(maneuverWait.x, maneuverWait.y));
  }
}

function FixedUpdate () {
    var newManeuver = Mathf.MoveTowards(rb.velocity.x, targetManeuver, smoothing * Time.deltaTime);
    rb.velocity.x = newManeuver;
    // Don't fall off the board
	transform.position = Vector3(
	    Mathf.Clamp(transform.position.x, boundary.xMin, boundary.xMax),
	    0.0f,
	    Mathf.Clamp(transform.position.z, boundary.zMin, boundary.zMax)
	);
	transform.rotation = Quaternion.Euler(
	    0,
	    0, 
	    rb.velocity.x * -tilt
	);
}
