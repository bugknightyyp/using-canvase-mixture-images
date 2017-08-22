<?php

class CustomUnderwear_model extends CI_Model
{
    private static $custom_underwear_db;

    public function __construct()
    {
            self::$custom_underwear_db = $this->load->database('custom_underwear_db', TRUE);
    } 

    public function set_wx_user_info($access_token, $info_json)
    {
        $insert_sql = 'INSERT INTO user_t (openid, nickname, sex, province, city,
                        country, headimgurl, access_token, is_removed) VALUES ('
                        .self::$custom_underwear_db->escape($info_json->{'openid'}).', '
                        .self::$custom_underwear_db->escape($info_json->{'nickname'}).', '
                        .$info_json->{'sex'}.','
                        .self::$custom_underwear_db->escape($info_json->{'province'}).', '
                        .self::$custom_underwear_db->escape($info_json->{'city'}).', '
                        .self::$custom_underwear_db->escape($info_json->{'country'}).', '
                        .self::$custom_underwear_db->escape($info_json->{'headimgurl'}).', '
                        .self::$custom_underwear_db->escape($access_token).', 0);';
        // echo $insert_sql.'<br>';
        self::$custom_underwear_db->query($insert_sql);
        // echo self::$custom_underwear_db->affected_rows();

        return self::$custom_underwear_db->affected_rows();
    }

    public function get_user_info_total($openid)
    {
        $query_sql = 'SELECT openid, nickname, sex, headimgurl, province, city, country FROM user_t WHERE openid = '.self::$custom_underwear_db->escape($openid).' LIMIT 1;';
        return $this->get_user_info($query_sql); 
    }

    public function get_user_info_min($openid)
    {
        $query_sql = 'SELECT openid AS uid, nickname AS n FROM user_t WHERE openid = '.self::$custom_underwear_db->escape($openid).' LIMIT 1;';
        return $this->get_user_info($query_sql); 
    }
    
    public function get_user_info($query_sql)
    {
        // echo $query_sql.'<br>';
        $query = self::$custom_underwear_db->query($query_sql);
        return $query->row_array(); 
    }

    public function get_papercut_template()
    {
        $query_sql = 'SELECT id, name AS n, url AS u FROM papercut_template_t;';
        $query = self::$custom_underwear_db->query($query_sql);

        return $query->result_array();
    }

    /* TODO: 一个作品重复发布 */
    public function publish_design($openid, $name, $size, $url, $small_image_url)
    {
        $insert_sql = 'INSERT INTO design_t (uid, name, size, url, small_image_url) 
                VALUES ('
                . self::$custom_underwear_db->escape($openid) . ', ' 
                . self::$custom_underwear_db->escape($name) . ', ' 
                . $size .', '.self::$custom_underwear_db->escape($url) . ', ' 
                . self::$custom_underwear_db->escape($small_image_url) . ');';
        // echo $insert_sql.'<br>';
        self::$custom_underwear_db->trans_start();
        self::$custom_underwear_db->query($insert_sql);
        $query_sql = 'SELECT LAST_INSERT_ID() AS id;';
        $query = self::$custom_underwear_db->query($query_sql);
        $row = $query->row_array();
        self::$custom_underwear_db->trans_complete();

        if (self::$custom_underwear_db->trans_status())
        {
            return $row['id'];
        }
        else
        {
            return 0;
        }
    } 

    public function get_design_list($start_id, $count)
    {
        $query_sql = 'SELECT id, uid, name, url, vote, ts FROM design_t WHERE id > '.$start_id.' LIMIT '.$count.';';
        // echo $query_sql.'<br>';
        $query = self::$custom_underwear_db->query($query_sql);

        return $query->result_array();
    }

    public function get_design($design_id)
    {
        $query_sql = 'SELECT url, vote FROM design_t WHERE id = ' . $design_id . ';';
        $query = self::$custom_underwear_db->query($query_sql);
         
        return $query->row_array();
    }

    public function get_top_design($page_number, $count)
    {
        $offset = $page_number * $count;
        $query_sql = 'SELECT b.id, b.uid, b.name, b.small_image_url AS url, b.vote FROM 
                (SELECT id FROM design_t ORDER BY vote DESC, ts DESC 
                LIMIT ' . $offset . ',' . $count . ') a 
                LEFT JOIN design_t b 
                ON a.id = b.id;'; 
        
        $query = self::$custom_underwear_db->query($query_sql);

        return $query->result_array();
    }

    public function vote($openid, $design_id)
    {
        $insert_sql = 'INSERT INTO vote_t (did, uid) VALUES ('.$design_id.', '.self::$custom_underwear_db->escape($openid).');';
        self::$custom_underwear_db->trans_start(); 
        self::$custom_underwear_db->query($insert_sql);
        self::$custom_underwear_db->trans_complete();

        return self::$custom_underwear_db->trans_status();
    }

    public function add_vote($design_id)
    {
        $query_sql = 'UPDATE design_t SET vote = vote + 1 WHERE id = '.$design_id.';';
        self::$custom_underwear_db->query($query_sql);

        return self::$custom_underwear_db->affected_rows();
    }
}

