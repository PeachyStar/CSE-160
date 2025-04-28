class Sphere {
  constructor() {
    this.type = 'sphere';
    this.color = [0.5, 0.5, 0.5, 0.5];
    this.matrix = new Matrix4();
    this.radius = 0.5;
    this.latitudeBands = 10;
    this.longitudeBands = 10;

    this.vertices = [];
    this.indices = [];
    
    // Generate vertices and indices for the sphere
    this.generateSphere();
  }

  generateSphere() {
    for (let latNumber = 0; latNumber <= this.latitudeBands; latNumber++) {
      let theta = latNumber * Math.PI / this.latitudeBands; // Latitude angle
      let sinTheta = Math.sin(theta);
      let cosTheta = Math.cos(theta);

      for (let lonNumber = 0; lonNumber <= this.longitudeBands; lonNumber++) {
        let phi = lonNumber * 2 * Math.PI / this.longitudeBands; // Longitude angle
        let sinPhi = Math.sin(phi);
        let cosPhi = Math.cos(phi);

        let x = this.radius * cosPhi * sinTheta;
        let y = this.radius * cosTheta;
        let z = this.radius * sinPhi * sinTheta;

        this.vertices.push(x, y, z); // Add the vertex
      }
    }

    // Generate indices for drawing the sphere as triangles
    for (let latNumber = 0; latNumber < this.latitudeBands; latNumber++) {
      for (let lonNumber = 0; lonNumber < this.longitudeBands; lonNumber++) {
        let first = (latNumber * (this.longitudeBands + 1)) + lonNumber;
        let second = first + this.longitudeBands + 1;

        // Create two triangles for each quad
        this.indices.push(first);
        this.indices.push(second);
        this.indices.push(first + 1);

        this.indices.push(second);
        this.indices.push(second + 1);
        this.indices.push(first + 1);
      }
    }
  }

  render() {
    drawSphere(this.color, this.matrix, this.vertices, this.indices);
  }
}

function drawSphere(rgba, matrix, vertices, indices) {
  // Pass the color of the sphere to u_FragColor variable
  gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

  // Pass the model matrix to u_ModelMatrix attribute
  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

  // Bind the vertex buffer
  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Set up the vertex attribute pointer for positions
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // Bind the index buffer
  let indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  // Draw the sphere using the indices
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}