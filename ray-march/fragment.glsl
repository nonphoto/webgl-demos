precision mediump float;

uniform mat4 viewMatrix;
uniform vec2 resolution;

const bool debugEnabled = false;
const bool cloudsEnabled = true;
const bool complexNoise = true;
const bool shadowsEnabled = true;
const bool mieEnabled = true;
const bool rayleighEnabled = true;
const bool proceduralNoise = false;
const bool skipNight = true;

const float frame = 0.0;
const float cloudSpeed = 0.1;
const float sunSpeed = 0.05;
const float rayleighScale = 1.0;
const float mieScale = 1.0;
const float cloudAmplitude = 4.0;

const float PI = 3.14159265358979323846;
const float PI_2 = 1.57079632679489661923;
const float PI_4 = 0.785398163397448309616; 

const int SKYLIGHT_VIEWDIR_SAMPLES = 12;
const int SKYLIGHT_SUNDIR_SAMPLES = 6;

struct planet_t
{
    float r_s; // sea level radius
    float r_a; // atmosphere radius
};

planet_t earth = planet_t(6360.0e3, 6420.0e3);

struct sun_t
{  
    vec3 beta_r;
    vec3 beta_m;
    float scaleHeight_r;
    float scaleHeight_m;
    float intensity;
    float meanCosine;
    vec3 direction;
    float angularDiameter; // between 0.5244 and 5.422 for our sun
    vec3 color;
};

sun_t sun = sun_t(vec3(5.5e-6, 13.0e-6, 22.1e-6) * rayleighScale,
                  vec3(21.0e-6) * mieScale,
                  7994.0,
                  1200.0,
                  10.0,
                  0.76,
                  normalize(vec3(cos(PI_2 * sunSpeed * frame / 24.0), sin(PI_2 * sunSpeed * frame / 24.0), 1.0)),
                  0.53,
                  vec3(1.0, 1.0, 1.0));

float distanceToSpace(in vec3 rayOrigin, in vec3 rayDirection) {
    float r = length(rayOrigin); // distance from center of earth to ray origin
    vec3 up = rayOrigin / r; // normalize rayOrigin
    float beta = PI - acos(dot(rayDirection, up)); 
    float sb = sin(beta);
    float b = earth.r_a;
    float bt = earth.r_s - 10.0;
    
    float tr = sqrt((b * b) - (r * r) * (sb * sb)) + r * cos(beta);
    
    return tr;
}

float sunVisibility(in float altitude) {
    float result = 0.0;
    float verticalVisibility = clamp((0.5 + altitude / sun.angularDiameter), 0.0, 1.0); 
    
    if (verticalVisibility == 0.0 || verticalVisibility == 1.0) {
        return verticalVisibility;
    }
    
    if (verticalVisibility > 0.5) {
        float h = (verticalVisibility - 0.5) * 2.0;
        float a = ((acos(h) * 2.0) - sin(acos(h) * 2.0)) / (2.0 * PI);
        return 1.0 - a;
        
    } else {
        float h = (0.5 - verticalVisibility) * 2.0;
        float a = ((acos(h) * 2.0) - sin(acos(h) * 2.0)) / (2.0 * PI);
        return a;
    }
}

vec3 directLight(in vec3 P, in vec3 w) {
    float d = distanceToSpace(P, w);
    float segmentLength = d / float(SKYLIGHT_SUNDIR_SAMPLES);
    float t = 0.0;
    float opticalDepth_r = 0.0;
    float opticalDepth_m = 0.0;

    for (int j = 0; j < SKYLIGHT_SUNDIR_SAMPLES; ++j) {
        vec3 X = P + w * (t + 0.5 * segmentLength);// only sample halfway to edge of atmosphere
        float altitude = length(X) - earth.r_s; // optimize length(X) from above
        opticalDepth_r += exp(-altitude / sun.scaleHeight_r) * segmentLength;
        opticalDepth_m += exp(-altitude / sun.scaleHeight_m) * segmentLength;
        t += segmentLength;
    }

    vec3 tau = sun.beta_r * (opticalDepth_r) + sun.beta_m * 1.05 * (opticalDepth_m);
    return vec3(exp(-tau.x), exp(-tau.y), exp(-tau.z));
}

vec3 scatteredLight(in vec3 P, in vec3 w) {
    float d = distanceToSpace(P, w);
    float mu = dot(w, sun.direction);
    float mu2 = mu * mu;
    float meanCosine2 = sun.meanCosine * sun.meanCosine;

    // rayleigh
    vec3 sum_r = vec3(0.0);
    float opticalDepth_r = 0.0;
    float phase_r = (3.0 / (16.0 * PI)) * (1.0 + mu2);
    
    // mie
    vec3 sum_m = vec3(0.0);
    float opticalDepth_m = 0.0;
    float phase_m = ((3.0 / (8.0 * PI)) * ((1.0 - meanCosine2) * (1.0 + mu2))) / ((2.0 + meanCosine2) * pow(1.0 + meanCosine2 - 2.0 * sun.meanCosine * mu, 1.5));

    float segmentLength = d / float(SKYLIGHT_VIEWDIR_SAMPLES);
    float t = 0.0;
    
    for (int i = 0; i < SKYLIGHT_VIEWDIR_SAMPLES; ++i) {
        vec3 X = P + w * (t + 0.5 * segmentLength);
        float altitude = length(X) - earth.r_s;
        float segmentDepth_r = exp(-altitude / sun.scaleHeight_r) * segmentLength;
        opticalDepth_r += segmentDepth_r;
        float segmentDepth_m = exp(-altitude / sun.scaleHeight_m) * segmentLength;
        opticalDepth_m += segmentDepth_m;

        // float sampleAltitude = PI_2 - asin(earth.r_s / length(X)) + acos(normalize(X).y) + 0;//sun.altitude;
        // float visibility = sunVisibility(sampleAltitude);

        /*if (distanceToSpace(X, sun.direction) != inf) {*/

            // Secondary raymarch along ray L toward sun
            float segmentLength_L = d / float(SKYLIGHT_SUNDIR_SAMPLES);
            float t_L = 0.0;
            float opticalDepth_Lr = 0.0;
            float opticalDepth_Lm = 0.0;
            
            for (int j = 0; j < SKYLIGHT_SUNDIR_SAMPLES; ++j) {
                vec3 Y = X + sun.direction * (t_L + 0.5 * segmentLength_L);// only sample halfway to edge of atmosphere
                float altitude_L = length(Y) - earth.r_s; // optimize length(X) from above
                opticalDepth_Lr += exp(-altitude_L / sun.scaleHeight_r) * segmentLength;
                opticalDepth_Lm += exp(-altitude_L / sun.scaleHeight_m) * segmentLength;
                t_L += segmentLength_L;
            }

            vec3 tau = sun.beta_r * (opticalDepth_Lr + opticalDepth_r) + sun.beta_m * 1.05 * (opticalDepth_Lm + opticalDepth_m);
            vec3 attenuation = vec3(exp(-tau.x), exp(-tau.y), exp(-tau.z));
            sum_r +=  segmentDepth_r * attenuation;
            sum_m +=  segmentDepth_m * attenuation;
            /*}*/
        t += segmentLength;
    }
    vec3 result = vec3(0.0);
    if (rayleighEnabled) {
        result += sum_r * phase_r * sun.beta_r;
    }
    if (mieEnabled) {
        result += sum_m * phase_m * sun.beta_m;
    }
    return sun.intensity * result;
}
void main() {
	vec3 origin = vec3(0, 0, 0);
	vec3 direction = normalize(vec3((gl_FragCoord.xy / resolution - 0.5) * 2.0, 1.0));

	vec3 R = vec3(0.0, earth.r_s, 0.0);
	vec3 light = scatteredLight(R, direction);
	gl_FragColor = vec4(light, 1.0);
}
