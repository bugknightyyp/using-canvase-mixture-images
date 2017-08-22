<?php

require_once './jssdk.php';

$appId = $_GET['appid'];

if ('customunderwear_app_1231247' == $appId)
{
    $jssdk = new JSSDK('wxbb5f8f68dfc90d6c', '5ef71993c7b0019653432c3c65bde110');
    $access_token = $jssdk->getAccessToken();
    echo $access_token;
}
else
{
    echo '';
}
