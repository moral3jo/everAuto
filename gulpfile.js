const gulp = require('gulp');
const dirTree = require('directory-tree');
var jsonfile = require('jsonfile')
var colors = require('colors');
const fs = require('fs');

var forEach = Array.prototype.forEach;

var config = require('./config.json');
var mapdestino,maporigen;

gulp.task('default', [ 'modulos' ]);

gulp.task('modulos', function(){
	var resultado = {};
	resultado.origen = config.origen;
	resultado.ficheros = [];
	
	//buscamos ficheros en la carpeta origen. Tb tenemos destinos y los que no existen en local
	buscarFicherosLocales(resultado);
	
	resultado.nombreProyecto = getCurrentDirectoryName(); //TODO: SACAR DE CARPETA ACTUAL
	
	//TODO existen en destino??
	//mirarSiExistenEnDestino(resultado);
	
	//TODO generar informe
	informe(resultado);
	//console.log(resultado);
});

//MODULO 1: BUSQUEDA FICHEROS LOCALES
function buscarFicherosLocales(resultado){	
	var ficherosAbuscar = config.ficheros2;
	resultado.ficheros = JSON.parse(JSON.stringify(ficherosAbuscar)); //asignamos estructura estandar
	resultado.ficheros.forEach(function(fichero){
		buscarFicheroEnDirectorio(fichero, config.origen);
	});
}

function buscarFicheroEnDirectorio(fichero, rutaFicheros){
	var arbolFicheros = dirTree(rutaFicheros, {});
	if(carpetaVacia(arbolFicheros)) {return;}
	
	var regex = new RegExp(fichero.patron,"i");	
	forEach.call(arbolFicheros.children, function(fichEnRuta) {
		if( (fichEnRuta.type=='file') && (regex.test(fichEnRuta.name)) ){
			fichero.origenpath = fichEnRuta.path;
		}
	});	
}

function carpetaVacia(carpeta){
	return typeof carpeta.children !== 'undefined' && carpeta.children.length==0;
}

//MODULO 3 : MIRAR SI EXISTEN EN DESTINO
function mirarSiExistenEnDestino(resultado){
	//TODO: NO PUEDO MAPEAR TODO DESTINO, ES ENORME Y NO ME INTERESA
	//DESTINO/XXXXXXXXXXXXXXXXnombreComun/<<AQUI EMPEZAR A BUSCAR RECURSIVAMENTE>>
	
	console.log('mirara si existe destino');
	console.log(resultado);
	
	
	var proyectos = safeReadDirSync(config.destino);
	if(proyectos==null) return;
	
	var regex = new RegExp(resultado.nombreProyecto);
	
	for (i=0; i<proyectos.length;i++) {
		if(regex.test(proyectos[i])){
			console.log('proyecto destino encontrado');
			console.log(proyectos[i]);
		}
	}
	
	//mapeo destino
	//var arbolProyecto = dirTree(rutaProyecto.path, {});
	
/*	
	//recorro cada proyecto
	resultado.proyectos.forEach(function(proyecto) { //por cada proyecto
		proyecto.ficheros.forEach(function(fichero){ //por cada fichero
			if(fichero.hasOwnProperty('origenpath')){//si existe en origen
				fichero.destino.forEach(function(destino){//por cada destino
					var arbolDestino = dirTree(config.destino+destino, {});//mapeo destino
					console.log('mapeo')
					console.log(config.destino+destino);
					console.log(arbolDestino);
					var regex = new RegExp(fichero.patron,"i");	
					forEach.call(arbolDestino.children, function(fichEnRuta) {
						console.log(fichEnRuta);
						if( (fichEnRuta.type=='file') && (regex.test(fichEnRuta.name)) ){
							console.log('encontrado!!!');
						}
					});	
				});
				//con el patron busco fichero alli y marco resultado
			}
		});
	});
	*/
}

function safeReadDirSync (path) {
	let dirData = {};
	try {
		dirData = fs.readdirSync(path);
	} catch(ex) {
		if (ex.code == "EACCES")
			//User does not have permissions, ignore directory
			return null;
		else throw ex;
	}
	return dirData;
}


//MODULO 4 : INFORME FINAL
function informe(resultado){
	console.log('#################################');
	console.log('##           INFORME           ##');
	console.log('#################################');
	
	console.log(resultado.origen.bgBlack.bold);
	resultado.ficheros.forEach(function(fichero){
		process.stdout.write('\t-'+fichero.name.underline+":");
		if(fichero.hasOwnProperty('origenpath')){
			console.log(' EXISTE'.green);
			console.log('\t\tDESTINOS:'+fichero.destino);
		}else{
			console.log(' NO EXISTE'.red);
		}
		
	});
}


function getCurrentDirectoryName() { 
	var fullPath = __dirname; 
	var path = fullPath.split('/'); 
	var cwd = path[path.length-1]; 
	return cwd; 
}

