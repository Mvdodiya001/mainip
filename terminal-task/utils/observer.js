const { execSync, spawnSync } = require('child_process');
const fs = require('fs');

class Observer {
	constructor() {
		this.service_data = {};
		this.service_history = [];
		this.apps_service_history = {};

		this.text_file = 'x.txt';
		// this.json_file = null;

		this.__to_get_service_data = false;
		this.__to_get_service_history = false;
		this.__to_get_apps_service_history = false;
	}

	set_text_file(text_file) {
		this.text_file = text_file;
	}

	set_command(command) {
		this.command = command;
	}

	to_get_service_data() {
		this.__to_get_service_data = true;
		this.__to_get_service_history = false;
		this.__to_get_apps_service_history = false;
	}

	to_get_service_history() {
		this.__to_get_service_data = false;
		this.__to_get_service_history = true;
		this.__to_get_apps_service_history = false;
	}

	to_get_apps_service_history() {
		this.__to_get_service_data = false;
		this.__to_get_service_history = false;
		this.__to_get_apps_service_history = true;
	}

	connect_json(json_file) {
		this.json_file = json_file;
		// clear this json file
		fs.writeFileSync(this.json_file, JSON.stringify({}, null, 4));
	}

	get_data() {
		if (this.__to_get_service_data) {
			return this.service_data;
		}
		if (this.__to_get_service_history) {
			return this.service_history;
		}
		if (this.__to_get_apps_service_history) {
			return this.apps_service_history;
		}
	}

	run_command(useTempFile = false) {
		if (useTempFile) {
			execSync(this.command + ' > ' + this.text_file);
			return 0;
		}

		let data = '';
		try {
			execSync(`${this.command} > ${this.text_file}`, {
				encoding: 'utf8',
				shell: '/bin/bash',
				cwd: `${__dirname}`,
			});
			data = fs.readFileSync(`${__dirname}/${this.text_file}`, 'utf8');
		} catch (err) {
			if (/not found/.test(err)) {
				throw new Error('Device not found');
			} else {
				throw new Error(err.stderr);
			}
		}

		// console.log(
		// 	data
		// 		.split('\n')
		// 		.filter((el) => el.includes('CONNECT'))
		// 		.join('\n')
		// );
		return data;
	}

	look(save = false, useTempFile = false) {
		this.data = this.run_command(useTempFile);
		// console.log(this.data)
		this.__look__();
		if (save) {
			this.save();
		}
	}

	__look__() {
		// Implement this method in subclasses
	}

	watch(timesec, save = true, useTempFile = false) {
		const current_time = new Date();
		while ((new Date() - current_time) / 1000 < timesec) {
			try {
				this.look(save, useTempFile);
			} catch (e) {
				break;
			}
		}
	}

	save() {
		const dataToSave = this.__to_get_service_data
			? this.service_data
			: this.__to_get_service_history
			? this.service_history
			: this.apps_service_history;

		if (this.json_file) {
			fs.writeFileSync(
				this.json_file,
				JSON.stringify(dataToSave, null, 4)
			);
		}
	}
}

module.exports = Observer;
