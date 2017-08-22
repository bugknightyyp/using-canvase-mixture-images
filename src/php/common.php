<?php

/* get guess price config items */
if ( ! function_exists('get_gp_config') ) 
{
    function &get_gp_config()
    {
        static $_config;
        if (empty($_config))
        {
            $config_path = APPPATH.'config/GuessPrice_config.php';

            if(file_exists($config_path))
            {
                $_config = include($config_path);
            }
            else
            {
                $_config = array();
                print($config_path.' not exits');
            }
        }

        return $_config;
    }
}
else
{
    echo 'get_gp_config function_exists.<br>';
}

/* get custom underwear config items */
if ( ! function_exists('get_cu_config') ) 
{
    function &get_cu_config()
    {
        static $_config;
        if (empty($_config))
        {
            $config_path = APPPATH.'config/CustomUnderwear_config.php';

            if(file_exists($config_path))
            {
                $_config = include($config_path);
            }
            else
            {
                $_config = array();
                print($config_path.' not exits');
            }
        }

        return $_config;
    }
}
else
{
    echo 'get_cu_config function_exists.<br>';
}

class CommonJson {
    /* 将数组转换为JSON字符串（不兼容中文） */
    static function to_json_simply($array_in)
    {
        return json_encode($array_in, JSON_FORCE_OBJECT);
    }

    /**************************************************************
     *
     *  将数组转换为JSON字符串（兼容中文）
     *  @param  array   $array      要转换的数组
     *  @return string      转换得到的json字符串
     *  @access private
     *
     *************************************************************/
    static function to_json($array_in) 
    {
        self::array_recursive($array_in, 'urlencode', true);
        // if use JSON_FORCE_OBJECT, it will turn array to '{0:{}, 1:{}}'.
        $json = json_encode($array_in);

        return urldecode($json);
    }

    /**************************************************************
     *
     *  使用特定function对数组中所有元素做处理
     *  @param  string  &$array     要处理的字符串
     *  @param  string  $function   要执行的函数
     *  @return boolean $apply_to_keys_also     是否也应用到key上
     *  @access private
     *
     *************************************************************/
    static function array_recursive(&$array, $function, $apply_to_keys_also = false)
    {
        static $recursive_counter = 0;
        if (++$recursive_counter > 1000) 
        {
            die('possible deep recursion attack');
        }

        foreach ($array as $key => $value) 
        {
            if (is_array($value)) 
            {
                self::array_recursive($array[$key], $function, $apply_to_keys_also);
            } 
            else 
            {
                $array[$key] = $function($value);
            }

            if ($apply_to_keys_also && is_string($key)) 
            {
                $new_key = $function($key);

                if ($new_key != $key) 
                {
                    $array[$new_key] = $array[$key];
                    unset($array[$key]);
                }
            }
        }

        $recursive_counter--;
    }
}

class CommonImage {
    static function image_compression($src_file, $dest_file, $new_width, $image_type = 'png')
    {
        list($width, $height) = getimagesize($src_file);

        if ($width <= $new_width)
        {
            copy($src_file, $dest_file); 
            return;
        }

        $new_height = $new_width * $height * 1.0 / $width;

        if ('png' == $image_type)
        {
            $src_image = imagecreatefrompng($src_file);
        } 
        else if ('jpeg' == $image_type)
        {
            $src_image = imagecreatefromjpeg($src_file);
        }

        $dest_image = imagecreatetruecolor($new_width, $new_height);
        imagecopyresampled($dest_image, $src_image, 0, 0, 0, 0, 
                        $new_width, $new_height, $width, $height);
        
        $quality = 9;

        if ('png' == $image_type)
        { 
            imagepng($dest_image, $dest_file, $quality); 
        }
        else if ('jpeg' == $image_type)
        {
            imagejpeg($dest_image, $dest_file);
        }
        else
        {
            print 'not support the image type.';
        }

        imagedestroy($src_image);
        imagedestroy($dest_image);
    }
}

