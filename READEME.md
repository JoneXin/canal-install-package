## 介绍

canal 自动自动安装脚本 跨平台支持  win + linux

## 配置

```json
{
    "taget_path": "D:/hzleaper_auto_install/canal",
    "inspect_mysql_config": {
        "host": "192.168.0.132",
        "port": 3306,
        "user": "canal",
        "password": "canal"
    },
    "kafka": "192.168.0.132:9092",
    "mq_topic": "example",
    "zookeeper": "192.168.0.132:2181"
}

```

## 启动

`node install.js`

## 目录结构

开发中....

