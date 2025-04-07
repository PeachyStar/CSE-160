// DrawTriangle.js (c) 2012 matsuda
function drawVector(v, color) {
  var canvas = document.getElementById('example');
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 
  var ctx = canvas.getContext('2d');

  // Scale the vector by 20 and flip the y-axis (canvas y increases downward)
  let x = v.elements[0] * 20;
  let y = -v.elements[1] * 20;

  ctx.beginPath();
  ctx.moveTo(200, 200); // Start from the center of the canvas
  ctx.lineTo(200 + x, 200 + y); // Draw to the scaled vector endpoint
  ctx.strokeStyle = color;
  ctx.stroke();
}

function handleDrawEvent(){
  var canvas = document.getElementById('example');
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 
  var ctx = canvas.getContext('2d');

  // make canvas black
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';             // Set color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height);  // Fill a rectangle with the color

  var x1 = parseFloat(document.getElementById("x1").value);
  var y1 = parseFloat(document.getElementById("y1").value);
  var v1 = new Vector3([x1, y1, 0.0]);
  drawVector(v1, 'red');

  var x2 = parseFloat(document.getElementById("x2").value);
  var y2 = parseFloat(document.getElementById("y2").value);
  var v2 = new Vector3([x2, y2, 0.0]);
  drawVector(v2, 'blue');
}

function handleDrawOperationEvent(){
  var canvas = document.getElementById('example');
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 
  var ctx = canvas.getContext('2d');

  // make canvas black
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';             // Set color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height);  // Fill a rectangle with the color

  var canvas = document.getElementById('example');
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 
  var ctx = canvas.getContext('2d');

  // make canvas black
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';             // Set color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height);  // Fill a rectangle with the color

  var x1 = parseFloat(document.getElementById("x1").value);
  var y1 = parseFloat(document.getElementById("y1").value);
  var v1 = new Vector3([x1, y1, 0.0]);
  drawVector(v1, 'red');

  var x2 = parseFloat(document.getElementById("x2").value);
  var y2 = parseFloat(document.getElementById("y2").value);
  var v2 = new Vector3([x2, y2, 0.0]);
  drawVector(v2, 'blue');

  let op = document.getElementById("operation").value;
  let scalar = parseFloat(document.getElementById("scalar").value);  
  if (op == "add"){
    let v3 = new Vector3(v1.elements).add(v2);
    drawVector(v3, 'green');
  } else if (op == "sub") {
    let v3 = new Vector3(v1.elements).sub(v2);
    drawVector(v3, 'green');
  } else if (op == "mul") {
    let v3 = new Vector3(v1.elements).mul(scalar);
    let v4 = new Vector3(v2.elements).mul(scalar);
    drawVector(v3, 'green');
    drawVector(v4, 'green');  
  } else if (op == "div") {
    let v3 = new Vector3(v1.elements).div(scalar);
    let v4 = new Vector3(v2.elements).div(scalar);
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (op == "mag") {
    console.log("Magnitude of v1:", v1.magnitude());
    console.log("Magnitude of v1:", v1.magnitude());
  } else if (op == "nor") {
    let v3 = new Vector3(v1.elements).normalize();
    let v4 = new Vector3(v2.elements).normalize();
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (op == "angle") {
    console.log("Angle between v1 and v2:", angleBetween(v1,v2));
  } else if (op == "area") {
    console.log("Area of v1 and v2:", areaTriangle(v1,v2));
  }
  //For add and sub operations, draw a green vector v3 = v1 + v2  or v3 = v1 - v2. For mul and div operations, draw two green vectors v3 = v1 * s and v4 = v2 * s.
}

function angleBetween(v1, v2){
  let dot = Vector3.dot(v1, v2);
  let mag1 = v1.magnitude();
  let mag2 = v2.magnitude();
  if (mag1 === 0 || mag2 === 0) {
    console.log("Cannot compute angle with zero-length vector.");
    return null;
  }

  let cosTheta = dot / (mag1 * mag2);
  return Math.acos(cosTheta) * (180 / Math.PI);
}

function areaTriangle(v1, v2){
  let cross = Vector3.cross(v1, v2);
  let areaParallelogram = cross.magnitude();
  return areaParallelogram / 2;
}

function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // make canvas black
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';             // Set color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height);  // Fill a rectangle with the color
}
