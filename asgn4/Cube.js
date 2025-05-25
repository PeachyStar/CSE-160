class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [0.5, 0.5, 0.5, 1];
    this.matrix = new Matrix4();
    this.textureNum = -2;
    this.reflectiveTF = true;

    if (!Cube.vertexBuffer) {
      Cube.initBuffers();
    }
  }

  rotateAroundPoint(angle, x, y, z, px, py, pz) {
    let temp = new Matrix4();
    temp.setTranslate(px, py, pz);
    temp.rotate(angle, x, y, z);
    temp.translate(-px, -py, -pz);
    this.matrix.concat(temp);
  }

  static initBuffers() {
    var allVerts = [];
    var allUVs = [];
    var allNorms = [];
    //Front of cube
    allVerts = allVerts.concat([-0.5,-0.5,-0.5, 0.5,0.5,-0.5, 0.5,-0.5,-0.5])
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);
    allNorms = allNorms.concat([0, 0, -1,  0, 0, -1,  0, 0, -1]);
    allVerts = allVerts.concat([-0.5,-0.5,-0.5, 0.5,0.5,-0.5, -0.5,0.5,-0.5])
    allUVs = allUVs.concat([0,0, 1,1, 0,1]);
    allNorms = allNorms.concat([0, 0, -1,  0, 0, -1,  0, 0, -1]);
    //back
    allVerts = allVerts.concat([-0.5,-0.5,0.5, 0.5,0.5,0.5, 0.5,-0.5,0.5])
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);
    allNorms = allNorms.concat([0, 0, 1,  0, 0, 1,  0, 0, 1]);
    allVerts = allVerts.concat([-0.5,-0.5,0.5, 0.5,0.5,0.5, -0.5,0.5,0.5])
    allUVs = allUVs.concat([0,0, 1,1, 0,1]);
    allNorms = allNorms.concat([0, 0, 1,  0, 0, 1,  0, 0, 1]);
    //top
    allVerts = allVerts.concat([-0.5,0.5,-0.5, 0.5,0.5,0.5, 0.5,0.5,-0.5])
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);
    allNorms = allNorms.concat([0, 1, 0,  0, 1, 0,  0, 1, 0]);
    allVerts = allVerts.concat([-0.5,0.5,-0.5, 0.5,0.5,0.5, -0.5,0.5,0.5])
    allUVs = allUVs.concat([0,0, 1,1, 0,1]);
    allNorms = allNorms.concat([0, 1, 0,  0, 1, 0,  0, 1, 0]);
    //bottom
    allVerts = allVerts.concat([-0.5,-0.5,-0.5, 0.5,-0.5,0.5, 0.5,-0.5,-0.5])
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);
    allNorms = allNorms.concat([0, -1, 0,  0, -1, 0,  0, -1, 0]);
    allVerts = allVerts.concat([-0.5,-0.5,-0.5, 0.5,-0.5,0.5, -0.5,-0.5,0.5])
    allUVs = allUVs.concat([0,0, 1,1, 0,1]);
    allNorms = allNorms.concat([0, -1, 0,  0, -1, 0,  0, -1, 0]);
    //right
    allVerts = allVerts.concat([0.5,-0.5,-0.5, 0.5,0.5,0.5, 0.5,0.5,-0.5])
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);
    allNorms = allNorms.concat([1, 0, 0,  1, 0, 0,  1, 0, 0]);
    allVerts = allVerts.concat([0.5,-0.5,-0.5, 0.5,0.5,0.5, 0.5,-0.5,0.5])
    allUVs = allUVs.concat([0,0, 1,1, 0,1]);
    allNorms = allNorms.concat([1, 0, 0,  1, 0, 0,  1, 0, 0]);
    //left
    allVerts = allVerts.concat([-0.5,-0.5,-0.5, -0.5,0.5,0.5, -0.5,0.5,-0.5])
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);
    allNorms = allNorms.concat([-1, 0, 0,  -1, 0, 0,  -1, 0, 0]);
    allVerts = allVerts.concat([-0.5,-0.5,-0.5, -0.5,0.5,0.5, -0.5,-0.5,0.5])
    allUVs = allUVs.concat([0,0, 1,1, 0,1]);
    allNorms = allNorms.concat([-1, 0, 0,  -1, 0, 0,  -1, 0, 0]);

    // Create and store vertex buffer
    Cube.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allVerts), gl.STATIC_DRAW);

    // Create and store UV buffer
    Cube.uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allUVs), gl.STATIC_DRAW);

    // Create and store normal buffer
    Cube.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allNorms), gl.STATIC_DRAW);

    Cube.numVerts = allVerts.length / 3;
  }

  render() {
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform1i(u_specularOn, this.reflectiveTF);
    gl.uniform4f(u_FragColor, ...this.color);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.uvBuffer);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.normalBuffer);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    let normalMatrix = new Matrix4();
    normalMatrix.setInverseOf(this.matrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    gl.drawArrays(gl.TRIANGLES, 0, Cube.numVerts);
  }
}
