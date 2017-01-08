#pragma strict

public var speed : int = 7;
public var rotationDegreesSpeed : float = 120f;
private var rb : Rigidbody;
public var target : Transform;
private var triggered : boolean = false;
// when do we start counting down lifetime?
public var triggerDistance : float = 8f;
// how long till we fizz out
public var lifetime : float = 5f;
public var audioFire : AudioSource;
public var audioHiss : AudioSource;

function Start () {
	rb = GetComponent.<Rigidbody>();
	rb.position.y = 0f;
	rb.velocity = Vector3(0f, 0f, speed);
}

function FixedUpdate () {
	if (!target) { // destroyed
	    return;
	}
	// turn the missile toward the target some.
	var towardTarget = target.position - transform.position;
	audioHiss.volume = Mathf.Lerp(0.05, 1, 1 - towardTarget.magnitude / triggerDistance * 1.2);
	
	if (towardTarget.magnitude < triggerDistance && !triggered) {
	  triggered = true;
	  audioHiss.Play();
	  Destroy(gameObject, lifetime); // start a timer
	}
	rb.rotation = Quaternion.RotateTowards(
	  rb.rotation, 
	  Quaternion.LookRotation(towardTarget), 
	  rotationDegreesSpeed * Time.deltaTime);
	rb.velocity = rb.transform.forward.normalized * speed;
}
