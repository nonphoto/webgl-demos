const vertexPositions = [
	-1, -1, 0,
	-1, 1, 0,
	1, -1, 0,
	1, 1, 0
];

const lightPosition = [10.0, 10.0, 5.0];

require(["lib/domReady", "lib/gl-utils", "lib/gl-matrix", "lib/text!vertex.glsl", "lib/text!fragment.glsl"], function (domReady, util, matrix, vertexSource, fragmentSource) {
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
	const vertexShader = util.loadShader(gl, vertexSource, gl.VERTEX_SHADER);
	const fragmentShader = util.loadShader(gl, fragmentSource, gl.FRAGMENT_SHADER);

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

	const vertexPositionAttribute = gl.getAttribLocation(program, "vertexPosition");
	const resolutionUniform = gl.getUniformLocation(program, "resolution");
	const lightPositionUniform = gl.getUniformLocation(program, "lightPosition");

	const vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);

	function draw() {
		const t = Date.now() / 500

		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
		gl.uniform3f(lightPositionUniform, Math.sin(t) * 20, 20, Math.cos(t) * 20);

		gl.enableVertexAttribArray(vertexPositionAttribute);
		gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		requestAnimationFrame(draw);
	}

	draw();
});
