precision highp float;
varying vec4 vPosition;
varying vec3 vNormal;
uniform sampler2D refSampler;
// Gamma correction
#define GAMMA (2.2)
vec3 ToGamma( in vec3 col ) {
  // convert back into colour values, so the correct light will come out of the monitor
  return pow( col, vec3(1.0/GAMMA) );
}
vec4 Noise( in ivec2 x ) {
  return texture2D( refSampler, (vec2(x)+0.5)/256.0, -100.0 );
}
uniform float time;
uniform float alpha;
uniform float pointLongitude;
void main(void) {
  vec3 ray;
  ray.xy = .2*(vPosition.xy-vec2(.5));
  ray.z = 1.;
  float offset = time*.5;
  float speed2 = ((offset)+1.0)*pointLongitude;
  float speed = speed2+.05;
  offset += (offset)*.96;
  offset *= 2.0;
  vec3 col = vec3(0.);
  vec3 stp = ray/max(abs(ray.x),abs(ray.y));
  vec3 pos = 2.0*stp+.5;
  for ( int i=0; i < 15; i++ ) {
  	float z = Noise(ivec2(pos.xy)).x;
  	z = fract(z-offset);
  	float d = 100.0*z-pos.z;
  	float w = pow(max(0.0,1.0-8.0*length(fract(pos.xy)-.5)),2.0);
  	vec3 c = max(vec3(0),vec3(1.0-abs(d+speed2*.5)/speed,1.0-abs(d)/speed,1.0-abs(d-speed2*.5)/speed));
  	col += 1.5*(1.0-z)*c*w;
  	pos += stp;
  }
  gl_FragColor = vec4(ToGamma(col),alpha);
}
