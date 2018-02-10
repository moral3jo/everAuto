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
			console.log('#N1#'+child.name);
			buscarFicheros(child);
		}else{
			if(child.children) 
				buscarNivel(child, regex);
		}
	});
}

function buscarFicheros(rutaProyecto){
	//TODO: detectar si faltan documentos
	if(carpetaVacia(rutaProyecto)) {return;}
	
	var ficherosadetectar = config.ficheros;
	
	forEach.call(rutaProyecto.children, function(child) {
		if(child.type=='file'){
			var destinos = destinosdedocumento(child.name, ficherosadetectar);
			if(destinos!=null){
				console.log('## '+child.path+" -> "+destinos);
			}
		}
	});
}

function destinosdedocumento(ficheroActual, ficherosadetectar){
	var listadoFicheros = Object.keys(ficherosadetectar);
	
	for (var i=0;i<listadoFicheros.length; i++) {
		var regex = new RegExp(listadoFicheros[i],"i");
		if(regex.test(ficheroActual)){
			return ficherosadetectar[listadoFicheros[i]];
		}
	}
	return null;
}

function carpetaVacia(carpeta){
	return typeof carpeta.children !== 'undefined' && carpeta.children.length==0;
}