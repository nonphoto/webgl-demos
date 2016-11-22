const positions = [
	-1, -1, 0,
	-1, 1, 0,
	1, -1, 0,
	1, 1, 0
];

function loadShader(gl, source, type) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("Shader compilation failed." + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

require(["lib/domReady", "lib/gl-matrix", "lib/text!vertex.glsl", "lib/text!fragment.glsl"], function(domReady, matrix, vertexSource, fragmentSource) {
	const canvas = document.getElementById("canvas");
	canvas.width = 800;
	canvas.height = 600;

	var gl = null;
	gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	if (!gl) {
		alert("Unable to initialize WebGL. Maybe your browser doesn't support it.");
		return
	}

	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	// Initialize shader program.
	const vertexShader = loadShader(gl, vertexSource, gl.VERTEX_SHADER);
	const fragmentShader = loadShader(gl, fragmentSource, gl.FRAGMENT_SHADER);

	program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
		return;
	}

	gl.useProgram(program);
	gl.clearColor(0.5, 0.5, 0.5, 1.0);

	var t0 = Date.now();
	
	const viewMatrix = matrix.mat4.create();
	matrix.mat4.translate(viewMatrix, viewMatrix, matrix.vec3.fromValues(0, 0, 0));
	matrix.mat4.invert(viewMatrix, viewMatrix);

	const vertexPositionAttribute = gl.getAttribLocation(program, "vertexPosition");
	const viewMatrixUniform = gl.getUniformLocation(program, "viewMatrix");
	const resolutionUniform = gl.getUniformLocation(program, "resolution");

	const vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	function draw() {
		gl.clear(gl.COLOR_BUFFER_BIT);
	
		gl.uniformMatrix4fv(viewMatrixUniform, false, new Float32Array(viewMatrix));

		gl.uniform2f(resolutionUniform, 800.0, 600.0);

		gl.enableVertexAttribArray(vertexPositionAttribute);
		gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		requestAnimationFrame(draw);
	}

	draw();
});
