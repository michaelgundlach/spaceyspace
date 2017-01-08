#pragma strict

public class PowerUp extends MonoBehaviour {
	protected var pc : PlayerController = null;

	function Activate() : IEnumerator{ }

	function OnTransformParentChanged() {
	    pc = transform.parent.GetComponent.<PlayerController>();
	    if (!pc) return;

	    var audio : AudioSource = GetComponent.<AudioSource>();
	    if (audio) {
	        audio.Play();
	    }
	    
	    StartCoroutine(Activate());
	}

	function Deactivate() {
	    Destroy(gameObject);
	}
}
