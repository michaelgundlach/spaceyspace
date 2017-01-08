#pragma strict

public class FastFire extends PowerUp {
	public var duration : float = 1.0;
	public var newFireRate : float = 0.15;

	function Activate() {
	    var oldRate = pc.fireRate;
	    pc.fireRate = newFireRate;
	    yield WaitForSeconds(duration);
	    pc.fireRate = oldRate;
	    Deactivate();
	}
}