<script>
    var coords = [];
</script>

<?php

$finalJSFile = '

registeredObjects.push({className: "Tocha", editorName:"Tocha", texture:"textures/tocha3.png"});

class Tocha extends Model{
    constructor(gl, shaderProgram, path, position, angle, axis, scale, name, animation){
        
';

$noActions = 1;                                         //El número de acciones
$noFrames = [4];                                        //Una lista con el número de cuardos clave por acción.
$deltaFrames = [ [15, 15, 15, 15] ];                            //Un lista con los frames de cada uno de los cuadros clave. Para una acción nueva se agrega una lista más
$folderList = ["tocha_running"];                        //Una lista con el nombre de las carpetas de las acciones, una por acción
$textureCoords = "";                                    //Las UV's
$defaultModel = "sphere0.txt";    //El modelo por default
$saved_file = "SphereClass.js";                          //El nombre del nuevo archivo JS

$action = "var action = [];\n";
$finalJSFile .= $action;
for($i = 0; $i < $noActions; $i++){
    //Para cada una de las acciones
    $finalJSFile .= "action.push([]);\n";
    for($j = 0; $j < $noFrames[$i]; $j++){
        //Para cada uno de los cuadros en una animación
        
        
        // Cada que entre aquí es un frame
        $myfile = fopen($folderList[$i] . "\\" . $folderList[$i] . $j . ".txt", "r") or die("¡No se pudo!");
        $lineCount = 1;
        $vertices = "var vertices = [";
        $textureCoords = "var textureCoords = [";
        $normals = "var normals = [";
        while(!feof($myfile)) {
            if($lineCount >= 5){
                $line = fgets($myfile);
                $exploded = explode(" ",$line);
                
                $lastComma = ",\n";
                if($lineCount == 5){
                    $lastComma = "";
                }
                
                $vertices .= $lastComma . trim($exploded[0]) . ", " . trim($exploded[1]) . ", " . trim($exploded[2]);
                $textureCoords .= $lastComma . trim($exploded[3]) . ", " . trim($exploded[4]);
                $normals .= $lastComma . trim($exploded[5]) . ", " . trim($exploded[6]) . ", " . trim($exploded[7]);
                }
            else{
                fgets($myfile);
            }
            $lineCount++;
        }
        fclose($myfile);
        $vertices .= "];\n";
        $textureCoords .= "];\n";
        $normals .= "];\n";
        $finalJSFile .= $vertices;
        //$finalJSFile .= $textureCoords;
        $finalJSFile .= $normals;
        $finalJSFile .= "var frames = " . $deltaFrames[$i][$j] . ";\n";
        $finalJSFile .= "action[" . $i . "].push({vertices : vertices, normals : normals, frames : frames});\n";
    }
}


// Cada que entre aquí es un frame
        $myfile = fopen($defaultModel, "r") or die("¡No se pudo!");
        $lineCount = 1;
        $vertices = "var vertices = [";
        $textureCoords = "var textureCoords = [";
        $normals = "var normals = [";
        while(!feof($myfile)) {
            if($lineCount >= 5){
                $line = fgets($myfile);
                $exploded = explode(" ",$line);
                
                $lastComma = ",\n";
                if($lineCount == 5){
                    $lastComma = "";
                }
                
                $vertices .= $lastComma . trim($exploded[0]) . ", " . trim($exploded[1]) . ", " . trim($exploded[2]);
                $textureCoords .= $lastComma . trim($exploded[3]) . ", " . trim($exploded[4]);
                $normals .= $lastComma . trim($exploded[5]) . ", " . trim($exploded[6]) . ", " . trim($exploded[7]);
                }
            else{
                fgets($myfile);
            }
            $lineCount++;
        }
        fclose($myfile);
        $vertices .= "];\n";
        $textureCoords .= "];\n";
        $normals .= "];\n";
        $finalJSFile .= $vertices;
        $finalJSFile .= $textureCoords;
        $finalJSFile .= $normals;

$finalJSFile .= '
        var collision = [];
        super(gl, shaderProgram, path, position, angle, axis, scale, name, vertices, textureCoords, normals, animation, action, collision);
    }
    
}
';

file_put_contents($saved_file, $finalJSFile);

echo "<h1>Se creo el archivo \"" . $saved_file . "\"</h1>";


?>

<html>
    <head>
        <title>PRUEBAS DEL MODELO</title>
        <script src="jquery.js"></script>
    </head>
    <p id="values"></p>
    <script>
        //alert(coords);
        //$("#values").html(coords);
    </script>
</html>