
function Stats(experiencia){
    function calculoDeNivel(exp){
        //Robada de un jueguito de pokemon (raiz cubica de exp)
        return Math.floor(Math.pow(experiencia, 0.334));
    }
    nivel = calculoDeNivel(exp);

    function plusAtaque(){
        return (nivel-2 > 0) ? nivel-2 : 0;
    }

    function plusDefensa(){
        return (nivel-2 > 0) ? nivel-2 : 0;
    }
    function plusAgilidad(){
        return (nivel-2 > 0) ? nivel-2 : 0;
    }
    return{
        nivel: nivel,
        vida: 100 + nivel*5,
        ataque: 1 + plusAtaque(),
        defensa: 0 + plusDefensa(),
        agilidad: 1 + plusAgilidad(),
    }
}

function Jugador(nombre, clientId) {
    return {
        id: null,
        clientId: clientId,
        nombre : nombre,
        //stats: Stats(0), por ahora no.
        vida : 100,
        dinero : 0,
        posicion: Punto(0,0),
        //casillero: Casillero(Punto(0,0)),
        mapa : 0,
        delta : 2,
        recompensa: 100,
        //casillero: null, -> que el jugador conozca al casillero en el que esta, servira en un futuro por ej. si los casilleros tienen efectos sobre los q lo ocupan
        inventario: [],
        //experiencia: 0,

        send: function(paquete){
            console.log("Envio a " + this.nombre + ": " + paquete);
            this.clientId.send(paquete);
        },
        daniar: function(puntosDeDanio){
            this.vida -= puntosDeDanio;
        },
        estaVivo: function(){
            return this.vida > 0;
        },
        getRecompensa: function(){
            //Esto es lo que obtendra el jugador que me mate
            return this.recompensa  + Math.floor(this.dinero*0.75);
        },
        incrementarDinero: function(dineroAdicional){
            this.dinero += dineroAdicional;
        },
        close: function(){
            jugadores.salirbroadcast(this.clientId);
            escenario.sacarJugador(this.posicion);
            this.clientId.close();
        },
        mover: function(delta){
            this.delta = delta;
            posActual = this.posicion;
            
            posDeseada = Punto.suma(posActual, Direccion(delta));   

            if(escenario.puedeOcuparse(posDeseada)){
                this.posicion = posDeseada;
                escenario.desplazar(this, posActual, posDeseada);
                jugadores.broadcast(JSON.stringify({tipo: "mover", nuevaPosicion: posDeseada.toString(), delta: delta, nombre:this.nombre}));  //Le aviso a todos los jugadores la movida
            }else{
                console.log("No puede ocupar la pos " + posDeseada.toString());
            }
        },   
        morir: function(){
            escenario.sacarJugador(this.posicion);
            this.close();
            //aca tambien puede hacerse que suelte algun loot o alguna otra cosa que pase al morir
        },

        atacar : function(){
            //Ataca al que este un cuadrado en frente
            var coordEnFrente = Punto.suma(this.posicion, Direccion(this.delta));

            enemigoEnFrente = escenario.getOponente(coordEnFrente);

            if(enemigoEnFrente != null){
                var poderOfensivo = Math.floor(Math.random() * 30) + 1;
                enemigoEnFrente.daniar(poderOfensivo);
            
                if(!enemigoEnFrente.estaVivo()){
                    premio = enemigoEnFrente.getRecompensa();
                    console.log("El premio es de " + premio); 
                    this.send(JSON.stringify({tipo:"muerte", nombreEnemigo: enemigoEnFrente.nombre, asesino: this.nombre, premio: premio}));
                    golpeador.incrementarDinero(premio);
                    enemigoEnFrente.morir();
                }else{
                    this.send(JSON.stringify({tipo: "golpe", golpe:poderOfensivo, golpeador: this.nombre, nombreEnemigo:enemigoEnFrente.nombre, vidaOponente:enemigoEnFrente.vida}));
                    enemigoEnFrente.send(JSON.stringify({tipo: "mepego", golpe:poderOfensivo, nombreGolpeador:this.nombre, vida:enemigoEnFrente.vida}));
                }
           }
        },
    }
} 


var homeJugadores = {
	jugadores: [], //Todos los jugadores registrados
	conectados: [], //solo los conectados en este momento
	//jugadoresOnline: [],
	buscarPorNombre: function(unNombre){
		for (var i = this.jugadores.length - 1; i >= 0; i--) {
			if(this.jugadores[i].nombre === unNombre){
				return this.jugadores[i];
			}
		};
		//SELECT en la tabla de la BD..?

		return null;
	},
	buscarPorId: function(unId){
		for (var i = this.jugadores.length - 1; i >= 0; i--) {
			if(this.jugadores[i].id === unId){
				return this.jugadores[i];
			}
		};
		//SELECT en la tabla de la BD..?

		return null;
	},
	registrar: function(nombre, clientId){
		if(this.buscarPorNombre(nombre) != null){
			///INSERT en la tabla de la BD
			nuevoJugador = Jugador(nombre, clientId);
			this.jugadores.push(nuevoJugador);
			console.log("Se registro correctamente al nuevo jugador "+nuevoJugador.nombre);
		}else{
			console.log("Error, "+nombre+" ya estaba registrado!");
		}
	},
	agregarNuevoConectado: function(nombre, clientId){
		nuevoConectado = {nombre: nombre, clientId: clientId};
		conectados.push(nuevoConectado);
	},
	eliminar: function(nombreJugador){
		for (var i = this.jugadores.length - 1; i >= 0; i--) {
			if(this.jugadores[i].nombre === nombreJugador){
				///DELETE en la BD
				this.jugadores.splice(i,1);
				console.log("Se elimino a "+nombreJugador+" correctamente.");
				return;
			}
		};
		console.log("No se pudo eliminar a "+nombreJugador+", no esta registrado!");
	},
	
	login: function(nombreJugador, password, clientId){

		jugadorEntrante = this.buscarPorNombre(nombreJugador);
		if(jugadorEntrante != null){
		 	//Usuario existente
			if(this.validarContrasenia(nombreJugador, password)){
			 	//Clave correcta -> ingreso OK
			 	this.agregarNuevoConectado(nombre, clientId);
			}else{
			 	//Clave incorrecta -> vuelva a intentarlo
			 	console.log(nombreJugador+", clave invalida.");
			 	return false;
		 	}
		}else{
			//Usuario inexistente -> registrarse
		 	console.log("Error, "+nombreJugador+" no está registrado! ");

		}
	},
	logout: function(nombreJugador, clientId){
		for (var i = 0; i < this.conectados.length; i++) {
			if(this.conectados[i].clientId === clientId){
				this.conectados.splice(i,1);
				console.log(this.conectados[i].nombre + " se ha deslogueado. ");
				return;
			}
		};
	},
	validarContrasenia: function (nombre, contrasenia) {
		esValida = true;  // <-- SELECT en la tabla de USUARIOS, reviso si la clave es valida para el usuario.
		//esValida = contrasenia == "pepita";

		return esValida;
	}
}

