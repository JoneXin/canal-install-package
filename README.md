## 介绍

canal 自动自动安装脚本 跨平台支持  win + linux

## 配置

### 1, 目标机器有 node + java 的环境

### 2, 监控的mysql 开启binlog

### 3, 配置的模式是kafka,需要 安装kafka 和 zookeper


```json

{
    "taget_path": "D:/hzleaper_auto_install/canal",
    "inspect_mysql_config": {
        "host": "127.0.0.1",
        "port": 3306,
        "user": "canal",
        "password": "canal"
    },
    "kafka": {
        "ip": "101.43.105.27",
        "port": 9092
    },
    "mq_topic": "pol_c",
    "zookeeper": {
        "ip": "101.43.105.27",
        "port": 2181
    },
    "canal_config": {
        "ip": "127.0.0.1",
        "port": 11111,
        "canal_metrics_pull_port": 11112,
        "canal_admin_port": 11110
    }
}


```

## 启动

`node install.js`

## 目录结构

```text
canal-install-package
 ├─ package
 │ ├─ canal // canal 源文件包
 │ ├─ config_template // 配置模板
 │ │ ├─ canal_example_instance_template.properties
 │ │ └─ canal_template.properties
 │ └─ index.js // 入口
 ├─ config.json
 └─ install.js
```

