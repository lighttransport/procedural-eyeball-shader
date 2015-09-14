// Ref : p12 of http://www.frostbite.com/wp-content/uploads/2014/11/course_notes_moving_frostbite_to_pbr.pdf

#ifdef GL_ES
precision mediump float;
#endif

varying vec3 camPos;
varying vec3 v_position;
varying vec3 v_normal;
varying vec2 v_uv;

uniform sampler2D eyeTexture;
uniform samplerCube cubemap;

#define PI 3.14159265
#define saturate(i) clamp(i,0.,1.)

void main(){
  vec3 nor = v_normal;
  vec3 rayDir = normalize( v_position - camPos );

  vec3 cube = textureCube( cubemap, reflect( rayDir, nor ) ).xyz;
  vec3 eye = texture2D( eyeTexture, v_uv ).xyz;
  gl_FragColor = vec4( eye + cube * 0.1, 1.0 );
}
