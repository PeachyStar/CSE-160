class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [0.5, 0.5, 0.5, 0.5];
    this.matrix = new Matrix4();
    this.textureNum = 0;

    if (!Cube.vertexBuffer) {
      Cube.initBuffers();
    }
  }

  static initBuffers() {
    var allVerts = [];
    var allUVs = [];
    //Front of cube
    allVerts = allVerts.concat([-0.5,-0.5,-0.5, 0.5,0.5,-0.5, 0.5,-0.5,-0.5])
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);
    allVerts = allVerts.concat([-0.5,-0.5,-0.5, 0.5,0.5,-0.5, -0.5,0.5,-0.5])
    allUVs = allUVs.concat([0,0, 1,1, 0,1]);
    //back
    allVerts = allVerts.concat([-0.5,-0.5,0.5, 0.5,0.5,0.5, 0.5,-0.5,0.5])
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);
    allVerts = allVerts.concat([-0.5,-0.5,0.5, 0.5,0.5,0.5, -0.5,0.5,0.5])
    allUVs = allUVs.concat([0,0, 1,1, 0,1]);
    //top
    allVerts = allVerts.concat([-0.5,0.5,-0.5, 0.5,0.5,0.5, 0.5,0.5,-0.5])
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);
    allVerts = allVerts.concat([-0.5,0.5,-0.5, 0.5,0.5,0.5, -0.5,0.5,0.5])
    allUVs = allUVs.concat([0,0, 1,1, 0,1]);
    //bottom
    allVerts = allVerts.concat([-0.5,-0.5,-0.5, 0.5,-0.5,0.5, 0.5,-0.5,-0.5])
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);
    allVerts = allVerts.concat([-0.5,-0.5,-0.5, 0.5,-0.5,0.5, -0.5,-0.5,0.5])
    allUVs = allUVs.concat([0,0, 1,1, 0,1]);
    //right
    allVerts = allVerts.concat([0.5,-0.5,-0.5, 0.5,0.5,0.5, 0.5,0.5,-0.5])
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);
    allVerts = allVerts.concat([0.5,-0.5,-0.5, 0.5,0.5,0.5, 0.5,-0.5,0.5])
    allUVs = allUVs.concat([0,0, 1,1, 0,1]);
    //left
    allVerts = allVerts.concat([-0.5,-0.5,-0.5, -0.5,0.5,0.5, -0.5,0.5,-0.5])
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);
    allVerts = allVerts.concat([-0.5,-0.5,-0.5, -0.5,0.5,0.5, -0.5,-0.5,0.5])
    allUVs = allUVs.concat([0,0, 1,1, 0,1]);

    // Create and store vertex buffer
    Cube.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allVerts), gl.STATIC_DRAW);

    // Create and store UV buffer
    Cube.uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allUVs), gl.STATIC_DRAW);

    Cube.numVerts = allVerts.length / 3;
  }

  render() {
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, ...this.color);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.uvBuffer);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.drawArrays(gl.TRIANGLES, 0, Cube.numVerts);
  }
}
