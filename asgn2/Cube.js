class Cube{
  constructor() {
    this.type = 'cube';
    this.color = [0.5, 0.5, 0.5, 0.5];
    this.matrix = new Matrix4();
  }

  render() {
    drawCube(this.color, this.matrix);
  }

  rotateAroundPoint(angle, x, y, z, px, py, pz) {
    let temp = new Matrix4();
    temp.setTranslate(px, py, pz);
    temp.rotate(angle, x, y, z);
    temp.translate(-px, -py, -pz);
    this.matrix.concat(temp);
  }
}

  function drawCube(rgba, matrix) {
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

    //Front of cube
    drawTriangle3D([-0.5,-0.5,-0.5, 0.5,0.5,-0.5, 0.5,-0.5,-0.5])
    drawTriangle3D([-0.5,-0.5,-0.5, 0.5,0.5,-0.5, -0.5,0.5,-0.5])
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    //back
    drawTriangle3D([-0.5,-0.5,0.5, 0.5,0.5,0.5, 0.5,-0.5,0.5])
    drawTriangle3D([-0.5,-0.5,0.5, 0.5,0.5,0.5, -0.5,0.5,0.5])
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    //top
    drawTriangle3D([-0.5,0.5,-0.5, 0.5,0.5,0.5, 0.5,0.5,-0.5])
    drawTriangle3D([-0.5,0.5,-0.5, 0.5,0.5,0.5, -0.5,0.5,0.5])
    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    //bottom
    drawTriangle3D([-0.5,-0.5,-0.5, 0.5,-0.5,0.5, 0.5,-0.5,-0.5])
    drawTriangle3D([-0.5,-0.5,-0.5, 0.5,-0.5,0.5, -0.5,-0.5,0.5])
    gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
    //right
    drawTriangle3D([0.5,-0.5,-0.5, 0.5,0.5,0.5, 0.5,0.5,-0.5])
    drawTriangle3D([0.5,-0.5,-0.5, 0.5,0.5,0.5, 0.5,-0.5,0.5])
    gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
    //left
    drawTriangle3D([-0.5,-0.5,-0.5, -0.5,0.5,0.5, -0.5,0.5,-0.5])
    drawTriangle3D([-0.5,-0.5,-0.5, -0.5,0.5,0.5, -0.5,-0.5,0.5])
    gl.uniform4f(u_FragColor, rgba[0]*0.4, rgba[1]*0.4, rgba[2]*0.4, rgba[3]);
  }