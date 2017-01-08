#pragma strict

public var scrollSpeed : float;
public var tileSizeZ : float;
private var startPosition : Vector3;

function Start () {
	startPosition = transform.position;
}

function FixedUpdate () {
    var newPosition : float = Mathf.Repeat(Time.time * scrollSpeed, tileSizeZ);
	transform.position = startPosition + Vector3.forward * newPosition;
}
