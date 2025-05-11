class Camera {
  constructor() {
    this.fov = 60;
    this.eye = new Vector3([0, 0, 0]);
    this.at = new Vector3([0, 0, -1]);
    this.up = new Vector3([0, 1, 0]);
    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();
    this.pitch = 0;
    this.MAX_PITCH = 89;
    this.MIN_PITCH = -89;

    this.updateViewMatrix();
    this.updateProjectionMatrix();
  }

  updateViewMatrix() {
    this.viewMatrix.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0], this.at.elements[1], this.at.elements[2],
      this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );
  }

  updateProjectionMatrix() {
    this.projectionMatrix.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);
  }

  moveForward(speed = 0.08) {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);
    f.elements[1] = 0; // Ignore vertical component
    f.normalize();
    f.mul(speed);
    this.eye.add(f);
    this.at.add(f);
    this.updateViewMatrix();
  }

  moveBackwards(speed = 0.08) {
    let b = new Vector3(this.eye.elements);
    b.sub(this.at);
    b.elements[1] = 0;
    b.normalize();
    b.mul(speed);
    this.eye.add(b);
    this.at.add(b);
    this.updateViewMatrix();
  }

  moveLeft(speed = 0.08) {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);
    let s = Vector3.cross(this.up, f);
    s.normalize();
    s.mul(speed);
    this.eye.add(s);
    this.at.add(s);
    this.updateViewMatrix();
  }

  moveRight(speed = 0.08) {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);
    let s = Vector3.cross(f, this.up);
    s.normalize();
    s.mul(speed);
    this.eye.add(s);
    this.at.add(s);
    this.updateViewMatrix();
  }

  moveUp(speed = 0.08) {
    let up = new Vector3(this.up.elements);
    up.normalize();
    up.mul(speed);
    this.eye.add(up);
    this.at.add(up);
    this.updateViewMatrix();
  }

  moveDown(speed = 0.08) {
    let down = new Vector3(this.up.elements);
    down.normalize();
    down.mul(speed);
    this.eye.sub(down);
    this.at.sub(down);
    this.updateViewMatrix();
  }

  panLeft(alpha = 2) {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);
    let rotMat = new Matrix4();
    rotMat.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    let f_prime = rotMat.multiplyVector3(f);
    this.at = new Vector3(this.eye.elements);
    this.at.add(f_prime);
    this.updateViewMatrix();
  }

  panRight(alpha = 2) {
    this.panLeft(-alpha);
  }

  panUp(angle = 1) {
    const newPitch = this.pitch + angle;
    const clampedPitch = Math.max(this.MIN_PITCH, Math.min(this.MAX_PITCH, newPitch));
    const allowedAngle = clampedPitch - this.pitch;

    // If clamped value is the same, don't rotate
    if (allowedAngle === 0) return;

    this.pitch = clampedPitch;

    // Camera forward direction
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);
    let right = Vector3.cross(f, this.up);
    right.normalize();

    let rotMat = new Matrix4();
    rotMat.setRotate(-allowedAngle, right.elements[0], right.elements[1], right.elements[2]);

    let f_prime = rotMat.multiplyVector3(f);
    this.at = new Vector3(this.eye.elements);
    this.at.add(f_prime);

    this.updateViewMatrix();
  }

  forward() {
    const f = new Vector3(this.at.elements);
    f.sub(this.eye);
    f.normalize();
    return f.elements;
  }
}
