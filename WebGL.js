class WebGLManager{
    
    constructor(){
        this.gl;                                // La variable gl es un WebGLRenderingContext
        this.shaderProgram;                     // Guarda los shaders, los dos.
        this.mvMatrix = mat4.create();          // Model-view Matrix
        this.pMatrix = mat4.create();           // Projection Matrix
        this.mvMatrixStack = [];                // Guarda las matrices, es para poder hacer Push y Pop Matrix
        
        // La animacion, esto tal vez lo dejo
        this.frameTime = 0;                     // El tiempo que debe durar cada frame. 
        this.lastTime = 0;
        this.elapsed = 0;
        
        //Los modelos
        this.models = [];
        
        //La cámara
        this.camera = {};
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.z = 0;
        this.camera.pitch = 0;
        this.camera.yaw = 0;
        this.camera.speed = 0;
        
        //Los botones
        this.buttons = [];
        for(var i = 0; i < 256; i++){
            this.buttons[i] = false;
        }
        
        //La luz
        this.ambientLight = [0.2,0.2,0.2];                              //El color de la luz ambiental
        this.directionalLight = [ [0.0,0.0,0.0], [0.0,0.0,0.0] ];       //La luz direccional, el elemento[0] es el vector de dirección, el elemento[1] es el color de la luz
        
        //La esfera de la colisión
        this.sphereCollision;
        
        
        
    }
    
    // Funcion Warper, llama a las funciones que inicializan las cosas necesarias para usar WebGL
    webGLStart(fullscreen) {
        var canvas = document.getElementById("lesson01-canvas");
        if(fullscreen){
            canvas.width = window.innerWidth - 20;
            canvas.height = window.innerHeight - 20;
        }
        else{
            canvas.width = window.innerWidth/2 - 20;
            canvas.height = window.innerHeight - 20;
        }
        
        this.frameTime = this.timePerFrame(60);
        this.initGL(canvas);
        this.initShaders();
        
        //this.initBuffers();
        //this.initTexture("texture.png");
        
        
        //this.models.push(new Barrel(this.gl, this.shaderProgram, "textures/barrel.png", [-1.0, 0.0, -2.0], 0, [0,0,0], [1,1,1], "Barril 0"));
        //this.models.push(new Seat(this.gl, this.shaderProgram, "textures/seat.png", [1.0, 0.0, -2.0], 0, [0,0,0], [1,1,1], "Banca 1"));
        
        this.initSphereCollision();
        
        this.initGUI();

        this.gl.clearColor(0.25, 0.5, 1.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.tick();
    }
    
    initSphereCollision(){
        this.sphereCollision = new Sphere(this.gl, this.shaderProgram, "textures/alder_real.png", [0, 0, 0], 0, [0,0,0], [1, 1, 1], "SPHERE_COLLISION", []);
    }
    
    //Inicializa la GUI del editor
    initGUI(){
        for(var i = 0; i < this.models.length; i++){
            $("#objects").append("<option value=\"" + i + "\">" + this.models[i].name + "</option>");
            this.setGUIFields(0);
        }
    }
    
    //Limpia la lista de la GUI
    cleanGUI(){
        $("#objects").empty();
    }
    
    setGUIFields(){
        //this.restoreModelsAnimations();
        var index = parseInt($("#objects").val());
        var model = this.models[index];
        $("#x").val(model.x);
        $("#y").val(model.y);
        $("#z").val(model.z);
        $("#angle").val(model.angle);
        $("#rx").val(model.axis[0]);
        $("#ry").val(model.axis[1]);
        $("#rz").val(model.axis[2]);
        $("#sx").val(model.sx);
        $("#sy").val(model.sy);
        $("#sz").val(model.sz);
        
        $("#animationList").empty();
        for(var i = 0; i < model.animation.length; i+=2){
            $("#animationList").append("<option value=\"" + i/2 + "\">" + "Animación " + i/2 + "</option>");
        }
        
        this.setGUIAnimationFields();
        
        
    }
    
    setGUIAnimationFields(){
        var index = parseInt($("#objects").val());
        
        var model = this.models[index];
        var animationIndex = parseInt($("#animationList").val());
        if(animationIndex != undefined && !isNaN(animationIndex)){
            var animation = model.animation[((animationIndex)*2)];
            var time = model.animation[((animationIndex)*2)+1];
            if(time != undefined){
                $("#time").val(time);
            }
            
            
            if(!play){
                if(animation !== undefined){
                    $("#ax").val(animation[0]);
                    $("#ay").val(animation[1]);
                    $("#az").val(animation[2]);
                    $("#aangle").val(animation[3]);
                    $("#arx").val(animation[4]);
                    $("#ary").val(animation[5]);
                    $("#arz").val(animation[6]);
                    $("#asx").val(animation[7]);
                    $("#asy").val(animation[8]);
                    $("#asz").val(animation[9]);
                    
                    this.models[index].x = animation[0];
                    this.models[index].y = animation[1];
                    this.models[index].z = animation[2];
                    this.models[index].angle = animation[3];
                    this.models[index].axis[0] = animation[4];
                    this.models[index].axis[1] = animation[5];
                    this.models[index].axis[2] = animation[6];
                    this.models[index].sx = animation[7];
                    this.models[index].sy = animation[8];
                    this.models[index].sz = animation[9];
                }
            }
        }
        else{
            $("#ax").val('');
            $("#ay").val('');
            $("#az").val('');
            $("#aangle").val('');
            $("#arx").val('');
            $("#ary").val('');
            $("#arz").val('');
            $("#asx").val('');
            $("#asy").val('');
            $("#asz").val('');
            $("#time").val('');
            $("#animationList").removeAttr('selected');
        }
        
        
        
    }
    
    //Hace un cambio al respecto a la GUI
    change(what, object, value){
        // Si es un cambio en X
        value = parseFloat(value);
        if(what == "#x"){
            this.models[object].x = value;
        }
        if(what == "#y"){
            this.models[object].y = value;
        }
        if(what == "#z"){
            this.models[object].z = value;
        }
        if(what == "#angle"){
            this.models[object].angle = value;
        }
        if(what == "#rx"){
            this.models[object].axis[0] = value;
        }
        if(what == "#ry"){
            this.models[object].axis[1] = value;
        }
        if(what == "#rz"){
            this.models[object].axis[2] = value;
        }
        if(what == "#sx"){
            this.models[object].sx = value;
        }
        if(what == "#sy"){
            this.models[object].sy = value;
        }
        if(what == "#sz"){
            this.models[object].sz = value;
        }
        
        if(!play){
            if(what == "#ax"){
                this.models[object].x = value;
                this.updateAnimationValues();
            }
            if(what == "#ay"){
                this.models[object].y = value;
                this.updateAnimationValues();
            }
            if(what == "#az"){
                this.models[object].z = value;
                this.updateAnimationValues();
            }
            if(what == "#aangle"){
                this.models[object].angle = value;
                this.updateAnimationValues();
            }
            if(what == "#arx"){
                this.models[object].axis[0] = value;
                this.updateAnimationValues();
            }
            if(what == "#ary"){
                this.models[object].axis[1] = value;
                this.updateAnimationValues();
            }
            if(what == "#arz"){
                this.models[object].axis[2] = value;
                this.updateAnimationValues();
            }
            if(what == "#asx"){
                this.models[object].sx = value;
                this.updateAnimationValues();
            }
            if(what == "#asy"){
                this.models[object].sy = value;
                this.updateAnimationValues();
            }
            if(what == "#asz"){
                this.models[object].sz = value;
                this.updateAnimationValues();
            }
            if(what == "#time"){
                this.updateAnimationValues();
            }
        }
    }
    
    updateAnimationValues(){
        var index = parseInt($("#objects").val());
        var indexAnimation = parseInt($("#animationList").val());
        if(index !== undefined && indexAnimation != undefined){
            this.models[index].animation[indexAnimation*2][0] = parseFloat($("#ax").val());
            this.models[index].animation[indexAnimation*2][1] = parseFloat($("#ay").val());
            this.models[index].animation[indexAnimation*2][2] = parseFloat($("#az").val());
            this.models[index].animation[indexAnimation*2][3] = parseFloat($("#aangle").val());
            this.models[index].animation[indexAnimation*2][4] = parseFloat($("#arx").val());
            this.models[index].animation[indexAnimation*2][5] = parseFloat($("#ary").val());
            this.models[index].animation[indexAnimation*2][6] = parseFloat($("#arz").val());
            this.models[index].animation[indexAnimation*2][7] = parseFloat($("#asx").val());
            this.models[index].animation[indexAnimation*2][8] = parseFloat($("#asy").val());
            this.models[index].animation[indexAnimation*2][9] = parseFloat($("#asz").val());
            var time = parseInt($("#time").val());
            if(!isNaN(time) && time > 0){
                this.models[index].animation[(indexAnimation*2)+1] = time;
            }
            
            
            
        }
    }
    
    //Añade un modelo
    addModel(){
        var index = parseInt($("#registeredObjects").val());
        var objectName = $("#objectName").val();
        var className = registeredObjects[index].className;
        var texture = registeredObjects[index].texture;
        if(objectName == undefined || typeof(objectName) != "string" || objectName == ""){
            alert("Falta el nombre");
        }
        else{
            var sentence = 'this.models.push(new ' + className + '(this.gl, this.shaderProgram, "' + texture + '", [0.0, 0.0, 0.0], 0, [0,0,0], [1,1,1], "' + objectName + '", []));';
            alert(sentence);
            eval(sentence);
            this.cleanGUI();
            this.initGUI();
            $("#objects").val(this.models.length-1);
            this.setGUIFields();
            $("#objectName").val('');
        }
        
        
    }
    
    //Quita el modelo seleccionado
    removeModel(){
        if($("#objects").children().length == 1){
            alert("No se puede, debe haber al menos un elemento en la escena");
            return;
        }
        var index = parseInt($("#objects").val());
        this.models.splice(index, 1);
        this.cleanGUI();
        this.initGUI();
        $("#objects").val(0);
        this.setGUIFields();
        
    }
    
    restoreModelsDefaults(){
        for(var i = 0; i < this.models.length; i++){
            this.models[i].x = this.models[i].original.x;
            this.models[i].y = this.models[i].original.y;
            this.models[i].z = this.models[i].original.z;
            this.models[i].angle = this.models[i].original.angle;
            this.models[i].axis = this.models[i].original.axis;
            this.models[i].sx = this.models[i].original.sx;
            this.models[i].sy = this.models[i].original.sy;
            this.models[i].sz = this.models[i].original.sz;
            
        }
    }
    
    saveModelsDefaults(){
        for(var i = 0; i < this.models.length; i++){
            this.models[i].original.x = this.models[i].x;
            this.models[i].original.y = this.models[i].y;
            this.models[i].original.z = this.models[i].z;
            this.models[i].original.angle = this.models[i].angle;
            this.models[i].original.axis = this.models[i].axis;
            this.models[i].original.sx = this.models[i].sx;
            this.models[i].original.sy = this.models[i].sy;
            this.models[i].original.sz = this.models[i].sz;
        }
    }
    
    restoreModelsAnimations(){
        for(var i = 0; i < this.models.length; i++){
            this.models[i].animation = this.models[i].original.animation.slice();
            this.models[i].cleanUpAnimationVariables();
        }
    }
    
    saveModelsAnimations(){
        for(var i = 0; i < this.models.length; i++){
            this.models[i].original.animation = this.models[i].animation.slice();
        }
    }
    
    //Añade una animación a un modelo.
    addAnimation(){
        var whereLast = parseInt($("#animationList").val());
        var index = parseInt($("#objects").val());
        var animationPrevIndex = 0;
        var x = 0;
        var y = 0;
        var z = 0;
        var angle = 0;
        var rx = 0;
        var ry = 0;
        var rz = 0;
        var sx = 1;
        var sy = 1;
        var sz = 1;
        if(isNaN(whereLast) || whereLast == undefined){
            animationPrevIndex = this.models[index].animation.length-2;
            
        }
        else{
            animationPrevIndex = whereLast*2;
        }
        
        if(animationPrevIndex >= 0){
            x = this.models[index].animation[animationPrevIndex][0];
            y = this.models[index].animation[animationPrevIndex][1];
            z = this.models[index].animation[animationPrevIndex][2];
            angle = this.models[index].animation[animationPrevIndex][3];
            rx = this.models[index].animation[animationPrevIndex][4];
            ry = this.models[index].animation[animationPrevIndex][5];
            rz = this.models[index].animation[animationPrevIndex][6];
            sx = this.models[index].animation[animationPrevIndex][7];
            sy = this.models[index].animation[animationPrevIndex][8];
            sz = this.models[index].animation[animationPrevIndex][9];
        }
               
        
        this.models[index].animation.splice(animationPrevIndex+2,0, [x, y, z, angle, rx, ry, rz, sx, sy, sz]);
        this.models[index].animation.splice(animationPrevIndex+3,0, 1);
        
        this.setGUIFields();
        this.saveModelsAnimations();
        
        
        
    }
    
    removeAnimation(){
        var index = parseInt($("#objects").val());
        var aIndex = parseInt($("#animationList").val());
        if(!isNaN(aIndex) && aIndex != undefined){
            this.models[index].animation.splice(aIndex*2, 2);
        }
        this.setGUIFields();
        this.saveModelsAnimations();
    }
    
    //Para ajustar la imagen
    resize(fullscreen){
        var canvas = document.getElementById("lesson01-canvas");
        if(fullscreen){
            canvas.width = window.innerWidth - 260;
            canvas.height = window.innerHeight - 260;
        }
        else{
            canvas.width = window.innerWidth/2 - 260;
            canvas.height = window.innerHeight - 260;
        }
        
        canvas.width = window.innerWidth - 200;
        canvas.height = window.innerHeight - 220;
        
        this.frameTime = this.timePerFrame(60);
        this.initGL(canvas);
    }
    
    // Inicializa WebGL en el canvas
    // canvas = El canvas en el que se inicializará WebGL
    initGL(canvas) {
        try {
            this.gl = canvas.getContext("experimental-webgl");
            this.gl.viewportWidth = canvas.width;
            this.gl.viewportHeight = canvas.height;
        } catch (e) {
        }
        if (!this.gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }
    }
    
    //Obtiene y compila los shaders.
    //id = Atributo html donde están los shaders
    getShader(id){
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = this.gl.createShader(this.gl.VERTEX_SHADER);
        } else {
            return null;
        }

        this.gl.shaderSource(shader, str);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert(this.gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }
    
    // Inicializa los shaders
    initShaders(){
        var fragmentShader = this.getShader("shader-fs");
        var vertexShader = this.getShader("shader-vs");

        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, vertexShader);
        this.gl.attachShader(this.shaderProgram, fragmentShader);
        this.gl.linkProgram(this.shaderProgram);

        if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        this.gl.useProgram(this.shaderProgram);

        this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
        this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
        
        this.shaderProgram.vertexNormalAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexNormal");
        this.gl.enableVertexAttribArray(this.shaderProgram.vertexNormalAttribute);
        
        this.shaderProgram.textureCoordAttribute = this.gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
        this.gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);

        this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
        this.shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
        this.shaderProgram.nMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uNMatrix");
        this.shaderProgram.samplerUniform = this.gl.getUniformLocation(this.shaderProgram, "uSampler");
        this.shaderProgram.useLightingUniform = this.gl.getUniformLocation(this.shaderProgram, "uUseLighting");
        this.shaderProgram.ambientColorUniform = this.gl.getUniformLocation(this.shaderProgram, "uAmbientColor");
        this.shaderProgram.lightingDirectionUniform = this.gl.getUniformLocation(this.shaderProgram, "uLightingDirection");
        this.shaderProgram.directionalColorUniform = this.gl.getUniformLocation(this.shaderProgram, "uDirectionalColor");
        
    }
    
    // Lo de las matrices

    pushMatrix() {
        //alert("HOLA");
        var copy = mat4.create();
        mat4.set(this.mvMatrix, copy);
        this.mvMatrixStack.push(copy);
    }

    popMatrix() {
        if (this.mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        this.mvMatrix = this.mvMatrixStack.pop();
    }
    
    setMatrixUniforms() {
        this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
        this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
        
        var normalMatrix = mat3.create();
        mat4.toInverseMat3(this.mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        this.gl.uniformMatrix3fv(this.shaderProgram.nMatrixUniform, false, normalMatrix);
    }
    
    //Translada a Model-View Matrix
    //point = Lista [x, y, z] a donde se desea trasladar.
    translate(point){
        mat4.translate(this.mvMatrix, point);
    }
    
    //Rota a Model-View Matrix
    //angle = El angulo a rotar.
    //axis = Lista con un vector [x, y, z] en el que se pretende rotar
    rotate(angle, axis){
        mat4.rotate(this.mvMatrix, angle, axis);
    }
    
    //Escala a Model-View Matrix
    //point = Lista [x, y, z] a la que se desea escalar.
    scale(point){
        mat4.scale(this.mvMatrix, point);
    }
    //Fin de lo de las matrices
    
    
    
    //El render
    drawScene() {
        
        // Esto va de cajon, optimamente no se modificara
        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 100.0, this.pMatrix);

        mat4.identity(this.mvMatrix);
        //Fin de lo que va de cajon
        
        
        //La cámara, o bien, su simulación
        this.rotate(-this.camera.pitch, [1,0,0]);
        this.rotate(-this.camera.yaw, [0,1,0]);
        this.translate([-this.camera.x, -this.camera.y, -this.camera.z]);
        //Fin de la cámara
        
        //Esto es con la finalidad de hacer notar el objeto seleccionado, tal vez se deba eliminar después
        var selected = parseInt($("#objects").val());
        
        //Ciclo para dibujar cualquier cosa. Si Dios nos bendice, jamás se tendrá que modificar
        for(var i = 0; i < this.models.length; i++){
            this.pushMatrix();
            this.translate([this.models[i].x , this.models[i].y, this.models[i].z]);
            this.rotate(this.models[i].angle, this.models[i].axis);
            this.scale([this.models[i].sx, this.models[i].sy, this.models[i].sz]);
            this.setMatrixUniforms();
            //if(selected == i && fullscreen == false){
            if(false){
                this.models[i].draw([2.0, 2.0, 2.0], [ [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]]);
            }
            else{
                
                this.models[i].draw(this.ambientLight, this.directionalLight);
            }
            
            /*this.pushMatrix();
            //this.translate( [ this.models[i].x + this.models[i].collision[j][0][0], this.models[i].y + this.models[i].collision[j][0][1], this.models[i].z] + this.models[i].collision[j][0][2]);
            this.rotate(0, [0,0,0]);
            //this.scale( [this.models[i].collision[j][1], this.models[i].collision[j][1], this.models[i].collision[j][1]] );
            this.scale( [200, 200, 200] );
            this.setMatrixUniforms();
            this.sphereCollision.draw(this.ambientLight, this.directionalLight);
            this.popMatrix();*/
            
            
            
            
            
            this.popMatrix();
            
            //Para dibujar las colisiones
            if(true){
                for(var j = 0; j < this.models[i].collision.length; j++){
                    this.pushMatrix();
                        //this.rotate(this.models[i].angle, this.models[i].axis);
                        //this.translate([this.models[i].collision[j][0][0], this.models[i].collision[j][0][1], this.models[i].collision[j][0][2]]);
                            this.pushMatrix();
                                var auxMatrix = mat4.create();
                                mat4.identity(auxMatrix);
                                mat4.rotate(auxMatrix, this.models[i].angle, this.models[i].axis);
                                
                                var pX = this.models[i].collision[j][0][0];
                                var pY = this.models[i].collision[j][0][1];
                                var pZ = this.models[i].collision[j][0][2];
                                
                                /*var pX = this.models[i].x + this.models[i].collision[j][0][0];
                                var pY = this.models[i].y + this.models[i].collision[j][0][1];
                                var pZ = this.models[i].z + this.models[i].collision[j][0][2];*/
                                
                                /*var pX = this.models[i].collision[j][0][0] - this.models[i].x;
                                var pY = this.models[i].collision[j][0][1] - this.models[i].y;
                                var pZ = this.models[i].collision[j][0][2] - this.models[i].z;*/
                                
                                var x = (pX * auxMatrix[0]) + (pY * auxMatrix[4]) + (pZ * auxMatrix[8]);
                                var y = (pX * auxMatrix[1]) + (pY * auxMatrix[5]) + (pZ * auxMatrix[9]);
                                var z = (pX * auxMatrix[2]) + (pY * auxMatrix[6]) + (pZ * auxMatrix[10]);
                                
                                x += this.models[i].x;
                                y += this.models[i].y;
                                z += this.models[i].z;
                                
                                
                                //this.translate([this.models[i].x + this.models[i].collision[j][0][0], this.models[i].y + this.models[i].collision[j][0][1], this.models[i].z + this.models[i].collision[j][0][2]]);
                                //this.rotate(this.models[i].angle,this.models[i].axis);
                                this.translate([x,y,z]);
                                this.scale( [this.models[i].collision[j][1], this.models[i].collision[j][1], this.models[i].collision[j][1]] );
                                this.setMatrixUniforms();
                                this.sphereCollision.draw(this.ambientLight, this.directionalLight);
                            this.popMatrix();
                    this.popMatrix();
                }
            }
            
            
            
        }
        
        
        
    }

    
    
    //Para las animaciones
    
    //Decide cuando hay que actualizar un cuadro. Optimamente esta funcion no cambiara.
    animateManager() {
        var timeNow = new Date().getTime();
        if (this.lastTime != 0) {
            this.elapsed += timeNow - this.lastTime;
            
            if(this.elapsed >= this.frameTime){
                // Ya te puedes actualizar, esto es para mantener el ritmo
                this.animate();
                this.elapsed = 0;
            }
            
        }
        this.lastTime = timeNow;
    }
    
    //Las operaciones necesarias para crear las animaciones
    //this.x;
    animate(){
        this.x += this.delta(3.1416*2.0,10);
    }
    
    // Devuelve la cantidad de unidades que se debe de mover las cosas en cada frame.
    delta(distance, time){
        // Distance es la distancia a moverse, en unidades cartecianas
        // time es el tiempo en segundos que tarda la accion
        time = time * 1000;
        return ((this.frameTime*distance)/time);
    }
    
    // Funciones utiles
    
    tick(){
        requestAnimFrame(this.tick.bind(this));
        this.drawScene();
        this.animateManager();
        this.callToCollisions();
        this.input();
        
        //this.updateAnimationValues();
        //this.setGUIAnimationFields(0);
    }
    
    //Dados cuantos cuadros por segundo se pretenden, calcula cada cuanto se debe de cambiar de cuadro.
    //framesPerSecond = Los cuadros por segundo
    timePerFrame(framesPerSecond){
        return 1000.0/framesPerSecond;
    }
    
    
    //Los botones
    input(){
        //W
        if(this.buttons[87]){
            this.camera.z -= Math.cos(this.camera.yaw);
            this.camera.x -= Math.sin(this.camera.yaw);
        }
        //S
        if(this.buttons[83]){
            this.camera.z -= Math.cos(this.camera.yaw)*-1;
            this.camera.x -= Math.sin(this.camera.yaw)*-1;
        }
        //A
        if(this.buttons[65]){
            this.camera.yaw+=0.1;
        }
        //D
        if(this.buttons[68]){
            this.camera.yaw-=0.1;
        }
    }
    
    
    cholo(){ alert("YO");}
    
    callToCollisions(){
        for(var i = 0; i < this.models.length; i++){
            if(this.models[i].collision.length > 0){
                var result = this.models[i].detectCollision(this.models);
                if(result.length > 0){
                    console.log(this.models[i].name + " está chocando con " + result.length + " objetos");
                }
                
            }
        }
    }
    
}

var registeredObject = [];              //Guarda el nombre de las clases que heredan de Model




