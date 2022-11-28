const os = require('os');
const fs = require('fs-extra');
const readline = require('readline');
const { zip } = require('compressing');
const { join } = require('path');
const { exec, cd } = require('shelljs');
const { taget_path, inspect_mysql_config, kafka, mq_topic, zookeeper, canal_config } = require('../config.json');

const OS_TYPE = os.type() == 'Windows_NT' ? 'win' : 'linux';
const TARGET_DIR = taget_path;
const CANAL_TEMPLATE_PATH = join(__dirname, './config_template/canal_template.properties');
const CANAL_EXAMPLE_INSTANCE_PATH = join(__dirname, './config_template/canal_example_instance_template.properties');
const CANAL_TARGET_PATH = join(__dirname, './canal/conf/canal.properties');
const CANAL_EXAMPLE_TARGET_PATH = join(__dirname, './canal/conf/example/instance.properties');

const CONFIG_LIST = [
    {
        desc: 'cannal instance config',
        tempPath: CANAL_EXAMPLE_INSTANCE_PATH,
        targetPath: CANAL_EXAMPLE_TARGET_PATH,
        confCertification: {
            master_address: (line) => {
                if (line.startsWith('canal.instance.master.address')) {
                    fs.appendFileSync(
                        CANAL_EXAMPLE_TARGET_PATH,
                        `canal.instance.master.address=${inspect_mysql_config.host}:${inspect_mysql_config.port} \n`,
                    );
                    return true;
                }
                return false;
            },
            canal_db_user: (line) => {
                if (line.startsWith('canal.instance.dbUsername')) {
                    fs.appendFileSync(
                        CANAL_EXAMPLE_TARGET_PATH,
                        `canal.instance.dbUsername=${inspect_mysql_config.user} \n`,
                    );
                    return true;
                }
                return false;
            },
            canal_db_password: (line) => {
                if (line.startsWith('canal.instance.dbPassword')) {
                    fs.appendFileSync(
                        CANAL_EXAMPLE_TARGET_PATH,
                        `canal.instance.dbPassword=${inspect_mysql_config.password} \n`,
                    );
                    return true;
                }
                return false;
            },
            canal_mq_topic: (line) => {
                if (line.startsWith('canal.mq.topic')) {
                    fs.appendFileSync(CANAL_EXAMPLE_TARGET_PATH, `canal.mq.topic=${mq_topic} \n`);
                    return true;
                }
                return false;
            },
        },
    },
    {
        desc: 'cannal config',
        tempPath: CANAL_TEMPLATE_PATH,
        targetPath: CANAL_TARGET_PATH,
        confCertification: {
            canal_ip: (line) => {
                if (line.startsWith('canal.ip')) {
                    fs.appendFileSync(CANAL_TARGET_PATH, `canal.ip=${canal_config.ip} \n`);
                    return true;
                }
                return false;
            },
            canal_register_ip: (line) => {
                if (line.startsWith('canal.register.ip')) {
                    fs.appendFileSync(CANAL_TARGET_PATH, `canal.register.ip=${canal_config.ip} \n`);
                    return true;
                }
                return false;
            },
            canal_zkServers: (line) => {
                if (line.startsWith('canal.zkServers')) {
                    fs.appendFileSync(CANAL_TARGET_PATH, `canal.zkServers=${zookeeper.ip}:${zookeeper.port} \n`);
                    return true;
                }
                return false;
            },
            canal_destinations: (line) => {
                if (line.startsWith('canal.destinations')) {
                    fs.appendFileSync(CANAL_TARGET_PATH, `canal.destinations=${mq_topic} \n`);
                    return true;
                }
                return false;
            },
            kafka_bootstrap_servers: (line) => {
                if (line.startsWith('kafka.bootstrap.servers ')) {
                    fs.appendFileSync(CANAL_TARGET_PATH, `kafka.bootstrap.servers=${kafka.ip}:${kafka.port} \n`);
                    return true;
                }
                return false;
            },
        },
    },
];

async function main() {
    try {
        fs.ensureDirSync(TARGET_DIR);
        await handleConfig();
        console.log(`start copy to ${TARGET_DIR} ...`);
        await moveToTargetDir();
        console.log(`start open service ...`);
        startService();
        console.log(`service open success!`);
    } catch (_) {
        console.log(_);
    }
}

async function handleConfig() {
    for (let i = 0; i < CONFIG_LIST.length; i++) {
        console.log(`update${CONFIG_LIST[i].desc}...`);
        await updateRedisConfig(CONFIG_LIST[i]);
    }
}

function startService() {
    if (OS_TYPE == 'win') {
        cd(`${TARGET_DIR}/canal/bin`);
        exec(`CanalService.exe stop`);
        exec(`CanalService.exe uninstall`);
        exec(`CanalService.exe install`);
        exec(`CanalService.exe start`);
        return;
    }
    exec(`${TARGET_DIR}/canal/bin/stop.sh`);
    exec(`${TARGET_DIR}/canal/bin/startup.sh`);
}

async function updateRedisConfig({ tempPath, targetPath, confCertification }) {
    return new Promise((resolve, reject) => {
        try {
            fs.writeFileSync(targetPath, '');
        } catch (_) {
            console.error(_);
            reject(false);
        }

        const rl = readline.createInterface({
            input: fs.createReadStream(tempPath),
            terminal: false,
        });

        rl.on('line', (line) => {
            appConfiguration(line, confCertification, targetPath);
        });

        rl.on('close', resolve(true));
    });
}

function appConfiguration(line, confCertification, targetPath) {
    const confRulesList = Object.values(confCertification);
    for (let i = 0; i < confRulesList.length; i++) {
        if (confRulesList[i](line)) return;
    }
    return fs.appendFileSync(targetPath, `${line} \n`);
}

async function moveToTargetDir() {
    const canelDir = join(__dirname, './canal');
    await zip.compressDir(canelDir, `${TARGET_DIR}.zip`);
    await zip.uncompress(`${TARGET_DIR}.zip`, `${TARGET_DIR}`);
}

module.exports = { main };
