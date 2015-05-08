var rootPath = "Graficos/items/";

function Stat(statName, value){
    return {statName: statName, value: value};
}


function Comida(){
    //Comidas
    //Las comidas son consumibles, recuperan HP al usarse
}
function Pocoin(nombre,valor){
	//Consumibles, al usarse incrementan nuestros stats por un tiempito.
    return{
        nombre: nombre,
        valor: valor
    }
}
function Otro(){
    //otras cosas como: TNT, bolas de nieve, etc...
    //Seran distintas utilidades para ayudarnos en el combate o perjudicar a nuestros enemigos
}

function Material(nombre, poderOfensivo, poderDefensivo, vidaUtil, factorValor){
    //Define un material ej. diamante, oro etc.
    return {
        nombre: nombre,
        vidaUtil: vidaUtil,
        poderOfensivo: poderOfensivo,
        poderDefensivo: poderDefensivo, 
        valor: factorValor,//Es el costo base de tener "una" unidad
        toString: function(){
            return this.nombre;
        },
    }
}

var madera = Material("wooden",1,1,20,5);
var cuero = Material("leather",2,1,30,8);
var piedra = Material("stone",2,2,60,10);
var chainmail = Material("chainmail",2,3,80,15);
var hierro = Material("iron", 3,3,150,30);
var oro = Material("gold",4,3,120,60);
var diamante = Material("diamond", 6,5,250,150);


function Herramienta(nombre, factorOfensivo, factorVelocidad, factorDefensivo, factorValor){
    //Define una herramienta de equipamiento (ej. espada, armadura, etc)


    return{
        nombre: nombre,
        stats: stats
        factorOfensivo: factorOfensivo, //Es cuanto poderOfensivo nos aporta el material
        factorDefensivo: factorDefensivo, //Representa cuanto poderDefensivo me aportara el material 
        factorVelocidad: factorVelocidad,
        factorValor: factorValor, //Representa la cantidad de materiales que necesito para tenerlo
        toString:function() {
            return this.nombre;
        }
    }
}

//var arco = Herramienta("arco", 3, 0, 2); POR AHORA NO HAY ARCO
var hoz = Herramienta("hoe", 3, 5, 0, 3);
var hacha = Herramienta("axe", 6, 1, 0, 3);
var espada = Herramienta("sword", 4, 2, 0, 3);
var casco = Herramienta("helmet", 0, 0, 2, 5);
var chaleco = Herramienta("chestplate", 0, 0, 4, 8);
var pantalones = Herramienta("leggings", 0, 0, 3, 6);
var botas = Herramienta("boots", 0, 0, 1, 4);
var escudo = Herramienta("shield", 0, 0, 5, 5);

function Equipamiento(material, herramienta){
    //Define un arma/armadura concreta a partir de su material y herramienta
    //Ej. espada de diamante.
    strMaterial = material.toString();
    strHerramienta = herramienta.toString();
    materialConvertido = strMaterial.charAt(0).toUpperCase() + strMaterial.substr(1);
    herramientaConvertido = strHerramienta.charAt(0).toUpperCase() + strHerramienta.substr(1);
    stats = [];
    stats.push(Stat("ataque", material.poderOfensivo * herramienta.factorOfensivo));
    stats.push(Stat("defensa", material.poderDefensivo * herramienta.factorDefensivo));
    //stats.push(Stat("vidaUtil", material.vidaUtil);
    return{
        _id: null, 
        name: strMaterial + strHerramienta,
        path: rootPath + "combat/equipamiento/" + material.toString() + herramienta.toString() + "_icon32.png",
        cost: material.valor * herramienta.factorValor;
        stats: stats,   
        /*gastar: function(valorConsumo){
            this.vidaUtil-= valorConsumo;
            if(this.vidaUtil <= 0){
                //this.destruir();
            }
        },*/
        toString: function(){
            return materialConvertido +' '+herramientaConvertido;
        }
        getStatValue: function(statName){
            for (var i = 0; i < this.stats.length; i++) {
                if(this.stats[i].statName == statName){
                    return this.stats[i].value;
                }
            };
        },
        
        getCosto: function(){
            return this.cost;
        },
    }
}

var materiales = [madera, cuero, piedra, chainmail, hierro, oro, diamante];
var herramientas = [espada, hacha, hoz, casco, chaleco, pantalones, botas];

var homeItems = {
    equipos: [],
    //comida: [], por ahora no
    //otros: [], por ahora menos

    inicializar: function(){
        for (var i = 0; i < materiales.length; i++) {
            for (var j = 0; j < herramientas.length; j++) {
                nuevoItem = Equipamiento(materiales[i], herramientas[j]);      
                if(nuevoItem.esValido()){
                    this.equipos.push(nuevoItem);
                }
            };
        }
        console.log("Se inicializo el home de items!!!");
    },
    buscarPorId: function(idItem){
        for (var i = 0; i < this.equipos.length; i++) {
            if(this.equipos[i]._id === idItem){
                return this.equipos[i];
            }
        };
        return null;
    },
    buscarPorNombre: function(nombre){
        for (var i = 0; i < this.equipos.length; i++) {
            if(this.equipos[i].nombre === nombre){
                return this.equipos[i];
            }
        };
        return null;
    },
    populate: function(unaLista, unCriterio){
    	//llena una lista que recibimos, con todos aquellos items que cumplen unCriterio.
    	//Es decir, todos aquellos items que hacen que unCriterio devuelva true (ej. material.toString()==="diamante");
    	for (var i = 0; i < this.equipos.length; i++) {
    		if(unCriterio(this.equipos[i])){
    			unaLista.push(this.equipos[i]);
    		}
    	};
    }
}

module.exports = homeItems;
