const { zip } = require('compressing');
const fs = require('fs-extra');
const { join } = require('path');
const { exec } = require('shelljs');
const readline = require('readline');
const { taget_path } = require('../config.json');

const SOURCE_PATH = join(__dirname, './canal-package');
const TARGET_DIR = taget_path;
const CANAL_TEMPLATE_PATH = join(__dirname, './config_template/canal_template.properties');
const CANAL_EXAMPLE_INSTANCE_PATH = join(__dirname, './config_template/canal_example_instance_template.properties');
const CANAL_TARGET_PATH = join(__dirname, './canal-package/conf/canal.properties');
const CANAL_EXAMPLE_TARGET_PATH = join(__dirname, './canal-package/conf/example/instance.properties');

const CONFIG_LIST = [
    {
        tempPath: CANAL_EXAMPLE_INSTANCE_PATH,
        targetPath: CANAL_EXAMPLE_TARGET_PATH,
    },
    {
        tempPath: CANAL_TEMPLATE_PATH,
        targetPath: CANAL_TARGET_PATH,
    },
];

async function main() {
    try {
        fs.ensureDirSync(TARGET_DIR);

        for (let i = 0; i < CONFIG_LIST.length; i++) {
            const { tempPath, targetPath } = CONFIG_LIST[i];
            await updateRedisConfig(tempPath, targetPath);
        }
    } catch (_) {
        console.log(_);
    }
}

async function updateRedisConfig(tempPath, targetPath) {
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
            if (line.startsWith('logfile')) {
                return fs.appendFileSync(targetPath, `logfile "${log_file}" \n`);
            }
            fs.appendFileSync(targetPath, `${line} \n`);
        });

        rl.on('close', resolve(true));
    });
}

module.exports = { main, updateRedisConfig };
