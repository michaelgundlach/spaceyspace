#pragma strict

function OnTriggerEnter(player : Collider) {
  if (!player.CompareTag("Player")) return;

  var puGameObject = transform.Find("PowerUp");
  var puScript : PowerUp = puGameObject.GetComponent.<PowerUp>();

  for (var script : PowerUp in player.GetComponentsInChildren.<PowerUp>()) {
    if (typeof(script) == typeof(puScript)) {
      print("Already powered up with " + typeof(puScript));
      var rndVec : Vector3 = Random.onUnitSphere * 3;
      rndVec.z = Mathf.Abs(rndVec.z);
      rndVec.y = 0f;
      GetComponent.<Rigidbody>().velocity = rndVec;
      return;
    }
  }
  // Powerup notices its parent change in an event handler, rather than
  // us calling Activate or TurnOn or something.  This is because if
  // Activate is a coroutine, the Destroy() below will stop the
  // coroutine from finishing.  I think this means coroutines are owned
  // by the script that started them, not by the class they're on, and
  // when you destroy the script that started them they are destroyed.
  transform.Find("PowerUp").parent = player.transform;
  Destroy(gameObject);
}