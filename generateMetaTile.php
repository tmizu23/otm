<?php
 
mb_internal_encoding("UTF-8");

$pass = $_POST['admin_pass'];
if($pass!="otm"){
 echo "pass missmatch!";
 die;
}
$tileSize = 256;
$originShift = 2 * pi() * 6378137 / 2.0;
$initialResolution = 2 * pi() * 6378137 / $tileSize;

function LatLonToMeters($lat,$lon){
	global $originShift;
	$mx = $lon * $originShift / 180.0;
	$my = log( tan((90 + $lat) * pi() / 360.0 )) / (pi() / 180.0);
	$my = $my * $originShift / 180.0;
	return array($mx, $my);
}

function MetersToTile($mx,$my,$zoom){
	list($px, $py) = MetersToPixels($mx, $my, $zoom);
	return PixelsToTile($px,$py);
}

function MetersToPixels($mx, $my, $zoom){
	global $originShift;
	$res = Resolution($zoom);
	$px = ($mx + $originShift) / $res;
	$py = ($my + $originShift) / $res;
	return array($px, $py);
}
function Resolution($zoom){
	global $initialResolution;
	return $initialResolution / pow(2,$zoom);
}

function PixelsToTile($px, $py){
	global $tileSize;
	$tx = (int)(ceil( $px / (float)$tileSize ) - 1 );
	$ty = (int)(ceil( $py / (float)$tileSize ) - 1 );
	return array($tx, $ty);
}
function TMS2XYZ($tx, $ty, $zoom){
	return array($tx, (pow(2,$zoom) - 1) - $ty);
}

$basedir = "data";
if(!is_dir($basedir)){
 mkdir($basedir, 0750);
}


try {

     	     $db = new PDO('sqlite:otm.db');
	     $res = $db->query( 'SELECT * FROM otm WHERE tiled = 0');
	     while( $row = $res->fetch( PDO::FETCH_ASSOC ) ) {

		for($z=$row['minz'];$z<=$row['maxz'];$z++){
		  list($mx,$my) = LatLonToMeters($row['miny'],$row['minx']);//lat,lon‚Ì‡”Ô x,y‚Æ‚Í‹t
		  list($tx,$ty) = MetersToTile($mx,$my,$z);
		  list($mintx,$maxty) = TMS2XYZ($tx,$ty,$z);//maxty‚Æminty‚ª“ü‚ê‘Ö‚í‚è
		  list($mx,$my) = LatLonToMeters($row['maxy'],$row['maxx']);
		  list($tx,$ty) = MetersToTile($mx,$my,$z);
		  list($maxtx,$minty) = TMS2XYZ($tx,$ty,$z);//maxty‚Æminty‚ª“ü‚ê‘Ö‚í‚è
	
		  if(!is_dir($basedir . "/" . $z)){
		    $rc = mkdir($basedir . "/" . $z, 0750);
		  }
		  for($x=$mintx;$x<=$maxtx;$x++){
		    if(!is_dir($basedir . "/" . $z . "/" . $x)){
		      $rc = mkdir($basedir . "/" . $z . "/" . $x, 0750);
		    }
		    for($y=$minty;$y<=$maxty;$y++){
		     $string="";
		     if(!file_exists($basedir . "/" . $z . "/" . $x ."/" . $y . ".txt")){
		      $string = "url,name,attribution,TMS\n";
		     }
		     $string .= $row['url'] . "," . $row['name'] . "," . $row['attribution'] ."," . $row['TMS'] ."\n";
		     $fp = fopen($basedir . "/" . $z . "/" . $x ."/" . $y . ".txt", "a");
		     @fwrite( $fp, $string);
		     fclose($fp);
		    }
		  }

		  

		}
	     }
	     $res = $db->query( 'UPDATE otm SET tiled = "1" WHERE tiled = 0');
	     unset($db);
	     echo "Success!";
}
catch( PDOException $e ) {
     echo 'Connection failed: ' . $e->getMessage();
     unset($db);
}

?>