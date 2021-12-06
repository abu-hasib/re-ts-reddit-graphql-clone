import { Resolver, Mutation, Arg, InputType, Field, Ctx, Query } from 'type-graphql';
import { MyContext } from '../types';
import { User } from '../entities/User';
// import argon2 from 'argon2';
// import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver } from 'type-graphql';
import argon2 from 'argon2';

@InputType()
class UsernamePasswordInput {
	@Field()
	username: string;
	@Field()
	password: string;
}

@Resolver()
export class UserResolver {
	@Mutation(() => User)
	async register(@Arg('options') options: UsernamePasswordInput, @Ctx() { em }: MyContext) {
		const hashedPassword = await argon2.hash(options.password);
		const user = em.create(User, {
			username: options.username,
			password: hashedPassword,
		});
		await em.persistAndFlush(user);
		return user;
	}

	@Query(() => User)
	async users(@Ctx() { em }: MyContext) {
		return em.find(User, {});
	}
}
