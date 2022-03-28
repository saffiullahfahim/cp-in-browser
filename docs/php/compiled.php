<?php
if($_POST){
  // File Data
  $fh = fopen($_POST["path"], 'w');
  fwrite($fh, $_POST["data"]);
  fclose($fh);
  
  // Input Data
  $fh = fopen('../input' , 'w');
  fwrite($fh, $_POST['input']);
  fclose($fh);
  
  $output = "success";
  if(shell_exec("cat ../cp-compiled" . $_POST["language"]) != $_POST["source"]){
    
    $lan = "g++";
    if($_POST["language"] == ".c") {
      $lan = "gcc";
    }
    
    $output = '';
    $file = str_replace("/php\n", "", shell_exec("pwd")) . "/cp-compiled" . $_POST["language"];
    $p = proc_open($lan . " " . $file . " -o ~/.cp-compiled" . $_POST["language"],
      array(
        1 => array('pipe', 'w'),
        2 => array('pipe', 'w')
      ), $io);
  
     // Read output sent to stdout
     while (false === feof($io[1])) {
       // this will return always false ... and will loop forever until "fork: retry: no child processes" will show if proc_open is disabled;
       $output .= htmlspecialchars(fgets($io[1]), ENT_COMPAT, 'UTF-8');
     }

     // Read output sent to stderr
     while (false === feof($io[2])) {
       $output .= htmlspecialchars(fgets($io[2]), ENT_COMPAT, 'UTF-8');
     }

    // Close everything off
    fclose($io[1]);
    fclose($io[2]);
    proc_close($p);
  
    if($output == ''){
      $output = 'success';
      // Compiled Data
      $fh = fopen('../cp-compiled' . $_POST["language"], 'w');
      fwrite($fh, $_POST["source"]);
      fclose($fh);
    }
    else{
      $output .= "\n";
    }
  }
  
  if($output == "success"){
    echo '{"status": 200, "output": "' . shell_exec('timeout 4s ~/.cp-compiled' . $_POST['language'] . ' < ../input') . '"}';
  }
  else{
    //shell_exec('rm ~/.cp-compiled' . $_POST['language']);
    echo '{ "status": 401, "output": "' . str_replace($file, str_replace("/sdcard/cp-in-browser/", "", $_POST["path"]), $output) . '", "pwd": "'. shell_exec("pwd") .'"}';
  }
}
else{
  echo "404";
}

?>