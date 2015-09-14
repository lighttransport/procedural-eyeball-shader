precision highp float;

uniform float time;
uniform vec2 resolution;

uniform sampler2D randomTexture;

#define PI 3.14159265

#define saturate(i) clamp(i,0.,1.)

vec4 texture2DNearest( sampler2D _tex, vec2 _uv, vec2 _reso ){
  return texture2D( _tex, ( floor( _uv * _reso ) + 0.5 ) / _reso );
}

float expCurve( float _in, float _lv ){
  return sign( 0.5 - _in ) * ( exp( -abs( _in - 0.5 ) * _lv ) - 1.0 ) * 0.5 + 0.5;
}

vec4 noise( vec2 _uv, vec2 _mul, vec2 _off, float _iter, float _lacu ){
  vec4 sum = vec4( 0.0 );

  for( float i=0.0; i<99.0; i+=1.0 ){
    vec2 uv0 = ( ( _uv ) * _mul + _off ) * 0.01 * exp( i * _lacu );// + time * i * 0.01;
    vec2 uv1 = ( ( _uv + vec2( 1.0, 0.0 ) ) * _mul + _off ) * 0.01 * exp( i * _lacu );// + time * i * 0.01;
    vec4 tex0 = texture2D( randomTexture, uv0 );
    vec4 tex1 = texture2D( randomTexture, uv1 );
    vec4 tex = mix( tex1, tex0, expCurve( _uv.x, 10.0 ) );
    sum += tex / pow( 2.0, i + 1.0 );
    if( _iter < i ){ break; }
  }

  return sum;
}

void main(){
  vec2 uv = mod( gl_FragCoord.xy / resolution, 1.0 );
  uv = mod( uv + vec2( 0.5, 0.0 ), 1.0 );

  // 1
  vec3 col1 = vec3( 0.0 );
  {
    float line = 0.0;
    for( float i=0.0; i<8.5; i+=1.0 ){
      vec2 mul = vec2( exp( i * 0.3 ) );
      vec2 off = vec2( i * 423.1 );

      float lineL = 1.0 - abs( noise( uv, mul * vec2( 2.0, 1.5 ), off, 2.0, 0.4 ).x - 0.5 ) * 2.0;
      float lineS = 1.0 - abs( noise( uv, mul * vec2( 14.0 ), off + 10.0, 6.0, 0.7 ).x - 0.5 ) * 2.0;

      float lineT = expCurve( pow( lineL, 200.0 ), 7.0 ) * 1.0;
      lineT += pow( lineL, 12.0 ) * expCurve( pow( lineS, 40.0 ), 10.0 ) * 1.0;
      lineT = saturate( lineT );
      lineT *= expCurve( noise( uv, mul * 7.0, off + 20.0, 6.0, 1.0 ).x * 0.88, 20.0 );

      line += lineT * exp( -i * 0.1 );
    }

    line = saturate( line );

    float body = 1.0 - abs( noise( uv, vec2( 3.0, 4.0 ), vec2( 30.0 ), 9.0, 0.9 ).x - 0.5 ) * 2.0;

    col1 = mix(
      vec3( 1.0 ),
      vec3( 0.9, 0.45 - body * 0.02, 0.35 + body * 0.02 ),
      body
    );

    col1 = mix(
      col1,
      vec3( 0.95, 0.99, 0.84 ),
      expCurve( noise( uv, vec2( 4.0 ), vec2( 40.0 ), 5.0, 0.7 ).x * 0.7, 14.0 )
    );

    col1 = mix(
      col1,
      vec3( 0.52, 0.55, 0.57 ),
      expCurve( noise( uv, vec2( 4.0 ), vec2( 50.0 ), 5.0, 0.7 ).x * 0.7, 5.0 ) * 0.7
    );

    col1 = mix(
      col1,
      vec3( 0.74, 0.18, 0.24 ),
      line
    );
  }

  // 2
  vec3 col3 = vec3( 0.0 );
  {
    vec4 lenMod = noise( vec2( uv.x, 0.0 ), vec2( 4.0 ), vec2( 145.2 ), 6.0, 0.4 );
    float len = abs( uv.y - 0.92 - ( lenMod.x - 0.5 ) * 0.03 ) * ( 1.0 + lenMod.y );

    float ringN = 1.0 - abs( noise( uv, vec2( 2.0, 10.0 ), vec2( 563.2 ), 9.0, 0.9 ).x - 0.5 ) * 2.0;
    vec3 ring = ringN * vec3( 0.4, 0.6, 1.0 );

    vec3 stripe = vec3( 0.0 );
    for( float i=0.0; i<9.5; i+=1.0 ){
      vec4 flicker = noise( uv, vec2( 18.0 ), vec2( 130.8 + i * 4.77 ), 4.0, 0.4 );
      float stripeN = 1.0 - abs( noise( uv + flicker.xy * 0.05, vec2( 50.0, 1.0 ), vec2( 563.2 + i * 84.0 ), 9.0, 0.9 ).x - 0.5 ) * 2.0;
      stripeN = pow( stripeN, 18.0 );
      stripe += saturate( stripeN * vec3( 0.4, 0.6, 1.0 ) * 2.0 ) * 0.12;
    }

    col3 = mix(
      stripe,
      ring,
      expCurve( len * 10.0, 10.0 )
    );
  }

  vec3 col = mix(
    mix( col1, vec3( 1.0 ), exp( ( uv.y - 0.9 ) * 4.0 ) ),
    mix( col3, vec3( 0.0 ), expCurve( uv.y - 0.485, 800.0 ) ),
    expCurve( uv.y - 0.35, 400.0 )
  );

  gl_FragColor = vec4( col, 1.0 );
}
