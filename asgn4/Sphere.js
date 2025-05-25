class Sphere {
  constructor() {
    this.type = 'sphere';
    this.color = [0.5, 0.5, 0.5, 1];
    this.matrix = new Matrix4();
    this.radius = 0.5;
    this.latitudeBands = 15;
    this.longitudeBands = 15;
    this.textureNum = -2;
    this.reflectiveTF = true;

    if (!Sphere.vertexBuffer) {
      Sphere.initBuffers(this.latitudeBands, this.longitudeBands, this.radius);
    }
  }

  static initBuffers(latBands, longBands, radius) {
    const vertices = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    for (let lat = 0; lat <= latBands; lat++) {
      const theta = lat * Math.PI / latBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let lon = 0; lon <= longBands; lon++) {
        const phi = lon * 2 * Math.PI / longBands;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;
        const u = lon / longBands;
        const v = lat / latBands;

        vertices.push(radius * x, radius * y, radius * z);
        normals.push(x, y, z); // same as position direction
        uvs.push(u, v);
      }
    }

    for (let lat = 0; lat < latBands; lat++) {
      for (let lon = 0; lon < longBands; lon++) {
        const first = (lat * (longBands + 1)) + lon;
        const second = first + longBands + 1;

        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }

    // Store buffers
    Sphere.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Sphere.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    Sphere.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Sphere.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    Sphere.uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Sphere.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

    Sphere.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Sphere.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    Sphere.numIndices = indices.length;
  }

  render() {
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform1i(u_specularOn, this.reflectiveTF);
    gl.uniform4f(u_FragColor, ...this.color);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    gl.bindBuffer(gl.ARRAY_BUFFER, Sphere.vertexBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, Sphere.normalBuffer);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    gl.bindBuffer(gl.ARRAY_BUFFER, Sphere.uvBuffer);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Sphere.indexBuffer);
    gl.drawElements(gl.TRIANGLES, Sphere.numIndices, gl.UNSIGNED_SHORT, 0);
  }
}
