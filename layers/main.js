const width = 1024;
const height = 1024;

const vertices = [
	-1, -1,
	-1, 1,
	1, -1,
	1, 1
];

let layers = [];

function createLayer(gl, util, vertexSource, fragmentSource) {
	const vertexShader = util.loadShader(gl, vertexSource, gl.VERTEX_SHADER);
	const fragmentShader = util.loadShader(gl, fragmentSource, gl.FRAGMENT_SHADER);

	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
		return;
	}

	const vertexAttribute = gl.getAttribLocation(program, "a_vertexPosition");
	const texture = util.createTexture(gl);
	const framebuffer = util.createFramebuffer(gl, texture);

	return {
		program: program,
		vertexAttribute: vertexAttribute,
		texture: texture,
		framebuffer: framebuffer,
	};
}

require(["lib/domReady", "lib/gl-utils", "lib/text!vertex.glsl", "lib/text!red-circle.glsl", "lib/text!green-circle.glsl", "lib/text!blue-circle.glsl"], function(domReady, util, vertexSource, redSource, greenSource, blueSource) {
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

	let redLayer = createLayer(gl, util, vertexSource, redSource);
	layers.push(redLayer);

	let greenLayer = createLayer(gl, util, vertexSource, greenSource);
	layers.push(greenLayer);

	let blueLayer = createLayer(gl, util, vertexSource, blueSource);
	layers.push(blueLayer);

	let sourceTexture = util.createTexture(gl, image);
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
