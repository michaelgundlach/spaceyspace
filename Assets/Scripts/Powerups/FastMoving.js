#pragma strict

public class FastMoving extends PowerUp {
    public var speedupPercentage : float = .5f;
    public var duration : float = 1.0f;

    function Activate() {
        var oldSpeed : float = pc.speed;
        pc.speed *= (1 + speedupPercentage);
        yield WaitForSeconds(duration);
        pc.speed = oldSpeed;
        Deactivate();
    }
}