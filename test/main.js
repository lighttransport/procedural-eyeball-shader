var canvas = document.createElement( 'canvas' );
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var particleCount = 128;

var gl = canvas.getContext( 'webgl' );
var textureFloatExtension = gl.getExtension( 'OES_texture_float' );
var floatLinearExtension = gl.getExtension( 'OES_float_linear' );
var halfFloatLinearExtension = gl.getExtension( 'OES_half_float_linear' );
document.body.appendChild( canvas );

gl.enable( gl.DEPTH_TEST );
gl.depthFunc( gl.LEQUAL );
gl.enable( gl.BLEND );

// ---

var createProgram = function( _vert, _frag ){
	var vert = gl.createShader( gl.VERTEX_SHADER );
	gl.shaderSource( vert, _vert );
	gl.compileShader( vert );
	if( !gl.getShaderParameter( vert, gl.COMPILE_STATUS ) ){
		alert( gl.getShaderInfoLog( vert ) );
		return null;
	}

	var frag = gl.createShader( gl.FRAGMENT_SHADER );
	gl.shaderSource( frag, _frag );
	gl.compileShader( frag );
	if(!gl.getShaderParameter( frag, gl.COMPILE_STATUS ) ){
		alert( gl.getShaderInfoLog( frag ) );
		return null;
	}

	var program = gl.createProgram();
	gl.attachShader( program, vert );
	gl.attachShader( program, frag );
	gl.linkProgram( program );
	if( gl.getProgramParameter( program, gl.LINK_STATUS ) ){
    program.locations = {};
		return program;
	}else{
		alert( gl.getProgramInfoLog( program ) );
		return null;
	}
};

var createVertexbuffer = function( _array ){
  var buffer = gl.createBuffer();

  gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( _array ), gl.STATIC_DRAW );
  gl.bindBuffer( gl.ARRAY_BUFFER, null );

  buffer.length = _array.length;
  return buffer;
}

var createIndexbuffer = function( _array ){
  var buffer = gl.createBuffer();

  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffer );
  gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Int16Array( _array ), gl.STATIC_DRAW );
  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );

  buffer.length = _array.length;
  return buffer;
}

var attribute = function( _program, _name, _buffer, _stride ){
  var location;
  if( _program.locations[ _name ] ){
    location = _program.locations[ _name ];
  }else{
    location = gl.getAttribLocation( _program, _name );
    _program.locations[ _name ] = location;
  }

  gl.bindBuffer( gl.ARRAY_BUFFER, _buffer );
  gl.enableVertexAttribArray( location );
  gl.vertexAttribPointer( location, _stride, gl.FLOAT, false, 0, 0 );

  gl.bindBuffer( gl.ARRAY_BUFFER, null );
};

var getUniformLocation = function( _program, _name ){
  var location;

  if( _program.locations[ _name ] ){
		location = _program.locations[ _name ];
	}else{
		location = gl.getUniformLocation( _program, _name );
		_program.locations[ _name ] = location;
	}

  return location;
}

var uniform1f = function( _program, _name, _value ){
	var location = getUniformLocation( _program, _name );

	gl.uniform1f( location, _value );
};

var uniform2fv = function( _program, _name, _value ){
	var location = getUniformLocation( _program, _name );

	gl.uniform2fv( location, _value );
};

var uniformTexture = function( _program, _name, _texture, _number ){
	var location = getUniformLocation( _program, _name );

  gl.activeTexture( gl.TEXTURE0 + _number );
  gl.bindTexture( gl.TEXTURE_2D, _texture );
  gl.uniform1i( location, _number );
};

var uniformCubemap = function( _program, _name, _texture, _number ){
	var location = getUniformLocation( _program, _name );

  gl.activeTexture( gl.TEXTURE0 + _number );
  gl.bindTexture( gl.TEXTURE_CUBE_MAP, _texture );
  gl.uniform1i( location, _number );
};

var createTexture = function(){
	var texture = gl.createTexture();
	gl.bindTexture( gl.TEXTURE_2D, texture );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
	gl.bindTexture( gl.TEXTURE_2D, null );

	return texture;
};

var setTexture = function( _texture, _image ){
	gl.bindTexture( gl.TEXTURE_2D, _texture );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _image );
	gl.bindTexture( gl.TEXTURE_2D, null );
};

var setTextureFromArray = function( _texture, _width, _height, _array ){
	gl.bindTexture( gl.TEXTURE_2D, _texture );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array( _array ) );
	gl.bindTexture( gl.TEXTURE_2D, null );
};

var setTextureFromFloatArray = function( _texture, _width, _height, _array ){
	gl.bindTexture( gl.TEXTURE_2D, _texture );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, new Float32Array( _array ) );
	gl.bindTexture( gl.TEXTURE_2D, null );
};

var createCubemap = function( _arrayOfImage ){
	// order : X+, X-, Y+, Y-, Z+, Z-
	var texture = gl.createTexture();

	gl.bindTexture( gl.TEXTURE_CUBE_MAP, texture );
	for( var i=0; i<6; i++ ){
		gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _arrayOfImage[ i ] );
	}
	gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
  gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
  gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
  gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
	gl.bindTexture( gl.TEXTURE_CUBE_MAP, null );

	return texture;
};

var createFramebuffer = function( _width, _height ){
  var framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer );

  framebuffer.texture = gl.createTexture();
  gl.bindTexture( gl.TEXTURE_2D, framebuffer.texture );
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, null );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
  gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, framebuffer.texture, 0 );

  gl.bindTexture( gl.TEXTURE_2D, null );
  gl.bindFramebuffer( gl.FRAMEBUFFER, null );

  return framebuffer;
};

// ---

var createSphereArray = function( _lat, _lon, _r ){
  var position = [];
  var normal = [];
	var uv = [];
  var index = [];

  position.push( 0, _r, 0 );
  normal.push( 0, 1, 0 );
	uv.push( 0, 0 );

  for( var iLat=0; iLat<_lat; iLat++ ){
    for( var iLon=0; iLon<_lon; iLon++ ){
      var x = Math.sin( iLat / ( _lat - 1.0 ) * Math.PI ) * Math.cos( iLon / _lon * Math.PI * 2.0 );
      var y = Math.cos( iLat / ( _lat - 1.0 ) * Math.PI );
      var z = Math.sin( iLat / ( _lat - 1.0 ) * Math.PI ) * Math.sin( iLon / _lon * Math.PI * 2.0 );

      position.push( x*_r, y*_r, z*_r );
      normal.push( x, y, z );
			uv.push( iLon / _lon, iLat / _lat );

      index.push( iLat*_lon+iLon, iLat*_lon+1+iLon, iLat*_lon+_lon+1+iLon );
      index.push( iLat*_lon+iLon, iLat*_lon+_lon+1+iLon, iLat*_lon+_lon+iLon );
    }
    var x = Math.sin( iLat / ( _lat - 1.0 ) * Math.PI ) * Math.cos( _lon / _lon * Math.PI * 2.0 );
    var y = Math.cos( iLat / ( _lat - 1.0 ) * Math.PI );
    var z = Math.sin( iLat / ( _lat - 1.0 ) * Math.PI ) * Math.sin( _lon / _lon * Math.PI * 2.0 );

		position.push( x*_r, y*_r, z*_r );
		normal.push( x, y, z );
		uv.push( 1.0, iLat / _lat );
  }

  for( var iLon=0; iLon<_lon; iLon++ ){
		var x = Math.sin( _lat / ( _lat - 1.0 ) * Math.PI ) * Math.cos( iLon / _lon * Math.PI * 2.0 );
		var y = Math.cos( _lat / ( _lat - 1.0 ) * Math.PI );
		var z = Math.sin( _lat / ( _lat - 1.0 ) * Math.PI ) * Math.sin( iLon / _lon * Math.PI * 2.0 );

		position.push( x*_r, y*_r, z*_r );
		normal.push( x, y, z );
		uv.push( iLon / _lon, 1.0 );
	}

	position.push( 0, -_r, 0 );
	normal.push( 0, -1, 0 );
	uv.push( 0, 1 );

  return {
    position : createVertexbuffer( position ),
    normal : createVertexbuffer( normal ),
		uv : createVertexbuffer( uv ),
    index : createIndexbuffer( index )
  }
};

// ---

var vert = '';
requestText( 'vert.vert', function( _text ){
  vert = _text;
  ready();
} );

var frag = '';
requestText( 'frag.frag', function( _text ){
  frag = _text;
  ready();
} );

var cubemapImages = [];
var loadCubemapImage = function( _number, _src ){
	cubemapImages[ _number ] = new Image();
	cubemapImages[ _number ].onload = function(){
		ready();
	}
	cubemapImages[ _number ].src = _src;
};
loadCubemapImage( 0, 'cube_PX.png' );
loadCubemapImage( 1, 'cube_NX.png' );
loadCubemapImage( 2, 'cube_PY.png' );
loadCubemapImage( 3, 'cube_NY.png' );
loadCubemapImage( 4, 'cube_PZ.png' );
loadCubemapImage( 5, 'cube_NZ.png' );

var eyeItaPoly = new ItaPoly( 1024, 1024 );
requestText( '../color.frag', function( _text ){
	eyeItaPoly.createProgram( _text, function(){
		var randomTexture = [];
		for( var i=0; i<256*256*4; i++ ){
	    randomTexture[ i ] = ~~( Math.random() * 256 );
	  }
	  eyeItaPoly.setSampler2DFromArray( 'randomTexture', randomTexture, 256, 256 );
		eyeItaPoly.setVec2( 'resolution', [ 1024, 1024 ] );
		eyeItaPoly.update();
		ready();
	} );
} );

var ready = function(){
  if( !this.count ){ this.count = 9; }
  this.count --;

  if( this.count === 0 ){
    console.log( 'go!' );
		go();
  }else{
    console.log( 'ready : ' + this.count );
  }
};

var go = function(){
  var program = createProgram( vert, frag );

  var sphereBuffer = createSphereArray( 32, 48, 1 );

	var eyeTexture = createTexture();
	setTexture( eyeTexture, eyeItaPoly.canvas );
	var cubemapTexture = createCubemap( cubemapImages );

  var beginTime = ( +new Date() );
  var update = function(){
    var time = ( ( +new Date() ) - beginTime ) * 0.001;

    // pass
    ( function(){
      gl.viewport( 0, 0, canvas.width, canvas.height );
      gl.useProgram( program );
      gl.bindFramebuffer( gl.FRAMEBUFFER, null );

      gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
      gl.clearDepth( 1.0 );
      gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

      attribute( program, 'position', sphereBuffer.position, 3 );
      attribute( program, 'normal', sphereBuffer.normal, 3 );
      attribute( program, 'uv', sphereBuffer.uv, 2 );
      gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, sphereBuffer.index );

      uniform2fv( program, 'resolution', [ canvas.width, canvas.height ] );
      uniform1f( program, 'time', time );
			uniformTexture( program, 'eyeTexture', eyeTexture, 0 );
      uniformCubemap( program, 'cubemap', cubemapTexture, 1 );

      gl.drawElements( gl.TRIANGLES, sphereBuffer.index.length, gl.UNSIGNED_SHORT, 0 );
//			gl.drawArrays( gl.TRIANGLES, 0, sphereBuffer.position.length / 3 );
    } )();

    requestAnimationFrame( update );
  };
  requestAnimationFrame( update );
};
