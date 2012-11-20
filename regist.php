<?php
 
mb_internal_encoding("UTF-8");

$regist_pass = $_POST['regist_pass'];
$delete_pass = $_POST['delete_pass'];
$delete_id = $_POST['delete_id'];
$name = $_POST['name'];
$url = $_POST['url'];
$description = $_POST['description'];
$description = $_POST['attribution'];
$TMS = $_POST['TMS'];
$minx = $_POST['minx'];
$maxx = $_POST['maxx'];
$miny = $_POST['miny'];
$maxy = $_POST['maxy'];
$miny = $_POST['miny'];
$maxy = $_POST['maxy'];
$minz = $_POST['minz'];
$maxz = $_POST['maxz'];
$tiled = 0;

try {

     $db = new PDO('sqlite:otm.db');
     if($_POST['mode'] == 0){//読み込み
	     $res = $db->query( 'SELECT id,name,url,description,attribution,TMS,minx,maxx,miny,maxy,minz,maxz,tiled FROM otm');
	     
	     while( $row = $res->fetch( PDO::FETCH_ASSOC ) ) {
		$tempHtml .= "<tr>";
		foreach( $row as $coldata){
		  $tempHtml .= "<td>".htmlspecialchars($coldata)."</td>";
	     	}
		$tempHtml .= "</tr>\n";
	     }
	     unset($db);
	     echo $tempHtml;
     }elseif($_POST['mode'] == 1){//登録
	$sql = 'INSERT INTO otm (name,url,description,attribution,TMS,minx,maxx,miny,maxy,minz,maxz,tiled,pass) VALUES ("' . $name .'","'. $url .'","'. $description.'","'. $attribution.'",'. $TMS .','. $minx.','. $maxx.','. $miny.','. $maxy.','. $minz.','. $maxz . ',' . $tiled . ',"' . $regist_pass .'")';
	if($db->query($sql)){
		echo "Registration Success!";
	}else{
		echo "SQL ERROR!\n\n" . $sql;
	}
     }elseif($_POST['mode'] == 2){//削除
	$sql = 'DELETE FROM otm WHERE id=' . $delete_id . ' AND pass="' . $delete_pass . '"';
	$ret = $db->exec($sql);
	if($ret){
		echo "Delete Success.";
	}else{
		echo "id and pass missmatch!\n\n" . $sql;
	}
     }
}
catch( PDOException $e ) {
     echo 'Connection failed: ' . $e->getMessage();
     unset($db);
}

?>