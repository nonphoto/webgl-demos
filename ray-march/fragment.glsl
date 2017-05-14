precision mediump float;

uniform mat4 viewMatrix;
uniform vec2 resolution;

bool sphere(in vec3 ro, in vec3 rd, in vec3 p, in float l) {
	float a = dot(rd, rd);
	float b = dot(rd, ro - p) * 2.0;
	float c = dot(p, p) + dot(ro, ro) - (2.0 * dot(p, ro)) - (l * l);
	float discriminant = (b * b) - (4.0 * a * c);
	return discriminant > 0.0;
}

vec3 directLight(in vec3 ro, in vec3 rd) {
	if (sphere(ro, rd, vec3(0.0, 0.0, 10.0), 2.0)) {
		return vec3(1.0, 0.0, 0.0);
	}
	else {
		return vec3(0.0, 0.0, 1.0);
	}
}

void main() {
	vec3 origin = vec3(0.0, 0.0, 0.0);
	vec3 direction = normalize(vec3((gl_FragCoord.xy / resolution - 0.5) * 2.0, 1.0));
	vec3 light = directLight(origin, direction);
	gl_FragColor = vec4(light, 1.0);
}
