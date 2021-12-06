import { MikroORM } from '@mikro-orm/core';
import path from 'path/posix';
import { _prod } from './constants';
import { Post } from './entities/Post';
import { User } from './entities/User';

export default {
	migrations: {
		path: path.join(__dirname, './migrations'),
		pattern: /^[\w-]+\d+\.[tj]s$/,
	},
	entities: [Post, User],
	dbName: 'rereddit',
	type: 'postgresql',
	debug: !_prod,
} as Parameters<typeof MikroORM.init>[0];
