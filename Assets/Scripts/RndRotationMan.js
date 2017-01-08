#pragma strict

public var tumble : int;
public var fullSpeed : boolean = false;

function Start () {
	var rb : Rigidbody = GetComponent.<Rigidbody>();

	if (fullSpeed) {
	  rb.angularVelocity = Random.onUnitSphere * tumble;
	} else {
	  rb.angularVelocity = Random.insideUnitSphere * tumble;
	}
}