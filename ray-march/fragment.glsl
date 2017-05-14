precision mediump float;

uniform mat4 viewMatrix;
uniform vec2 resolution;

vec3 directLight(in vec3 origin, in vec3 direction) {
	return vec3(0.0, 0.0, 1.0);
}

void main() {
	vec3 origin = vec3(0.0, 0.0, 0.0);
	vec3 direction = normalize(vec3((gl_FragCoord.xy / resolution - 0.5) * 2.0, 1.0));
	vec3 light = directLight(origin, direction);
	gl_FragColor = vec4(light, 1.0);
}
