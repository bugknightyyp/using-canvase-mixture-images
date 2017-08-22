#!/bin/bash

#/*
# * filename      : create_custom_underwear_db.sh
# * descriptor    : 
# * author        : Kevin    
# * create time   : 2015-12-01
# * modify list   :
# * +----------------+---------------+---------------------------+
# * | date           | who           | modify summary            |
# * +----------------+---------------+---------------------------+
# */


database_name="custom_underwear_d"
MYSQL="/usr/local/mysql/bin/mysql -uroot -plsz-101914 --default-character-set=utf8mb4 "

function drop_db()
{
    drop_db_sql="DROP DATABASE ${database_name}"
    ${MYSQL} -e "${drop_db_sql}"
}

function create_db()
{
    create_db_sql="CREATE DATABASE IF NOT EXISTS ${database_name};"
    ${MYSQL} -e "${create_db_sql}"
}

function create_user_table()
{
    table_name="user_t"
    create_table_sql="CREATE TABLE IF NOT EXISTS ${table_name}(
        openid VARCHAR(230) NOT NULL DEFAULT '' COMMENT 'wx openid',
        nickname VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'nickname',
        sex TINYINT(2) NOT NULL DEFAULT 0 COMMENT '0:not know, 1:male, 2:female',
        province VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'province',
        city VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'city',
        country VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'country',
        headimgurl VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'head image url',
        privilege VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'privilege: json array',
        unionid VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'may not exist',
        access_token VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'access_token',
        is_removed TINYINT(2) NOT NULL DEFAULT '0' COMMENT '0: No, 1: Yes', 
        ts TIMESTAMP DEFAULT NOW() COMMENT 'insert timestamp',

        PRIMARY KEY(openid),
        INDEX(is_removed)
        ) ENGINE=MYISAM DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"

    ${MYSQL} ${database_name} -e "${create_table_sql}"
    echo "create table "${table_name}
}

function create_papercut_template_table()
{
    table_name="papercut_template_t"
    create_table_sql="CREATE TABLE IF NOT EXISTS ${table_name}(
        id INT(11) NOT NULL AUTO_INCREMENT COMMENT 'auto increment id',
        name VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'template name',
        url VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'template url',
        
        PRIMARY KEY(id)
        ) ENGINE=MYISAM DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"

    ${MYSQL} ${database_name} -e "${create_table_sql}"
    echo "create table "${table_name}
}

function create_design_id_table()
{
    table_name="design_id_t"
    create_table_sql="CREATE TABLE IF NOT EXISTS ${table_name}(
        id BIGINT(64) NOT NULL AUTO_INCREMENT COMMENT 'design id',
        extra char(1) NOT NULL DEFAULT '' COMMENT 'extra data',

        PRIMARY KEY(id),
        UNIQUE KEY extra(extra)
        ) ENGINE=MYISAM DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"

    ${MYSQL} ${database_name} -e "${create_table_sql}"
    echo "create table "${table_name}
}

function create_design_table()
{
    table_name="design_t"
    create_table_sql="CREATE TABLE IF NOT EXISTS ${table_name}(
        id INT(11) NOT NULL AUTO_INCREMENT COMMENT 'auto increment id',
        uid VARCHAR(230) NOT NULL DEFAULT '' COMMENT 'user wx openid', 
        name VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'design name',  
        size INT(11) NOT NULL DEFAULT 0 COMMENT 'design image size, in byte',
        url VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'design image url',
        small_image_url VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'design small image url',
        vote INT(11) NOT NULL DEFAULT 0 COMMENT 'vote',
        ts TIMESTAMP DEFAULT NOW() COMMENT 'insert timestamp',   

        PRIMARY KEY(id),
        INDEX(uid),
        INDEX(vote)
        ) ENGINE=MYISAM DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"

    ${MYSQL} ${database_name} -e "${create_table_sql}"
    echo "create table "${table_name}
}

function create_vote_table()
{
    table_name="vote_t"
    create_table_sql="CREATE TABLE IF NOT EXISTS ${table_name}(
        did INT(11) NOT NULL DEFAULT 0 COMMENT 'design id',        
        uid VARCHAR(230) NOT NULL DEFAULT '' COMMENT 'user wx openid',
        ts TIMESTAMP DEFAULT NOW() COMMENT 'insert timestamp',

        PRIMARY KEY(did, uid)
        ) ENGINE=MYISAM DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"

    ${MYSQL} ${database_name} -e "${create_table_sql}"
    echo "create table "${table_name}
}

create_db
create_user_table
create_papercut_template_table
create_design_id_table
create_design_table
create_vote_table
