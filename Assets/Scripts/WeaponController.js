#pragma strict

public var shot : GameObject;
public var shotSpawn : Transform;
public var fireRate : float;
public var delay : float;

function Start () {
	InvokeRepeating("Fire", delay, fireRate);
}

function Fire () {
    Instantiate(shot, shotSpawn.position, shotSpawn.rotation);
}