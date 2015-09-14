ItaPoly = function( _width, _height ){

  var it = this;

  it.width = _width;
  it.height = _height;

  it.canvas = document.createElement( 'canvas' );
	it.canvas.width = it.width;
	it.canvas.height = it.height;

  it.beginTime = ( +new Date() );
  it.time = 0.0;
  it.resolution = [ it.canvas.width, it.canvas.height ];
  it.mouse = [ 0.0, 0.0, 0.0, 0.0 ];

  it.canvas.addEventListener( 'mousedown', function( _e ){ it.mousedown( _e ); } );
  it.canvas.addEventListener( 'mouseup', function( _e ){ it.mouseup( _e ); } );
  it.canvas.addEventListener( 'mousemove', function( _e ){ it.mousemove( _e ); } );

  it.gl = it.canvas.getContext( 'webgl' );
  var gl = it.gl;

  it.vert = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

  it.location = [];

  it.textures = []
  it.textureNumbers = []
  it.textureCount = 0;

};

ItaPoly.prototype.createProgram = function( _frag, _callback ){

	var it = this;
	var gl = it.gl;

	var v = gl.createShader( gl.VERTEX_SHADER );
	gl.shaderSource( v, it.vert );
	gl.compileShader( v );
	if( !gl.getShaderParameter( v, gl.COMPILE_STATUS ) ){
		it.error = gl.getShaderInfoLog( v );
    console.error( it.error );
		return;
	}

	var f = gl.createShader( gl.FRAGMENT_SHADER );
	gl.shaderSource( f , _frag );
	gl.compileShader( f );
	if( !gl.getShaderParameter( f, gl.COMPILE_STATUS ) ){
		it.error = gl.getShaderInfoLog( f );
    console.error( it.error );
		return;
	}

	var p = gl.createProgram();
	gl.attachShader( p, v );
	gl.attachShader( p, f );
	gl.linkProgram( p );
	if( gl.getProgramParameter( p, gl.LINK_STATUS ) ){
    it.error = '';
		it.program = p;

    it.vbo = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, it.vbo );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [-1,1,-1,-1,1,1,1,-1] ), gl.STATIC_DRAW );

    var locationP = gl.getAttribLocation( it.program, 'p' );
  	gl.enableVertexAttribArray( locationP );
  	gl.vertexAttribPointer( locationP, 2, gl.FLOAT, false, 0, 0 );

    if( typeof _callback === 'function' ){ _callback( it ); }
	}else{
		it.error = gl.getProgramInfoLog( p );
    console.error( it.error );
	}

};

ItaPoly.prototype.setFloat = function( _name, _param ){

	var it = this;

  if( !it.location[ _name ] ){ it.location[ _name ] = it.gl.getUniformLocation( it.program, _name ); }
  it.gl.uniform1f( it.location[ _name ], _param );

};

ItaPoly.prototype.setVec2 = function( _name, _param ){

	var it = this;

  if( !it.location[ _name ] ){ it.location[ _name ] = it.gl.getUniformLocation( it.program, _name ); }
  it.gl.uniform2fv( it.location[ _name ], _param );

};

ItaPoly.prototype.setVec3 = function( _name, _param ){

	var it = this;

  if( !it.location[ _name ] ){ it.location[ _name ] = it.gl.getUniformLocation( it.program, _name ); }
  it.gl.uniform3fv( it.location[ _name ], _param );

};

ItaPoly.prototype.setVec4 = function( _name, _param ){

	var it = this;

  if( !it.location[ _name ] ){ it.location[ _name ] = it.gl.getUniformLocation( it.program, _name ); }
  it.gl.uniform4fv( it.location[ _name ], _param );

};

ItaPoly.prototype.setInt = function( _name, _param ){

	var it = this;

  if( !it.location[ _name ] ){ it.location[ _name ] = it.gl.getUniformLocation( it.program, _name ); }
  it.gl.uniform1i( it.location[ _name ], _param );

};

ItaPoly.prototype.prepareTexture = function( _name ){

  var it = this;
  var gl = it.gl;

  if( it.textureNumbers[ _name ] !== 0 && !it.textureNumbers[ _name ] ){

    var i = it.textureCount;

    gl.activeTexture( gl.TEXTURE0 + i );
    it.textures[ i ] = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, it.textures[ i ] );
  	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
  	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
  	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
  	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );

    it.textureNumbers[ _name ] = i;
    it.location[ i ] = gl.getUniformLocation( it.program, _name );

    it.textureCount += 1;

  }

};

ItaPoly.prototype.setSampler2D = function( _name, _param ){

  var it = this;
	var gl = it.gl;

  it.prepareTexture( _name );

	gl.bindTexture( gl.TEXTURE_2D, it.textures[ it.textureNumbers[ _name ] ] );
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _param );

};

ItaPoly.prototype.setSampler2DFromArray = function( _name, _array, _width, _height ){

  var it = this;
	var gl = it.gl;

  it.prepareTexture( _name );

	gl.bindTexture( gl.TEXTURE_2D, it.textures[ it.textureNumbers[ _name ] ] );
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array( _array ) );

};

ItaPoly.prototype.mousedown = function( _e ){

  var it = this;

  it.mouse[0] = _e.offsetX;
  it.mouse[1] = _e.offsetY;
  it.mouse[2] = _e.offsetX;
  it.mouse[3] = _e.offsetY;

  if( typeof it.onMouseDown === 'function' ){ it.onMouseDown( _e ); }

};

ItaPoly.prototype.mouseup = function( _e ){

  var it = this;

  it.mouse[0] = _e.offsetX;
  it.mouse[1] = _e.offsetY;
  it.mouse[2] = - _e.offsetX;
  it.mouse[3] = - _e.offsetY;

  if( typeof it.onMouseUp === 'function' ){ it.onMouseUp( _e ); }

};

ItaPoly.prototype.mousemove = function( _e ){

  var it = this;

  it.mouse[0] = _e.offsetX;
  it.mouse[1] = _e.offsetY;
  if( 0 < it.mouse[2] ){
    it.mouse[2] = _e.offsetX;
    it.mouse[3] = _e.offsetY;
  }

  if( typeof it.onMouseMove === 'function' ){ it.onMouseMove( _e ); }

};

ItaPoly.prototype.update = function(){

	var it = this;
	var gl = it.gl;

	gl.clearColor( 0, 0, 0, 1 );
  gl.clearDepth( 1 );
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	gl.useProgram( it.program );

  it.time = ( ( +new Date() ) - it.beginTime ) / 1000.0;
	it.setFloat( 'time', it.time );
	it.setVec2( 'resolution', it.resolution );
  it.setVec4( 'mouse', it.mouse );

  for( var i=0; i<it.textures.length; i++ ){
    gl.bindTexture( gl.TEXTURE_2D, it.textures[ i ] );
    gl.uniform1i( it.location[ i ], i );
  }

	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

  gl.flush();

};
