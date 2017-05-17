precision mediump float;

uniform mat4 viewMatrix;
uniform vec2 resolution;

const float kd = 0.99;
const float ka = 0.2;

const float MAX_DISTANCE = 1000.0;

const vec3 LIGHT_CENTER = vec3(10.0, 10.0, 5.0);
const vec3 SPHERE_CENTER = vec3(0.0, 0.0, 10.0);
const float SPHERE_RADIUS = 2.0;

float sphereDistance(in vec3 ro, in vec3 rd, in vec3 p, in float l) {
	float a = dot(rd, rd);
	float b = dot(rd, ro - p) * 2.0;
	float c = dot(p, p) + dot(ro, ro) - (2.0 * dot(p, ro)) - (l * l);
	float d = (b * b) - (4.0 * a * c);
	if (d < 0.0) {
		return -1.0;
	}
	else {
		float t = (-b - sqrt(d)) / 2.0 * a;
		return t;
	}
}

vec3 directLight(in vec3 ro, in vec3 rd) {
	float t = sphereDistance(ro, rd, SPHERE_CENTER, SPHERE_RADIUS);
	if (t < 0.0) {
		return vec3(0.0, 0.0, 1.0);
	}
	else {
		vec3 Q = ro + (t * rd);
		vec3 N = (Q - SPHERE_CENTER) / SPHERE_RADIUS;
		vec3 L = normalize(LIGHT_CENTER - Q);
		float a = dot(N, L);
		vec3 c = vec3((kd * a) + ka);
		return c;
	}
}

void main() {
	float scaling = min(resolution.x, resolution.y);
	vec3 origin = vec3(0.0, 0.0, 0.0);
	vec3 direction = normalize(vec3((gl_FragCoord.xy - (resolution / 2.0)) / scaling, 1.0));
	vec3 light = directLight(origin, direction);
	gl_FragColor = vec4(light, 1.0);
}
