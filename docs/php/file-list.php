<?php
if($_POST){

if(is_dir($_POST["path"])){
$path = $_POST["path"] . "/{*,.[!.]*,..?*}";

$filenames = glob($path , GLOB_BRACE);

$file = array();

foreach ($filenames as $filename) {
    if(!is_dir($filename)){
    array_push($file, $filename);
    }
}
echo json_encode($file) ;
}
else {
    shell_exec("mkdir " . $_POST["path"]);
    echo "[]";
}
}


else{
echo '404 Not Found!';
}
?>