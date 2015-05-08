        // CHAAAAAAAAAAAAAAAAAAAAAAT
            
             jwerty.key('enter', function () {
                if(ui.consola){
                    if($("#consolam").val() != ""){
                        ui.webSocket.send(JSON.stringify({nombre: ui.nombre, tipo:"mensaje", mensaje:$("#consolam").val()}));
                    }
                    ui.consola=false;
                    $("#consolam").blur();
                    $("#consolam").val(" ");
                    $("#consolam").prop('disabled', true);
                }else{
                    //autoblur
                    $("#consolam").prop('disabled', false);
                    $( "#consolam" ).focus();

                    $( "#consolam" ).val("");
                    ui.consola=true;
                }
            });
             // END CHAT

        /////////////////////
        //EVENTOS DEL TECLADO
        /////////////////////
      
            jwerty.key('↑', function () {
                if(ui.consola == true){ return }

                $("#" + $("#nombre").val()).removeClass("downChar");
                $("#" + $("#nombre").val()).removeClass("leftChar");
                $("#" + $("#nombre").val()).removeClass("rightChar");
                $("#" + $("#nombre").val()).addClass("upChar");


                if( $('#'+ui.nombre).is(':animated') ) { }else{
                ui.ultimoDelta = 0;
                ui.webSocket.send(JSON.stringify({tipo: "mover", nombre: ui.nombre, delta: 0}));
                
            }
        });
            jwerty.key('→', function () {
                if(ui.consola == true){ return }

                $("#" + $("#nombre").val()).removeClass("leftChar");
                $("#" + $("#nombre").val()).removeClass("upChar");
                $("#" + $("#nombre").val()).removeClass("downChar");
                $("#" + $("#nombre").val()).addClass("rightChar");

                if( $('#'+ui.nombre).is(':animated') ) { }else{
                ui.ultimoDelta = 1;
                ui.webSocket.send(JSON.stringify({tipo: "mover", nombre: ui.nombre, delta: 1}));
                }
            });
            jwerty.key('↓', function () {
                if(ui.consola == true){ return }

                $("#" + $("#nombre").val()).removeClass("leftChar");
                $("#" + $("#nombre").val()).removeClass("upChar");
                $("#" + $("#nombre").val()).removeClass("rightChar");
                $("#" + $("#nombre").val()).addClass("downChar");

                if( $('#'+ui.nombre).is(':animated') ) { }else{
                ui.ultimoDelta = 2;
                ui.webSocket.send(JSON.stringify({tipo: "mover", nombre: ui.nombre, delta: 2}));
                }
            });
            jwerty.key('←', function () {
                if(ui.consola == true){ return }

                $("#" + $("#nombre").val()).removeClass("rightChar");
                $("#" + $("#nombre").val()).removeClass("upChar");
                $("#" + $("#nombre").val()).removeClass("downChar");
                $("#" + $("#nombre").val()).addClass("leftChar");

                if( $('#'+ui.nombre).is(':animated') ) { }else{
                ui.ultimoDelta = 3;
                ui.webSocket.send(JSON.stringify({tipo: "mover", nombre: ui.nombre, delta: 3}));
                }
            });

            jwerty.key('H', function () {
                if(ui.consola == true){ return }
                console.log('Tomá!');
                ui.webSocket.send(JSON.stringify({ tipo:"golpe", nombre: ui.nombre, Posicion: ui.ultimoDelta}));
                golpeSound.play();
            });
            jwerty.key('C', function () {
                if(ui.consola == true){ return }
                console.log('Modo combate activado');
                ui.webSocket.send(JSON.stringify({ tipo:"combate", nombre: ui.nombre}));
            });
// INVENTARIO NOEL!! BOTONES QUE CONSUMEEN
            jwerty.key('R', function () {
                if(ui.consola == true){ return }
                
                ui.webSocket.send(JSON.stringify({ tipo:"consumir", nombre: ui.nombre, obj:0 }));
            });
            jwerty.key('T', function () {
                if(ui.consola == true){ return }
                
                ui.webSocket.send(JSON.stringify({ tipo:"consumir", nombre: ui.nombre, obj:1 }));
            });
            jwerty.key('Y', function () {
                if(ui.consola == true){ return }
                
                ui.webSocket.send(JSON.stringify({ tipo:"consumir", nombre: ui.nombre, obj:2 }));
            });
            jwerty.key('U', function () {
                if(ui.consola == true){ return }
                
                ui.webSocket.send(JSON.stringify({ tipo:"consumir", nombre: ui.nombre, obj:3 }));
            });
            jwerty.key('I', function () {
                if(ui.consola == true){ return }
                
                ui.webSocket.send(JSON.stringify({ tipo:"consumir", nombre: ui.nombre, obj:4 }));
            });

            
