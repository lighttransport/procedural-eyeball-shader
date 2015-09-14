function requestText( _url, _callback ){
  var xhr = new XMLHttpRequest();
  xhr.open( 'GET', _url, true );
  xhr.responseType = 'text';
  xhr.onload = function( _e ){
    _callback( this.response );
  };
  xhr.send();
}
