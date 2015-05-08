//var homeItems = require('./homeItems.js');
//homeItems.inicializar(); 
//var homeJugadores = require('./homeJugadores.js'); <-- PROXIMAMENTE
var server = require('websocket').server.listen(8080);

/** TEST DE QUE EL HOME ANDA *** (Noel: BORRAR luego de verificar) (Lo dejo para otro, en un futuro, muy copado!)
espaditaPro = homeItems.buscarPorNombre("ironsword");
console.log("La espadita:"+JSON.stringify(espaditaPro));
console.log("el costo es" + espaditaPro.getCosto());
otraEpsadita = homeItems.buscarPorNombre("diamondsword");
console.log("Esta es mas grosa:"+JSON.stringify(otraEpsadita));
console.log("Y la de DIAMANTE sale: "+otraEpsadita.getCosto()+" ... esta salada. Aparte su vida util es "+otraEpsadita.getVidaUtil());
*/
var configuracion = {
    Version : "Alpha",
    Autores : "Puerta 18"
    //INTERVALOS
}


function Punto(x, y) {
    return {
        x: x,
        y: y, 
        sumar: function(otroPunto) {
            //incrementa el valor de un punto, en otro (devuelve el punto inicial pero incrementado)
            this.x += otroPunto.x;
            this.y += otroPunto.y;
            return this;
        },
        esIgualA: function(otroPunto){
            return (this.x == otroPunto.x) && (this.y == otroPunto.y);
        },
        toString:function(){
            str = "("+this.x+","+this.y+")";
            return str;
        },
        estaEntre: function (puntoMin, puntoMax) {
            return this.x >= puntoMin.x && this.x <= puntoMax.x &&
                   this.y >= puntoMin.y && this.y <= puntoMax.y;
        }
    }
}

Punto.suma = function(unPunto, otroPunto){
    //devuelve un NUEVO punto que es la suma de otros dos
    return this(unPunto.x+otroPunto.x, unPunto.y + otroPunto.y);
};

function Direccion(delta){
    //Constructor de un objeto que recibe el "delta" y devuelve el punto que corresponde
    arriba = Punto(0,1);
    derecha = Punto(1, 0);
    abajo = Punto(0,-1);
    izquierda = Punto(-1,0);
    switch(delta){
        case 0: return arriba;
        case 1: return derecha;
        case 2: return abajo;
        case 3: return izquierda;
    }
}

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

function Jugador(nombre, sprite, clientId) {
    return {
        id: null,
        clientId: clientId,
        nombre : nombre,
        //stats: Stats(0), por ahora no.
        vida : 100,
        dinero : 25,
        posicion: Punto(0,0),
        combate: true,
        sprite: sprite,
        //casillero: Casillero(Punto(0,0)),
        mapa : 0,
        delta : 2,
        recompensa: 100,
        //casillero: null, -> que el jugador conozca al casillero en el que esta, servira en un futuro por ej. si los casilleros tienen efectos sobre los q lo ocupan
        inventario: [[items.pocionP,3],[items.pocionM,2],[items.pocionG,1]],
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
        },/////////////////////////INVENTARIO NOEL
        consumir: function(pos){
            if(this.inventario[pos]!= null && this.inventario[pos][1] >= 1){
                this.inventario[pos][1] -= 1;
                this.vida += this.inventario[pos][0][1];
                if(this.vida >= 100){
                    this.vida = 100;
                }
                this.clientId.send(JSON.stringify({tipo:"consumir", nombre: this.nombre, oro:this.dinero, compra:false, vida: this.vida, inventario: this.inventario}));
            }else{
                this.clientId.send(JSON.stringify({tipo:"mensaje", nombre: this.nombre, mensaje:"No tienes la cantidad necesaria!"}));
            }

        },
        comprar: function(pos){            
        if(this.inventario[pos]!= null){
            precio = items.getPrecio(this.inventario[pos][0]);
            if(precio <= this.dinero){
                this.inventario[pos][1] += 1;
                this.dinero -= precio;
                this.clientId.send(JSON.stringify({tipo:"consumir", nombre: this.nombre, oro:this.dinero, compra:true, vida: this.vida, inventario: this.inventario}));
            }else{
                this.clientId.send(JSON.stringify({tipo:"mensaje", nombre: this.nombre, mensaje:"No tienes el dinero necesario!"}));
            }
        }

        },/////////////////////////INVENTARIO NOEL
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
        getCombate: function(){
            return this.combate;
        },
        atacar : function(){
            //Ataca al que este un cuadrado en frente
            var coordEnFrente = Punto.suma(this.posicion, Direccion(this.delta));

            enemigoEnFrente = escenario.getOponente(coordEnFrente);
            //Compruebo que exista enemigo, que mi enemigo este en modo combate y que luego, yo tambien este en modo combate  
            
            if(enemigoEnFrente != null && enemigoEnFrente.getCombate() == true && this.combate == true){
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

            }else if(enemigoEnFrente != null && enemigoEnFrente.getCombate() == false){
                    this.send(JSON.stringify({tipo: "mensaje", nombre:this.nombre, mensaje:"No puedes pegarle a "+enemigoEnFrente.nombre+" porque no está en modo combate."}));
                
            }else if(enemigoEnFrente != null && this.combate == false){
                    this.send(JSON.stringify({tipo: "mensaje", nombre:this.nombre, mensaje:"No puedes pegarle a "+enemigoEnFrente.nombre+" porque no estas en modo combate."}));
            }else {
                var mensajes = ["¿Acaso quieres atrapar una mosca que le pegas al aire?","¿¡Eres ciego!? No ves que no hay nadie allí?","..¿Practicando tus movimientos?"];
                var aleatorio = Math.floor(Math.random() * 3);
                
                console.log(mensajes[aleatorio]);
                this.send(JSON.stringify({tipo: "mensaje", nombre:"Dios", mensaje:mensajes[aleatorio]}));
            }
        },
    }
} 

function Casillero(coord) {
    return {
        coordenada: coord,
        contenido: [],
        personaje: null,
        getContenido: function(){
            //el contenido puede ser un item o un personaje-jugador
            return this.contenido;
        },
        setContenido: function(nuevoContenido){
            //le seteamos al casillero un objeto
            this.contenido = nuevoContenido;
        },
        setPersonaje: function(personaje){
            this.personaje = personaje;
        },
        getPersonaje: function(){
            return this.personaje;
        },
        getPos: function(){
            return this.coordenada;
        },
        estaVacio: function(){
            return this.contenido.length == 0; //Nos dice si esta ocupado con algo o no  (booleano)
        },
        sePuedePisar: function(){
            //Sólo se puede pisar si nadie mas lo esta pisando
            return this.personaje == null;
        },
        toString: function(){
            return "casillero: " + this.coordenada.toString();
        }
    }
}

var escenario = {
    cuadrilatero: [],
    puntoMin: Punto(0, 0), //puntoMin y Max son las esquinas del "gran cuadrado" de casilleros
    puntoMax: Punto(44, 16), //representan los límites NOTA deben ser positivos. Para correr el cuadrilaterio, hacer un corrimiento "general" a nivel grafico

    inicializar: function(){
        //Aqui va la logica de construccion inicial del escenario (podria exteriorizarse en 
         // un archivo de configuracion o base de datos, hecho por nosotros)
        
        for (var columna = this.puntoMin.x; columna <= this.puntoMax.x; columna++) {
            this.cuadrilatero[columna] = [];
            for (var fila = this.puntoMin.y; fila <= this.puntoMax.y; fila++) {
                pos = Punto(columna,fila);
                this.cuadrilatero[columna][fila] = Casillero(pos);
                //console.log("Iniciado " + this.cuadrilatero[columna][fila].toString());
            };
        };
    },

    desplazar: function(personaje, coordInicial, coordFinal){
        this.sacarJugador(coordInicial);
        if(coordFinal != null){
            this.getCasillero(coordFinal).setPersonaje(personaje);
        }
    },
    sacarJugador: function(coord){
        this.getCasillero(coord).setPersonaje(null);
    },
    getCasillero: function(pos){
        console.log("El casillero devuelto sera en la pos " + pos.toString());
        return this.cuadrilatero[pos.x][pos.y];
    },
    esCasilleroValido: function(pos){
        //Devuelve si el casillero esta dentro de los limites del mapa
        return pos.estaEntre(this.puntoMin, this.puntoMax);
    },
    puedeOcuparse:function(posCasillero){
        if(this.esCasilleroValido(posCasillero)){
            return this.getCasillero(posCasillero).sePuedePisar();
        }else{
            return false;
        }
    },
    getOponente: function(coord){    
        //Veo si tengo al enemigo en frente...
        //Si no ta en frente -> devuelvo "null" (no hay enemigo)
        if(this.esCasilleroValido(coord)){            
            return this.getCasillero(coord).getPersonaje();
        }
        return null;        
    },

    // Ideas: 
        /// hacer metodos como fila: y columna: ; que recorran una fila o columna. Puede servir para disparar proyectil
        /// aqui podrian ir las reglas del escenario (ej. dungeon - bossFight - arena - shop)
}

var jugadores = {
    lista: [],
    agregarJugador : function(nombre, sprite, clientId) {

        nuevoJugador = Jugador(nombre, sprite, clientId);
        this.lista.push(nuevoJugador);
        
        nuevoJugador.send(JSON.stringify("Bienvenido "+nuevoJugador.nombre+" has sido agregado a la lista de jugadores"));
        nuevoJugador.send(JSON.stringify({tipo:"setinventario", inventario:nuevoJugador.inventario}));
        nuevoJugador.send(JSON.stringify({tipo:"elnuevo", jugadores: this.lista}));
        this.broadcast(JSON.stringify({tipo:"bienvenida",nombre: nuevoJugador.nombre, sprite:nuevoJugador.sprite}));

        console.log(nuevoJugador.nombre+" ha entrado al mundo.");
        //unaEspada = homeItems.buscarPorNombre("ironsword");
        //unaEspada.posicion = Punto(6,8);
        
        /*
        for (var i = escenario.puntoMin.x; i < escenario.puntoMax.x; i++) {
            for (var j = escenario.puntoMin.y; j < escenario.puntoMax.y; j++) {
                //nuevoJugador.send(JSON.stringify({tipo: "nuevoItem", nombre: "espada"+i+j, path: unaEspada.path, posicion: Punto(i,j)}));

            };
        }; */
            
        //nuevoJugador.send(JSON.stringify({tipo: "nuevoItem", nombre: "doniaPepa", path: unaEspada.path, posicion: unaEspada.posicion}));
        /*
        nuevoJugador.send(JSON.stringify({tipo: "nuevoItem", nombre: unaEspada.nombreVisual, path: unaEspada.path, posicion: Punto(2,2)}));
        */
        //unaEspada.posicion = Punto(8,8);
        //nuevoJugador.send(JSON.stringify({tipo: "nuevoItem", nombre: "pepitaLaLoca", path: unaEspada.path, posicion: unaEspada.posicion}));
        //nuevoJugador.send(JSON.stringify({tipo: "nuevoItem", nombre: unaEspada.nombreVisual, path: unaEspada.path, posicion: Punto(2,2)}));

    },

    indice: function(nombre){
        //Busca el jugador por su nombre y lo devuelve
        for(var i = 0; i < this.lista.length; i++){
            if(this.lista[i].nombre == nombre)
            {
                return this.lista[i];
            }
        }
        return null;
    },

    broadcast : function(mensaje) {
        console.log("Broadcasting: " + mensaje);
        for(var h = 0; h < this.lista.length; h++) {
            this.lista[h].clientId.send(mensaje);
        }
    },

    salirbroadcast : function(idDesconectado) {

        var Nombre = "";
        var conexiones = this.lista;

        for (var i = 0; i < conexiones.length; i++) {
            if(conexiones[i].clientId==idDesconectado){
                Nombre = conexiones[i].nombre;
                console.log("Se quita de la lista de jugadores conectados a: " + Nombre);
                this.lista.splice(i,1);
            }
        };
        console.log("Se desconecto el cliente "+Nombre);
        this.broadcast(JSON.stringify({nombre:Nombre, tipo:"sacar"}));
    },
};

var items = {
    //Muy Casero es esto... Nombre, Valor de vida que suma, Precio, Grafico
    pocionP: ["Pocion Pequeña",10,10,"pota-vida.png"],
    pocionM: ["Pocion Pequeña",20,18,"pota-2.png"],
    pocionG: ["Pocion Pequeña",35,25,"pota-vida.png"],

    getNombre : function(variable){
        return variable[0];
    },
    getValor : function(variable){
        return variable[1];
    },
    getPrecio : function(variable){
        return variable[2];
    },
    getGrafico : function(variable){
        return variable[3];
    }
}

var Fechaactual= new Date();

var chat = {
    dia:Fechaactual.getDate(),
    mes:Fechaactual.getMonth(),
    año:Fechaactual.getFullYear(),
    hora:Fechaactual.getHours(),
    minuto:Fechaactual.getMinutes(),
}

escenario.inicializar();
//-----------------------------------
server.onconnection = function(client) {
    var that = this;

    client.onmessage = function(event) {

        var player = JSON.parse(event.data);
        console.log("[SERV]Me llego el mensaje: " + JSON.stringify(player));

        if(player.tipo=="bienvenida"){ 
            if(jugadores.indice(player.nombre) == null){
                jugadores.agregarJugador(player.nombre, player.sprite, client);
            }else{
                client.send(JSON.stringify({tipo:"errorConexion"}));
                client.close();
            }
        }else if(player.tipo=="golpe"){ 
            golpeador = jugadores.indice(player.nombre);
            golpeador.atacar();

        }else if(player.tipo=="consumir"){ 
            jugador = jugadores.indice(player.nombre);
            
            jugador.consumir(player.obj);

        }else if(player.tipo=="comprar"){ 
            jugador = jugadores.indice(player.nombre);
            
            jugador.comprar(player.obj);

        }else if(player.tipo=="mover"){
            jugadorMovido = jugadores.indice(player.nombre);
            jugadorMovido.mover(player.delta); 
        }
        if(player.tipo=="combate") {
            console.log("Cambiando el modo de combate...");
            jugador = jugadores.indice(player.nombre);
            console.log(jugador.combate);
            if(jugador.combate == false){
                jugador.combate = true;
            }else{
                jugador.combate = false;
            }
            console.log(jugador.combate);
        };

        //Ideal: que trabaje con WebWorkers en segundo plano.
        if(player.tipo=="mensaje"){
            jugadores.broadcast(JSON.stringify({tipo:"mensaje", mensaje:player.mensaje, nombre:player.nombre}));
        }
    };

    client.onerror = function(event) {
        console.log("Cliente desconectado por error");
    };

    client.onclose = function(event) {
        jugadores.salirbroadcast(client);
    };
};

