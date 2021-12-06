import 'reflect-metadata';

import { MikroORM } from '@mikro-orm/core';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { buildSchema } from 'type-graphql';
import './constants';
import { _prod } from './constants';
// import { Post } from './entities/Post';
import config from './mikro-orm.config';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

const main = async () => {
	const orm = await MikroORM.init(config);
	await orm.getMigrator().up();
	const app = express();

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		context: () => ({ em: orm.em }),
	});

	await apolloServer.start();
	apolloServer.applyMiddleware({ app });

	app.listen(8000, () => {
		console.log('app listening on 8000');
	});
	// const generator = orm.getSchemaGenerator(;
	// // await generator.updateSchema();

	// const post = orm.em.create(Post, { title: 'OK' });
	// await orm.em.persistAndFlush(post);

	// const posts = await orm.em.find(Post, {});

	// console.log('$$: ', posts);
};

main().catch((err) => console.error(err));
