<script>
    var coords = [];
</script>

<?php

$finalJSFile = "";

$noActions = 1; //El número de acciones
$noFrames = [60]; //Una lista con el número de cuardos por acción.
$folderList = ["tocha_running"];      //Una lista con el nombre de las carpetas de las acciones, una por acción

$action = "var action = [];\n";
$finalJSFile = $action;
for($i = 0; $i < $noActions; $i++){
    //Para cada una de las acciones
    $finalJSFile .= "action.push({frame:[]});\n";
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
        $finalJSFile .= $textureCoords;
        $finalJSFile .= $normals;
        $finalJSFile .= "action[" . $i . "].frame.push({vertices : vertices, textureCoords : textureCoords, normals : normals});\n";
    }
}

echo "<script>" . $finalJSFile . "</script>";
echo "<h1>LISTO</h1>";


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