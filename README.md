OpenTileMap Project
======================
OpenTileMapの登録＆検索用プログラムです。

動作確認
------
http://www.ecoris.co.jp/map/otm/index.html


プログラム
------
- `index.html`  
 ポータルサイト
- `otm.html`  
 OpenTileMapの表示地図
- `otm_base.js`  
 OpenLayers呼び出し。otm.htmlで利用
- `OpenTileMap.js`  
 OpenTileMap用のOpenLayers拡張Tileクラス
- `otm.db`
 SQLiteデータベース。タイル情報を登録
- `regist.php`  
 SQLiteデータベースへの登録、削除、呼び出しプログラム
- `generateMetaTile.php`  
 メタタイルの生成プログラム。otm.dbの情報を利用

 
関連情報
--------


  
ライセンス
----------
考え中


TODO
----------
- otm.Control.OpenTileMapの作成。OpenLayersでタイル情報とタイル表示の切り替え用コントロール。