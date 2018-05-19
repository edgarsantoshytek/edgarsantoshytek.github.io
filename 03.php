<?php

$saved_file = "project.js";

$content = $_POST["content"];

file_put_contents($saved_file, $content);

?>