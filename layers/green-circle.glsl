precision mediump float;

uniform sampler2D u_image;

varying vec2 v_texCoord;

void main() {
	vec2 d = vec2(0.5, 0.5) - v_texCoord;
	if (length(d) < 0.25) {
		gl_FragColor = vec4(0, 1, 0, 1);
	}
	else {
		gl_FragColor = texture2D(u_image, v_texCoord);
	}
}
