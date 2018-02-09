const gulp = require('gulp');
const dirTree = require('directory-tree');
var jsonfile = require('jsonfile')

var forEach = Array.prototype.forEach;

var config = require('./config.json');
var mapdestino,maporigen;

gulp.task('default', [ 'mapeardestino', 'mapearorigen', 'validar' ]);

gulp.task('mapeardestino', function(){
	mapdestino = dirTree(config.destino, {});
});

gulp.task('mapearorigen', function(){
	maporigen = dirTree(config.origen, {});
});

gulp.task('validar', function(){
	if(maporigen.children==null) {
		console.log("Error. carpeta vacia.");
		return;
	}
	var regex = new RegExp(config.nivel1,"i");
	buscarNivel(maporigen, regex);
});

function buscarNivel(map, regex){
	if(!map.children) return;
	forEach.call(map.children, function(child) {
		if(child.type=='directory' && regex.test(child.name)){
			buscarFicheros(child);
		}else{
			if(child.children) 
				buscarNivel(child, regex);
		}
	});
}

function buscarFicheros(rutaficheros){
	//TODO: detectar si faltan documentos
	if(typeof rutaficheros.children !== 'undefined' && rutaficheros.children.length==0) {
		//carpeta vacia pero era valida
		return;
	}
	
	forEach.call(rutaficheros.children, function(child) {
		if(child.type=='file'){
			var destinos = destinosdedocumento(child.name);
			console.log('## '+child.path+" -> "+destinos);
		}
	});
}

function destinosdedocumento(file){
	//TODO: cachear config.ficheros para evitar esto cada vez que buscamos
	var ficheros = config.ficheros;
	//TODO: pasar a expresion regular
	return ficheros[file];
}