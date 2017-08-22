<?php

$common_file = APPPATH.'controllers/common.php';
if (file_exists($common_file))
{
    require_once($common_file);
}
else
{
    print ($common_file.' not exists.');
}

class CustomUnderwear extends CI_Controller 
{
    private static $config_array;

    private static $set_wx_code_resp_id = 1002;
    private static $get_top_list_resp_id = 1004;
    private static $get_papercut_template_resp = 1006;
    private static $publish_design_resp = 1008;
    private static $get_design_list_resp = 1010;
    private static $vote_resp_id = 1012;
    private static $get_design_resp_id = 1014;
    private static $upload_wx_media_resp_id = 1016;

    private static $pre_design_url = 'http://mielseno.com/customunderwear/images/design/';
    private static $design_path;

    public function __construct()
    {
        parent::__construct();

        $this->load->library('PHPRequests');
        $this->load->model('CustomUnderwear_model');
        self::$config_array = get_cu_config();

        self::$design_path = APPPATH . '../customunderwear/images/design/';
    }

    public function index()
    {
        echo 'Hello CustomUnderwear.'.'<br>';
        $is_game_over = self::$config_array['is_game_over'];
        echo 'is_game_over: '.$is_game_over.'<br>';
    }

    # 1001    
    public function set_wx_code($wx_code, $design_id)
    {
        if (NULL == $wx_code)
        {
            $resp_array = array('id' => self::$set_wx_code_resp_id, 'uid' => 0);
            $resp_data = json_encode($resp_array, JSON_FORCE_OBJECT);
            echo $resp_data;

            return;
        }

        $ret_array = $this->request_wx_user_info($wx_code);

        if (NULL == $ret_array)
        {
            $resp_array = array('id' => self::$set_wx_code_resp_id, 'uid' => 0);
            $resp_data = json_encode($resp_array, JSON_FORCE_OBJECT);
            echo $resp_data;

            return;
        } 

        $info_json = $ret_array['info_json'];
        $token = $ret_array['token'];
        $info_array = array('openid' => $info_json->{'openid'},
                        'nickname' => $info_json->{'nickname'}, 
                        'sex' => $info_json->{'sex'}, 
                        'headimgurl' => $info_json->{'headimgurl'}, 
                        'province' => $info_json->{'province'}, 
                        'city' => $info_json->{'city'}, 
                        'country' => $info_json->{'country'});
        $this->CustomUnderwear_model->set_wx_user_info($token, $info_json);
        echo $this->merge_user_info($design_id, $info_array);
    }

    public function login($openid, $design_id)
    {
        if (NULL == $openid || NULL == $design_id)
        {
            $resp_array = array('id' => self::$set_wx_code_resp_id, 'uid' => 0);
            $resp_data = json_encode($resp_array, JSON_FORCE_OBJECT);
            echo $resp_data;

            return;
        }

        $info_array = $this->CustomUnderwear_model->get_user_info_total($openid);
        echo $this->merge_user_info($design_id, $info_array);
    }

    public function merge_user_info($design_id, $info_array)
    {
        // TODO: no design_id parma in url
        if (0 == $design_id)
        {

        }

        $resp_array = array('id' => self::$set_wx_code_resp_id,
                        'uid' => $info_array['openid'],
                        'n' => $info_array['nickname'],
                        's' => $info_array['sex'],
                        'pro' => $info_array['province'],
                        'city' => $info_array['city'],
                        'cou' => $info_array['country'],
                        'h' => $this->adjustHeadImgUrl($info_array['headimgurl']),
                        'is_game_over' => self::$config_array['is_game_over']);
        $resp_data = $this->to_json($resp_array);

        return $resp_data;
    }

    # 1003
    public function get_top_list($openid, $page_number, $count)
    {
        if (NULL == $openid || NULL == $page_number || NULL == $count)
        {
            $resp_array = array('id' => self::$get_top_list_resp_id, 'r' => 0, 'rea' => 1);
            $resp_data = json_encode($resp_array, JSON_FORCE_OBJECT);
            echo $resp_data;
            
            return;
        }

        $design_array = $this->CustomUnderwear_model->get_top_design($page_number, $count);
        $design_resp_array = $this->merge_design_info($design_array);

        if (0 < count($design_resp_array))
        {
            $resp_array = array('id' => self::$get_top_list_resp_id, 'r' => 1, 'rea' => 0, 'l' => $design_resp_array);
        }
        else
        {
            $resp_array = array('id' => self::$get_top_list_resp_id, 'r' => 1, 'rea' => 2);
        } 

        $resp_data = $this->to_json($resp_array);
        echo $resp_data;
    }
    
    # 1005
    public function get_papercut_template($openid)
    {
        if (NULL == $openid)
        {
            $resp_array = array('id' => self::$get_papercut_template_resp, 'r' => 0, 'rea' => 1);
            $resp_data = json_encode($resp_array, JSON_FORCE_OBJECT);
            echo $resp_data;
            return;
        }

        $template_array = $this->CustomUnderwear_model->get_papercut_template();
    
        if (0 < count($template_array))
        {
            $resp_array = array('id' => self::$get_papercut_template_resp, 'r' => 1, 'rea' => 0, 't' => $template_array);
        }
        else
        {
            $resp_array = array('id' => self::$get_papercut_template_resp, 'r' => 0, 'rea' => 2);
        }
       
        $resp_data = $this->to_json($resp_array);
        echo $resp_data;
    }

    # 1007
    public function publish_design($openid)
    {
        if (1 == self::$config_array['is_game_over'])
        {
            $resp_array = array('id' => self::$publish_design_resp, 'r' => 0, 'rea' => 1);
            $resp_data = json_encode($resp_array, JSON_FORCE_OBJECT);
            echo $resp_data;

            return;
        }

        if (NULL == $openid)
        {
            $resp_array = array('id' => self::$publish_design_resp, 'r' => 0, 'rea' => 2);
            $resp_data = json_encode($resp_array, JSON_FORCE_OBJECT);
            echo $resp_data;

            return;
        }

        // $name = $this->input->post('n');
        $name = '';
        $size = $this->input->post('s');
        $image = $this->input->post('i');

        if (NULL == $size || NULL == $image)
        {
            $resp_array = array('id' => self::$publish_design_resp, 'r' => 0, 'rea' => 2); 
            $resp_data = json_encode($resp_array, JSON_FORCE_OBJECT);
            echo $resp_data;

            return;
        }

        list($type, $image) = explode(';', $image); 
        list($head, $suffix) = explode('/', $type);
        list(, $image) = explode(',', $image);
        $image = base64_decode($image);

        // write image to file
        $file_name = $this->make_design_image_file($openid, $suffix);
        $file_url = self::$pre_design_url . $file_name;
        static $width = 320;
        $small_file_name = $this->make_small_image_file($file_name, $width, $suffix);
        $small_file_url = self::$pre_design_url . $small_file_name;
        $file_name = self::$design_path . $file_name;
        $small_file_name = self::$design_path . $small_file_name;

        // echo $file_name.'<br>';

        file_put_contents($file_name, $image);

        CommonImage::image_compression($file_name, $small_file_name, $width, $suffix);
        
        // write record to db
        $design_id = $this->CustomUnderwear_model->publish_design($openid, $name, $size, $file_url, $small_file_url);

        if (0 < $design_id)
        {
            $resp_array = array('id' => self::$publish_design_resp, 'r' => 1, 'rea' => 0, 'did' => $design_id);    
        }
        else
        {
            $resp_array = array('id' => self::$publish_design_resp, 'r' => 0, 'rea' => 3);
        }

        $resp_data = json_encode($resp_array, JSON_FORCE_OBJECT);
        echo $resp_data;
    }

    public function image_compression_test()
    {
        $src_file = '/tmp/p1764383942.png';
        $dest_file = '/tmp/p1764383942_320.png';
        $width = 320;
        CommonImage::image_compression($src_file, $dest_file, $width);
    }

    public function make_design_image_file($openid, $suffix = 'png')
    {
        date_default_timezone_set('PRC');
        $date = new DateTime();
        $ts = $date->getTimestamp();
        $random_num = rand(0, 10000);

        return $openid.'-'.$ts.'-'.$random_num.'.' . $suffix;
    }

    public function make_small_image_file($file_name, $width, $suffix = 'png')
    {
        $pre_str = substr($file_name, 0, strlen($file_name) - 4);
        return $pre_str . $width . '.' . $suffix;
    }

    # 1009
    public function get_design_list($openid, $start_id, $count)
    {
        if (NULL == $openid || NULL == $start_id || NULL == $count)
        {
            $resp_array = array('id' => self::$get_design_list_resp, 'r' => 0, 'rea' => 1);
            $resp_data = json_encode($resp_array, JSON_FORCE_OBJECT);
            echo $resp_data;
            
            return;
        }

        $design_array = $this->CustomUnderwear_model->get_design_list($start_id, $count);
        $design_resp_array = $this->merge_design_info($design_array);
        
        if (0 < count($design_resp_array))
        {
            $resp_array = array('id' => self::$get_design_list_resp, 'r' => 1, 'rea' => 0, 'l' => $design_resp_array);
        }
        else
        {
            $resp_array = array('id' => self::$get_design_list_resp, 'r' => 0, 'rea' => 2);
        }

        $resp_data = $this->to_json($resp_array);
        echo $resp_data;
    }

    public function merge_design_info($design_array)
    {
        $design_resp_array = array();

        foreach($design_array as $row) 
        {
            $user_info_array = $this->CustomUnderwear_model->get_user_info_min($row['uid']);
            $user_info_array['id'] = $row['id'];
            $user_info_array['di'] = $row['url'];
            // $user_info_array['dn'] = $row['name'];
            $user_info_array['v'] = $row['vote'];
            // $user_info_array['ts'] = $row['ts'];

            array_push($design_resp_array, $user_info_array);
        }

        return $design_resp_array;
    }

    # 1011
    public function vote($openid, $design_id)
    {
        if (1 == self::$config_array['is_game_over'])
        {
            $resp_array = array('id' => self::$vote_resp_id, 'r' => 0, 'rea' => 1);
            $resp_data = json_encode($resp_array, JSON_FORCE_OBJECT);
            echo $resp_data;

            return;
        }

        if (NULL == $openid || NULL == $design_id)
        {
            $resp_array = array('id' => self::$vote_resp_id, 'r' => 0, 'rea' => 2);
            $resp_data = json_encode($resp_array, JSON_FORCE_OBJECT);
            echo $resp_data;

            return;
        }

        if ($this->CustomUnderwear_model->vote($openid, $design_id))
        {
            $ret = $this->CustomUnderwear_model->add_vote($design_id);
            $resp_array = array('id' => self::$vote_resp_id, 'r' => $ret, 'rea' => 0, 'did' => $design_id);
        }
        else
        {
            $resp_array = array('id' => self::$vote_resp_id, 'r' => 0, 'rea' => 3);
        }
    
        $resp_data = json_encode($resp_array, JSON_FORCE_OBJECT);
        echo $resp_data; 
    }

    # 1013
    public function get_design($openid, $design_id)
    {
        if (NULL == $openid || NULL == $design_id)
        {
            $resp_array = array('id' => self::$get_design_resp_id, 'r' => 0, 'rea' => 1);
            $resp_data = json_encode($resp_array, JSON_FORCE_OBJECT);
            echo $resp_data;

            return;
        }
        
        $row = $this->CustomUnderwear_model->get_design($design_id);
       
        if (0 == count($row))
        {
            $resp_array = array('id' => self::$get_design_resp_id, 'r' => 0, 'rea' => 2);
        }
        else
        {
            $resp_array = array('id' => self::$get_design_resp_id, 'r' => 1, 'rea' => 0, 
                            'did' => $design_id, 'uid' => $openid, 'di' => $row['url'], 
                            'v' => $row['vote']);
        }

        $resp_data = $this->to_json($resp_array);
        echo $resp_data;
    }

    # 1015
    public function upload_wx_media($media_id)
    {
        if (NULL == $media_id)
        {
            $resp_array = array('id' => self::$upload_wx_media_resp_id, 'r' => 0, 'rea' => 1);
            $resp_data = json_encode($resp_array, JSON_FORCE_OBJECT);
            echo $resp_data;

            return;
        }

        // download image from wx server
        $access_token = $this->get_local_wx_access_token();
        // echo 'access_token: [' . $access_token . ']<br>';
        $image_url = 'http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=' 
                . urlencode($access_token) . '&media_id=' . urlencode($media_id);
        // echo 'image_url: [' . $image_url . ']<br>';

        static $width = 640;
        $suffix = 'jpeg';
        $file_name = self::$design_path . $media_id . '.'. $suffix;
        // echo 'file_name: [' . $file_name . ']<br>';
        copy($image_url, $file_name);

        $small_file_name = $media_id . $width . '.' . $suffix;
        $small_file_url = self::$pre_design_url . $small_file_name;
        $small_file_name = self::$design_path . $small_file_name;

        // image_compression 
        CommonImage::image_compression($file_name, $small_file_name, $width, $suffix);

        $resp_array = array('id' => self::$upload_wx_media_resp_id, 'r' => 1, 'rea' => 0, 
                        'u' => $small_file_url);
        $resp_data = $this->to_json($resp_array);
        echo $resp_data;
    }

    public function get_local_wx_access_token()
    {
        $url = 'http://mielseno.com/wx/getAccessToken.php?appid=customunderwear_app_1231247';
        $options = array('timeout' => 60);
        $token_resp = Requests::get($url, array(), $options);

        return $token_resp->body;
    }

    /* common */
    public function request_wx_user_info($wx_code)
    {
        $token_openid_array = $this->get_wx_access_token($wx_code); 
        $wx_user_info = $this->get_wx_user_info($token_openid_array[0], $token_openid_array[1]);

        if (NULL == $wx_user_info)
        {
            return NULL;
        }

        # TODO: debug
        // $wx_user_info = '{"openid":"o3xSes_Yr9MresBkAwBAbfwlMVQk","nickname":"测试名","sex":1,"language":"zh_CN","city":"深圳","province":"广东","country":"中国","headimgurl":"http:\/\/wx.qlogo.cn\/mmopen\/tqRiaNianNl1l0iclIFLuEBRF8ZAosiavTRluqcbRHoJpLprcWeTkbyeeBV7iaSgq7jHmkk83aBIchBdYdtzPtDYJ7KzgNibNnXDc1\/0","privilege":[]}';
        // echo $wx_user_info.'<br>';
        
        /*
        # TODO: test
        $res_array = $this->CustomUnderwear_model->get_design_id();
        # travel array
        foreach($res_array as $row)
        {
            // echo $row['id'];
            // echo $row['extra'];
        }
        */

        // echo '<br><br>';
        $info_json = json_decode($wx_user_info);

        return array('info_json' => $info_json, 'token' => $token_openid_array[0]);
    }

    private function get_wx_access_token($wx_code)
    {
        $url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=wxbb5f8f68dfc90d6c&secret=5ef71993c7b0019653432c3c65bde110&code='.$wx_code.'&grant_type=authorization_code';
        // echo $url;
        $options = array('timeout' => 30);
        $token_resp = Requests::get($url, array(), $options);
        $token_resp_json = json_decode($token_resp->body);

        if (property_exists($token_resp_json, 'access_token'))
        {
            $access_token = $token_resp_json->{'access_token'};
        }
        else
        {
            $access_token = NULL;
        }
        
        if (property_exists($token_resp_json, 'openid'))
        {
            $openid = $token_resp_json->{'openid'};
        }
        else
        {
            $openid = NULL;
        }

        return array($access_token, $openid);
    }

    private function get_wx_user_info($access_token, $openid)
    {
        if (NULL == $access_token || NULL == $openid)
        {
            return NULL;
        }

        $url = 'https://api.weixin.qq.com/sns/userinfo?access_token='.$access_token.'&openid='.$openid.'&lang=zh_CN';
        // echo 'user_info_url: '.$url.'<br>';
        $options = array('timeout' => 30);
        $info_resp = Requests::get($url, array(), $options);
        return $info_resp->body;
    }

    public function adjustHeadImgUrl($imgUrl)
    {
        if (!empty($imgUrl) && '0' == substr($imgUrl, -1))
        {
            $preUrl = substr($imgUrl, 0, strlen($imgUrl) - 1);

            return $preUrl.'64';
        }
        else
        {
            return $imgUrl;
        }
    }

    /*************************************************************
     *
     *  使用特定function对数组中所有元素做处理
     *  @param  string  &$array     要处理的字符串
     *  @param  string  $function   要执行的函数
     *  @return boolean $apply_to_keys_also     是否也应用到key上
     *  @access private
     *
     ************************************************************/
    private function array_recursive(&$array, $function, $apply_to_keys_also = false){
        static $recursive_counter = 0;
        if (++$recursive_counter > 1000) 
        {
            die('possible deep recursion attack');
        }

        foreach ($array as $key => $value) 
        {
            if (is_array($value)) 
            {
                $this->array_recursive($array[$key], $function, $apply_to_keys_also);
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

    /*************************************************************
     *
     *  将数组转换为JSON字符串（兼容中文）
     *  @param  array   $array      要转换的数组
     *  @return string      转换得到的json字符串
     *  @access private
     *
     ************************************************************/
    private function to_json($array_in) 
    {
        $this->array_recursive($array_in, 'urlencode', true);
        // if use JSON_FORCE_OBJECT, it will turn array to '{0:{}, 1:{}}'.
        $json = json_encode($array_in);

        return urldecode($json);
    }
}
