var width = 1024;
var height = 1024;

var itaPoly = new ItaPoly( width, height );
document.body.appendChild( itaPoly.canvas );

var randomTexture = [];

var ready = function(){
  if( typeof this.count !== 'number' ){ this.count = 0; }
  else{ this.count ++; }

  if( this.count === 0 ){

    requestText( 'color.frag', function( _text ){
      itaPoly.createProgram( _text, function(){
        ready();
      } );
    } );

  }else if( this.count === 1 ){

    go();

  }
};
ready();

var go = function(){
  var beginTime = ( +new Date() );

  itaPoly.setVec2( 'resolution', [ width, height ] );

  for( var i=0; i<256*256*4; i++ ){
    randomTexture[ i ] = ~~( Math.random() * 256 );
  }
  itaPoly.setSampler2DFromArray( 'randomTexture', randomTexture, 256, 256 );
  ready();

  var update = function(){
    itaPoly.setFloat( 'time', ( ( +new Date() ) - beginTime ) * 0.001 );
    itaPoly.update();
    // requestAnimationFrame( update );
  }
  update();
};
