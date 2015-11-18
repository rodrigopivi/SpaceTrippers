precision highp float;
varying vec4 vPosition;
#define iterations 17
#define formuparam 0.53
#define volsteps 4
#define stepsize 0.1
#define zoom   0.800
#define tile   0.850
#define speed  0.010 
#define brightness 0.0015
#define darkmatter 0.300
#define distfading 0.730
#define saturation 0.850
uniform float time;
void main()
{
    vec2 uv = vPosition.xy/vec2(100)-2.5;
    vec3 dir=vec3(uv, time*.001*vPosition.z);
    float mytime=time*speed*20.;
    vec3 from=vec3(1.5, 1.5, 2.);
    from+=vec3(mytime*2.5,mytime,-2.5);
    from.xyz/=time*10.5;
    //volumetric rendering
    float s=0.1,fade=.35;
    vec3 v=vec3(0.);
    for (int r=0; r<volsteps; r++) {
        vec3 p=from+s*dir*.5;
        p = abs(vec3(tile)-mod(p,vec3(tile))); // tiling fold
        float pa,a=pa=0.;
        for (int i=0; i<iterations; i++) { 
            p=abs(p)/dot(p,p)-formuparam; // the magic formula
            a+=abs(length(p)-pa); // absolute sum of average change
            pa=length(p);
        }
        float dm=max(0.,darkmatter-a*.001); //dark matter
        a*=a*a; // add contrast
        if (r>6) fade*=1.-dm; // dark matter, don't render near
        v+=vec3(dm,dm*.5,0.);
        v+=fade;
        v+=vec3(s*cos(s)/0.5,sin(s),cos(s*s)/4.5)*a*brightness*fade; // coloring based on distance
        fade*=distfading; // distance fading
        s+=stepsize;
    }
    gl_FragColor = vec4(vec3(v*.01),.0);
}