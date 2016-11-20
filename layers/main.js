const width = 1024;
const height = 1024;

const vertices = [
	-1, -1,
	-1, 1,
	1, -1,
	1, 1
];

let layers = [];

function createLayer(gl, vertexSource, fragmentSource) {
	const vertexShader = loadShader(gl, vertexSource, gl.VERTEX_SHADER);
	const fragmentShader = loadShader(gl, fragmentSource, gl.FRAGMENT_SHADER);

	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
		return;
	}

	const vertexAttribute = gl.getAttribLocation(program, "a_vertexPosition");
	const texture = createTexture(gl);
	const framebuffer = createFramebuffer(gl, texture);

	return {
		program: program,
		vertexAttribute: vertexAttribute,
		texture: texture,
		framebuffer: framebuffer,
	};
}

function createTexture(gl) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	if (typeof image !== "undefined") {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	}

	return texture;
}

function createFramebuffer(gl, texture) {
	const framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
	return framebuffer;
}

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

require(["domReady", "text!vertex.glsl", "text!red-circle.glsl", "text!green-circle.glsl", "text!blue-circle.glsl"], function(domReady, vertexSource, redSource, greenSource, blueSource) {
	const image = document.getElementById("image");
	const canvas = document.getElementById("canvas");
	canvas.width = width;
	canvas.height = height;

	var gl = null;
	gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	if (!gl) {
		alert("Unable to initialize WebGL. Maybe your browser doesn't support it.");
		return;
	}

	const vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	let redLayer = createLayer(gl, vertexSource, redSource);
	layers.push(redLayer);

	let greenLayer = createLayer(gl, vertexSource, greenSource);
	layers.push(greenLayer);

	let blueLayer = createLayer(gl, vertexSource, blueSource);
	layers.push(blueLayer);

	let sourceTexture = createTexture(gl, image);
	for (let i = 0; i < layers.length; i++) {
		const layer = layers[i];
		gl.useProgram(layer.program);
		gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
		if (i < layers.length - 1) {
			gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
		}
		else {
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}

		gl.enableVertexAttribArray(layer.vertexAttribute);
		gl.vertexAttribPointer(layer.vertexAttribute, 2, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		sourceTexture = layer.texture;
	}
});
