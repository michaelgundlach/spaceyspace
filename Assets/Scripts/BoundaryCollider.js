#pragma strict

function OnTriggerExit(other : Collider) {
  if (other.CompareTag("missile")) {
    return;
  }

  Destroy(other.gameObject);
}