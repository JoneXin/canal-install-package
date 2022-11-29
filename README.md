## 介绍

canal 自动自动安装脚本 跨平台支持  win + linux

- 在win模式下用的第三方套壳软件代理注册的服务相关如/package/canal/bin/CanalService.exe

- 在linux模式下，服务级启动[开发中...]
## 配置

### 1, 目标机器有 node + java 的环境

### 2, 监控的mysql 开启binlog

```sql
log-bin=mysql-bin # 开启 binlog
binlog-format=ROW # 选择 ROW 模式
server_id=0 # 配置 MySQL replaction 需要定义，不要和 canal 的 slaveId 重复
```

### 3，新增mysql账号并赋予slave权限

```sql
CREATE USER canal IDENTIFIED BY 'canal';  
GRANT SELECT, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'canal'@'%';
-- GRANT ALL PRIVILEGES ON *.* TO 'canal'@'%' ;
FLUSH PRIVILEGES;
```

### 4, 配置的模式是kafka,需要 安装kafka 和 zookeper  

安装时配置如下
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

