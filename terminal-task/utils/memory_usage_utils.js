exports.MEMORY_USAGE_HELP_LIST = [
	['PID', 'Shows task’s unique process id.'],
	['USER', 'User name of owner of task.'],
	['PR', 'Stands for priority of the task.'],
	[
		'NI',
		'Represents a Nice Value of task. A Negative nice value implies higher priority, and positive Nice value means lower priority.',
	],
	['VIRT', 'Total virtual memory used by the task.'],
	[
		'RES',
		'How much physical RAM the process is using, measured in kilobytes',
	],
	['SHR', 'Represents the amount of shared memory(kb) used by a task.'],
	[
		'S',
		'Status of the process. D->Uninterruptible sleep, R->Running, S->Sleeping, T->Traced (stopped), Z->Zombie',
	],
	['[%CPU]', 'Represents the CPU usage.'],
	['%MEM', 'Shows the Memory usage of task.'],
	[
		'TIME+',
		'CPU Time, the same as ‘TIME’, but reflecting more granularity through hundredths of a second.',
	],
	['P_NAME', 'Packet name'],
];