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
	resultado.regexProyecto = new RegExp(config.nivel1, "i");
	resultado.proyectos = [];
	
	//buscamos proyectos en origen
	buscarProyectos(resultado);
	/*
				{ name: 'A-001', path: 'origen\\A-001' },
	*/
	
	//buscamos ficheros en origen por patrones. tb tenemos destinos y los que no existen en local
	buscarFicherosLocales(resultado);
	/*
				{ name: 'A-001',
				  path: 'origen\\A-001',
				  ficheros:
				   [ { name: 'Documento 1',
					   patron: '01-Doc.docx',
					   destino: [Array],							//destinos donde copiar
					   origenpath: 'origen\\A-001\\01-Doc.docx' },	//si no existe esto es que no existe en local
					 { name: 'Documento de tests',
					   patron: '02-Test.docx',
					   destino: [Array] } ] }
	*/
	
	//TODO existen en destino??
	//mirarSiExistenEnDestino(resultado);
	
	//TODO generar informe
	informe(resultado);
});


//MODULO 1: BUSCAR PROYECTOS
function buscarProyectos(resultado){
	var arbolOrigen = dirTree(resultado.origen, {});
	buscarProyectosRecursivamente(arbolOrigen, resultado);	
	//resultado.proyectos = {'A001':{},'B002':{}};
}

function buscarProyectosRecursivamente(map, resultado){
	if(!map.children) return;
	forEach.call(map.children, function(child) {
		if(child.type=='directory' && resultado.regexProyecto.test(child.name)){
			resultado.proyectos.push({name:child.name, 'path':child.path});
		}else{
			if(child.children){
				buscarProyectosRecursivamente(child, resultado);
			}
		}
	});
}

//MODULO 2: BUSQUEDA FICHEROS LOCALES
function buscarFicherosLocales(resultado){	
	var ficherosAbuscar = config.ficheros2;
	resultado.proyectos.forEach(function(proyecto) { //por cada proyecto
		proyecto.ficheros = JSON.parse(JSON.stringify(ficherosAbuscar)); //asignamos estructura estandar
		proyecto.ficheros.forEach(function(fichero){
			buscarFicheroEnDirectorio(fichero, proyecto);
		});
	});	
}

function buscarFicheroEnDirectorio(fichero, rutaProyecto){
	//solo busca en el raiz
	var arbolProyecto = dirTree(rutaProyecto.path, {});
	if(carpetaVacia(arbolProyecto)) {return;}
	
	var regex = new RegExp(fichero.patron,"i");	
	forEach.call(arbolProyecto.children, function(fichEnRuta) {
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
	
	fs.readdirSync(config.destino).forEach(file => {
	  console.log(file);
	})
	
	//mapeo destino
	//var arbolProyecto = dirTree(rutaProyecto.path, {});
	
	
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
	
}


//MODULO 4 : INFORME FINAL
function informe(resultado){
	console.log('#################################');
	console.log('##           INFORME           ##');
	console.log('#################################');
	
	resultado.proyectos.forEach(function(proyecto) { //por cada proyecto
		console.log(proyecto.name.bgBlack.bold);
		proyecto.ficheros.forEach(function(fichero){
			console.log('\t-'+fichero.name.underline);
			if(fichero.hasOwnProperty('origenpath')){
				console.log('\t\tEXISTE: SI'.green);
				console.log('\t\tDESTINOS:'+fichero.destino);
			}else{
				console.log('\t\tEXISTE: NO!'.red);
			}
			
		});
	});
}



