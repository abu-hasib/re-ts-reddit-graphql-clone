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
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from './types';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';

const main = async () => {
	const orm = await MikroORM.init(config);
	await orm.getMigrator().up();
	const app = express();

	const RedisStore = connectRedis(session);
	const redisClient = redis.createClient();

	app.use(
		session({
			name: 'sid',
			store: new RedisStore({ client: redisClient, disableTouch: true }),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
				httpOnly: true,
				sameSite: 'lax', // csrf
				secure: _prod, // cookie only works in https
			},
			saveUninitialized: false,
			secret: 'klsndfmenfk',
			resave: false,
		})
	);

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
		plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
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
