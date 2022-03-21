<?php
	if($_POST){
		if(!is_dir("../problems")) shell_exec("mkdir ../problems");
		if(is_file("../problems/CF-" . $_POST["contest"] . $_POST["problem"])){
		   echo shell_exec("cat ../problems/CF-" . $_POST["contest"] . $_POST["problem"]);
		}
		else{
		  $data = file_get_contents("https://codeforces.com/problemset/problem/" . $_POST["contest"] . "/" . $_POST["problem"]);
		  echo $data;
		}
	}
	else{
		echo "404";
	}
?>