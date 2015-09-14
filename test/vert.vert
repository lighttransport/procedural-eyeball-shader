#define PI 3.14159265

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

varying vec3 camPos;
varying vec3 v_position;
varying vec3 v_normal;
varying vec2 v_uv;

uniform float time;
uniform vec2 resolution;

mat4 lookAt( vec3 _pos, vec3 _tar, vec3 _air ){
  vec3 dir = normalize( _tar - _pos );
  vec3 sid = normalize( cross( dir, _air ) );
  vec3 top = normalize( cross( sid, dir ) );
  return mat4(
    sid.x, top.x, dir.x, 0.0,
    sid.y, top.y, dir.y, 0.0,
    sid.z, top.z, dir.z, 0.0,
    - sid.x * _pos.x - sid.y * _pos.y - sid.z * _pos.z,
    - top.x * _pos.x - top.y * _pos.y - top.z * _pos.z,
    - dir.x * _pos.x - dir.y * _pos.y - dir.z * _pos.z,
    1.0
  );
}

mat4 perspective( float _fov, float _aspect, float _near, float _far ){
  float p = 1.0 / tan( _fov * PI / 180.0 / 2.0 );
  float d = _far / ( _far - _near );
  return mat4(
    p / _aspect, 0.0, 0.0, 0.0,
    0.0, p, 0.0, 0.0,
    0.0, 0.0, d, 1.0,
    0.0, 0.0, -_near * 2.0 * d, 0.0
  );
}

void main(){
  camPos = vec3( cos( time ), 3.0, sin( time ) ) * 0.7;

  mat4 matP = perspective( 60.0, resolution.x / resolution.y, 0.1, 100.0 );
  mat4 matV = lookAt( camPos, vec3( 0.0, 0.0, 0.0 ), vec3( 0.0, 1.0, 0.0 ) );
  gl_Position = matP * matV * vec4( position, 1.0 );
  v_position = position;
  v_normal = normal;
  v_uv = uv;
}
