import { MikroORM } from '@mikro-orm/core';
import './constants';
import { _prod } from './constants';
import { Post } from './entities/Post';
import config from './mikro-orm.config';

const main = async () => {
	const orm = await MikroORM.init(config);

	// await orm.isConnected();
	orm.getMigrator().up();

	const generator = orm.getSchemaGenerator();
	await generator.updateSchema();

	const post = orm.em.create(Post, { title: 'OK' });
	await orm.em.persistAndFlush(post);

	const posts = await orm.em.find(Post, {});

	console.log('$$: ', posts);
};

main().catch((err) => console.error(err));
