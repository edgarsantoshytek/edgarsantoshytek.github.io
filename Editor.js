//Aqui esta todo lo relacionado con el editor.

//Variables indicativas, tambien son de control
var fullscreen = true;                  //Verifica si está en modo fullscreen
var down = false;                       //Verifica si el mouse está siendo presionado
//manager = new WebGLManager();           //El manejador de WebGL
manager = 0;

// Variables de control
var posLastTime = 0;                    //Guarda cual fue la posicion anterior en la que estuvo el mouse
var originalPosition = 0;               //Guarda el como estaba la figura antes de comenzar a editarla
var editorMode = 0;                     //Indica el modo de edición en el que se está. 0 = Modo diseño, 1 = Modo animación. 2=Modo creación
var play = false;                        //Indica si se deben de ejecutar las animaciones


//Eventos
document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

function handleKeyDown(event){
    manager.buttons[event.keyCode] = true;
    
    if (String.fromCharCode(event.keyCode) == "F"){
        toogleWindow();
    }
    
    /*if (String.fromCharCode(event.keyCode) == "W"){
        manager.camera.z -= Math.cos(manager.camera.yaw);
        manager.camera.x -= Math.sin(manager.camera.yaw);
    }
    if (String.fromCharCode(event.keyCode) == "A"){
        manager.camera.yaw+=0.1;
    }
    if (String.fromCharCode(event.keyCode) == "S"){
        manager.camera.z -= Math.cos(manager.camera.yaw)*-1;
        manager.camera.x -= Math.sin(manager.camera.yaw)*-1;
    }
    if (String.fromCharCode(event.keyCode) == "D"){
        manager.camera.yaw-=0.1;
    }
    
    if (String.fromCharCode(event.keyCode) == "Q"){
        
    }
    if (String.fromCharCode(event.keyCode) == "E"){
    }*/
}

function handleKeyUp(event){
    manager.buttons[event.keyCode] = false;
}


//Si la pantalla cambia de tamaño, ajusta las dimenciones del canvas
window.onresize = function(event){
    manager.resize(fullscreen);
}




//Acualiza a una figura respecto al campo editado
//Una funcion para hacer un callback con parametros.
//Que no se te vaya a olvidar porque esta es una de las cosas por las que siempre me joden.
function update(field){
    return function(e){
        var value = $(field).val();
        var object = $("#objects").val();
        manager.change(field, object, value);
    }
    /*return function(e){
        alert(x);
    };*/
}



$(document).ready(function(){
    manager = new WebGLManager();   
    manager.webGLStart(fullscreen);
    toogleWindow();
    loadProject();
    
    for(var i = 0; i < registeredObjects.length; i++){
        $("#registeredObjects").append("<option value=\"" + i + "\">" + registeredObjects[i].editorName + "</option>");
    }
    
    changeEditorMode(editorMode);
    
    $("#editorToolbar").css("display", "none");
    $("#x").on("input",update("#x"));
    $("#y").on("input",update("#y"));
    $("#z").on("input",update("#z"));
    $("#angle").on("input",update("#angle"));
    $("#rx").on("input",update("#rx"));
    $("#ry").on("input",update("#ry"));
    $("#rz").on("input",update("#rz"));
    $("#sx").on("input",update("#sx"));
    $("#sy").on("input",update("#sy"));
    $("#sz").on("input",update("#sz"));
    
    //Para el menú de animación
    $("#x").on("input",update("#x"));
    $("#y").on("input",update("#y"));
    $("#z").on("input",update("#z"));
    $("#angle").on("input",update("#angle"));
    $("#rx").on("input",update("#rx"));
    $("#ry").on("input",update("#ry"));
    $("#rz").on("input",update("#rz"));
    $("#sx").on("input",update("#sx"));
    $("#sy").on("input",update("#sy"));
    $("#sz").on("input",update("#sz"));
    $("#time").on("input",update("#time"));
    
    $("body").mousemove(function(event){
        if(down){
            $("input").each(function(){
                if($(this).is(":focus")){
                    var id = "#" + $(this).attr("id");
                    if(posLastTime == 0){
                        posLastTime = (event.pageX/300);
                        originalPosition = parseFloat($(id).val());
                    }
                    else{
                        var deltaChange = event.pageX/300 - posLastTime;
                        //console.log(deltaChange);
                        var pos = parseFloat(originalPosition) + parseFloat(deltaChange);
                        $(id).val(pos);
                        update(id).call();
                    }
                }
                
            });
        }
    });
    
    $("#objects").change(function(){
        var index = parseInt($(this).val());
        manager.setGUIFields(index);
    });
    
    $("#animationList").change(function(){
        manager.setGUIAnimationFields();
    });
    
});

//Cambia la vista respecto si es fullscreen o modo edición
function toogleWindow(){
    fullscreen = !fullscreen;
    manager.resize(fullscreen);
    
    if(fullscreen){
        $("#editorToolbar").css("display", "none");
    }
    else{
        $("#editorToolbar").css("display", "inline");
    }
    
}

//Eventos de mouse
$(document).mousedown(function() {
    down = true;
}).mouseup(function() {
    down = false;
    posLastTime = 0;
    originalPosition = 0;  
});

//Para guardar
function save(){
    var content = "function loadProject(){" + "\n";
    for(var i = 0; i < manager.models.length; i++){
        var name = manager.models[i].name;
        var position = "[" + manager.models[i].original.x + ", " + manager.models[i].original.y + ", " + manager.models[i].original.z + "]";
        var angle = manager.models[i].original.angle;
        var axis = "[" + manager.models[i].original.axis + "]";
        var scale = "[" + manager.models[i].original.sx + ", " + manager.models[i].original.sy + ", " + manager.models[i].original.sz + "]";
        var path = manager.models[i].path;
        var animation = manager.models[i].animationToString();
        var className = manager.models[i].constructor.name;
        var toSave = "manager.models.push(new " + className + "(manager.gl, manager.shaderProgram, \"" + path + "\", " + position + ", " + angle + ", " + axis + ", " + scale + ", \"" + name + "\", " + animation + "));";
        //alert(toSave);
        content += "\t" + toSave + "\n";
    }
    content += "\tmanager.initGUI();\n";
    content += "}";
    //alert(content);
    
    $.post("03.php", {content: content}, function(){
        alert("Guardado");
    });
}

//Cambia el modo del editor
//El modo de edición.
//0 = Diseño
//1 = Animación
function changeEditorMode(mode){
    if(play){
        alert("No puedes cambiar el menú cuando estás en modo reproducción de animaciones");
    }
    else{
        var object = parseInt($("#objects").val());
        
        if(editorMode == 0){
            manager.saveModelsDefaults();
        }
        if(editorMode == 1){
            manager.saveModelsAnimations();
        }
        
        
        editorMode = mode;
        if(mode == 0){
            $("#mode").html("Editor: Modo diseño");
            activeMode(mode);
            manager.restoreModelsDefaults();
            manager.restoreModelsAnimations();
            manager.setGUIFields(object);
        }
        if(mode == 1){
            $("#mode").html("Editor: Modo animación");
            activeMode(mode);
        }
        if(mode == 2){
            $("#mode").html("Editor: Nuevo elemento");
            activeMode(mode);
        }

    }
}

function playing(){
    manager.restoreModelsDefaults();
    manager.saveModelsAnimations();
    play = true;
    $("#hideWhenPlay").css("display","none");
    $("#hideWhenStop").css("display","inline");
}

function stop(){
    play = false;
    manager.restoreModelsDefaults();
    manager.restoreModelsAnimations();
    $("#hideWhenPlay").css("display","inline");
    $("#hideWhenStop").css("display","none");
}

//Funcion auxiliar
function activeMode(mode){
    if(mode == 0){
        $("#design").css("display", "inline");
        $("#animation").css("display", "none");
        $("#new").css("display", "none");
    }
    if(mode == 1){
        $("#design").css("display", "none");
        $("#animation").css("display", "inline");
        $("#new").css("display", "none");
    }
    if(mode == 2){
        $("#design").css("display", "none");
        $("#animation").css("display", "none");
        $("#new").css("display", "inline");
    }
}

function getAllSubclasses(baseClass) {
  var globalObject = Function('return this')(); 
  var allVars = Object.keys(globalObject);
  var classes = allVars.filter(function (key) {
  try {
    var obj = globalObject[key];
        return obj.prototype instanceof baseClass;
    } catch (e) {
        console.log(e);
        return false;
    }
  });
  return classes;
}

