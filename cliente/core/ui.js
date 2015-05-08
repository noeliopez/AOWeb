var ui = {
            webSocket: null,
            nombre: "Player",
            jugadores : [],
            ultimoDelta : 2,
            plata: 0,
            consola: false,
            sprite: "rogue",
            clickConectar : function() {
                var ipServidor =  $("#serverAddress").val();
                var puerto = $("#serverPort").val();
                this.nombre = $("#nombre").val();
                var that = this;
                var msjError = '';
                this.webSocket = new WebSocket('ws://' + ipServidor + ':' + puerto);
                this.sprite = $("#sprite").val(); //OBTENER EL SPRITE QUE SE ELEIGIO -BATMAN

                this.webSocket.onopen = function(event) {
                    $("#nombre").hide();
                    $("#btnConectar").hide();
                    $("#serverPort").hide();
                    $("#serverAddress").hide();
                    $("#barraGeneral").hide(); //BARRA CON TODO (INVENTAIRO, ETC) -BATMAN

                    $("#consola").show();
                    $("#entrada").show();
                    $("#inventory").show();
                    $("#barraGeneral").show(); //BARRA CON TODO (INVENTAIRO, ETC) -BATMAN
                    $("#errorLabel").hide();
                    that.webSocket.send(JSON.stringify({nombre:that.nombre, tipo:"bienvenida", sprite:that.sprite}));

                };

                this.webSocket.onmessage = function(event) {
                    console.log(event.data);
                    var datos = JSON.parse(event.data);
                    console.log("[UI]Me llego el mensaje: " + JSON.stringify(datos));

                    if(datos.tipo=="bienvenida" && datos.nombre!=ui.nombre ){
                      //  that.creador(datos.nombre, "character");
                        that.creador(datos.nombre, datos.sprite); //SETEAR EL SPRITE -BATMAN 

                    }else if(datos.tipo=="setinventario"){ // INVENTARIO NOEL!
                         inventario.inicializar(datos.inventario); // INVENTARIO NOEL!

                    }else if(datos.tipo=="consumir"){ // INVENTARIO NOEL!
                        $(".vidaVisible").animate({width: datos.vida + "%"}, 500);
                        $(".vidaVisible a").html(datos.vida + "%"); 
                        if(datos.compra==false){ 
                            pocionSound.play(); 
                        }else{
                            $("#plata").html(datos.oro);
                        }
                        inventario.inicializar(datos.inventario);

                    }else if(datos.tipo=="errorConexion"){
                        msjError = "El nombre de usuario "+ this.nombre + " ya está en uso!";
                        console.log(msjError);

                    }else if(datos.tipo=="elnuevo"){
                        for(var f = 0; f< datos.jugadores.length; f++){
                            //that.creador(datos.jugadores[f].nombre, "character");
                            that.creador(datos.jugadores[f].nombre, datos.jugadores[f].sprite); // SETEAR SPRITE -BATMAN
                            that.graficador2(datos.jugadores[f].nombre, datos.jugadores[f].posicion);
                        }
                    }else if(datos.tipo=="sacar"){
                        that.laparca(datos.nombre);

                    }else if(datos.tipo=="golpe"){
                        
                        pantalla.log("Tomá " + datos.nombreEnemigo, datos.golpeador);
                        console.log("Le has pegado a "+datos.nombreEnemigo+" por "+datos.golpe+". Ha quedado en "+datos.vidaOponente+" puntos de vida");

                    }else if(datos.tipo=="mepego"){

                        //$("#vida").html(datos.vida);
						$(".vidaVisible").animate({width: datos.vida + "%"}, 500);
						$(".vidaVisible a").html(datos.vida + "%");
                        console.log(datos.nombreGolpeador +" te ha pegado por "+datos.golpe+". Has quedado en "+datos.vida+" puntos de vida");
                        golpeSound.play();
                    }else if(datos.tipo=="muerte"){
                        that.plata += datos.premio;
                        $("#plata").html(that.plata);
                        pantalla.log("Ha matado a: "+datos.nombreEnemigo +" y ganas +" + datos.premio + " de oro.", datos.asesino);

                        console.log("Has matado a "+datos.nombreEnemigo);

                    }else if(datos.tipo=="mensaje"){
                        pantalla.log(datos.mensaje,datos.nombre);


                    }else if(datos.tipo=="mover"){
                        //console.log("Se mueve "+datos.nombre+" a la pos " +datos.nuevaPosicion + "con delta " +datos.delta);
                        console.log("Se mueve "+datos.nombre + "con delta " +datos.delta);                        
                        that.graficador(datos.nombre,datos.delta);
                    }else if(datos.tipo=="nuevoItem"){
                        that.creadorImg(datos.nombre, datos.path);
                        that.graficador2(datos.nombre, datos.posicion);
                    }
                
                };

                this.webSocket.onclose = function(event) {
                    
                    $("#consola").prepend("<p>Conexion perdida!</p>");
                    reloadPage();
                    $("#serverAddress").value(ipServidor);
                    $("#errorLabel").html('  ' + msjError);
                };
            },

            
            graficador : function(nombre, tipo){
                if(tipo==0){
                    $("#"+nombre).animate({
                           'top':'-=32px'
                    },100);
                }
                if(tipo==1){
                    $("#"+nombre).animate({
                           'left':'+=32px'
                    },100);
                }
                if(tipo==2){
                    $("#"+nombre).animate({
                           'top':'+=32px'
                    },100);
                }
                if(tipo==3){
                    $("#"+nombre).animate({
                           'left':'-=32px'
                    },100);
                }
            },

            graficador2 : function(nombre, posicion){
                console.log("Grafico a " + nombre + " en la pos ("+ posicion.x + ", " + posicion.y + ")");
                $("#"+nombre).animate({
                           'left': '+='+(posicion.x*32)+'px'
                    },0);
                    
                $("#"+nombre).animate({
                           'top':'+='+(-posicion.y*32)+'px'
                    },1);
            },
            creador : function(nombre, clase) {
                $("#contenedor").append("<div id='"+nombre+"' class='"+ clase +"' style='position: absolute; left:0px; top: 500px;' ><span>"+nombre+"</span></div>");
            },
            creadorImg: function(nombre, path){

                $("#contenedor").append("<div id='"+nombre+"' class= 'item' style='position: absolute; left:0px; top: 500px;'>"+
                                         "<span>"+nombre+"</span>"+
                                         "<img src='"+path+"'/></div>");
            },
            laparca : function(nombre) {
                $("#"+nombre).remove();
            },
        }
/////////////////// INVENTARIO //////////////////////   // INVENTARIO NOEL! ***

        var inventario = {
            f : [0],

            inicializar: function(datos){
                for (var i = 0; i < datos.length; i++) {

                    this.f[i]=datos[i];
                    $("#f"+i).html("<img src='core/css/Graficos/"+items.getGrafico(this.f[i][0])+"'>");
                    $("#c"+i).html(this.f[i][1]);
                    $("#m"+i).html("<img src='core/css/Graficos/mas.png' id='b"+i+"'>");
                        

                }; 
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

/////////////////// END INVENTARIO //////////////////////  // INVENTARIO NOEL!  ***
        var pantalla ={
            log: function(mensaje, nombre){                
                $("#consola").append("<span class='userChat'>"+nombre+"</span>"+": "+"<span class='mensajeChat'>"+mensaje+"</span>"+"<br>");
                $("#consola").animate({ scrollTop: $('#consola')[0].scrollHeight}, 300);
            }
        };

        var datos ={
            //datos.post('url'); devuelve el objeto que contiene la url.
                /* El archivo PHP 
                <?php
                $datos = array("mensaje" => "Hola soy json", "error" => false);
                echo json_encode($datos);
                ?>
                */
            post:function(url){
                $.post(url, function(respuesta) {
                    return respuesta;
                });
            }
        };