import { MikroORM } from '@mikro-orm/core';
import path from 'path/posix';
import { _prod } from './constants';
import { Post } from './entities/Post';

export default {
	migrations: {
		path: path.join(__dirname, './migrations'),
		pattern: /^[\w-]+\d+\.[tj]s$/,
	},
	entities: [Post],
	dbName: 'rereddit',
	type: 'postgresql',
	debug: !_prod,
} as Parameters<typeof MikroORM.init>[0];
