<?php
$data = $_REQUEST["data"];
$f = fopen('out.txt', 'a') or die("can't open file");
fwrite($f, $data);
fclose($f);
?>