export default /* glsl */`
#define M_PI 3.1415926535897932384626433832795

uniform sampler2D hologram;

varying vec3 f_position; 
varying vec3 f_normal;
varying vec2 f_uv;

float colorFunc(float t, float rgb) {

    float a = 0.5;
    float b = 0.5;
    float c = 1.0;
    float d = 0.0;

    if (rgb == 0.0) 
    {
        d = 0.0;
    } 
    else if (rgb == 1.0)
    {
        d = .33;
    }
    else if (rgb == 2.0)
    {
        d = .67;
    }
    else
    {
        d = -1.0;
    }

    return a + b * cos(4.0 * M_PI * (c*t + d));
}
`;
