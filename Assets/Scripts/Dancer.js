#pragma strict

public enum PeriodType { Sine, Triangle, Square};
public enum ThingToChange { Rotation, Scale, Position };
public var thingToChange : ThingToChange;
public var delta : Vector3;
public var period : float = 1f;
public var periodType : PeriodType;
public var periodOffset : float = 0f;

private var initialRotation : Vector3;
private var initialScale : Vector3;
private var initialPosition : Vector3;

function Start() {
  initialRotation = transform.eulerAngles;
  initialScale = transform.localScale;
  initialPosition = transform.position;
}

function FixedUpdate () {
  var startPos;
  var endPos;
  var pos0to1 = pos0to1(periodType, period, Time.time + periodOffset);

  switch (thingToChange) {
    case ThingToChange.Rotation:
      startPos = Quaternion.Euler(delta) * Quaternion.Euler(initialRotation);
      endPos = Quaternion.Euler(delta * -1) * Quaternion.Euler(initialRotation);
      transform.rotation = Quaternion.Slerp(startPos, endPos, pos0to1);
      break;
    case ThingToChange.Scale:
      startPos = Vector3.Scale(initialScale, Vector3.one + delta);
      endPos = Vector3.Scale(initialScale, Vector3.one - delta);
      transform.localScale = Vector3.Lerp(startPos, endPos, pos0to1);
      break;
    case ThingToChange.Position:
      startPos = initialPosition + delta;
      endPos = initialPosition - delta;
      transform.position = Vector3.Lerp(startPos, endPos, pos0to1);
      break;
  }
}


// returns f(x), where f is a square/triangle/sine wave of the given period.
// eg sine(2, 4) == 0
// eg triangle(4, 3.5) = .25
// eg square(5, 3.14) == 1
function pos0to1(type : PeriodType, period : float, x : float) {
  if (type == PeriodType.Square) {
    return square(period, x);
  }
  if (type == PeriodType.Triangle) {
    return triangle(period, x);
  }
  if (type == PeriodType.Sine) {
    return sine(period, x);
  }
  return 0f;
}

function square(period : float, x : float) {
 var half_period : float = period / 2f;
 if (x % period < half_period) {
    return 0;
  } else {
    return 1;
  }
}

function triangle(period : float, x : float) {
  var half_period : float = period / 2f;
  var pos_in_period = (x % period) / period;
  if (pos_in_period < .5) {
    return 2 * pos_in_period; // map [0,0.5] -> [0,1]
  } else {
    return -2 * pos_in_period + 2; // map [0.5, 1] -> [1, 0]
  }
}

function sine(period : float, x: float) {
  var pos_in_period = (x % period) / period;
  return (Mathf.Sin(2*Mathf.PI * pos_in_period) + 1) / 2; // map [-1,1] -> [0,1]
}