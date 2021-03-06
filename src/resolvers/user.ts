import { Resolver, Mutation, Arg, InputType, Field, Ctx, ObjectType, Query } from 'type-graphql';
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

@ObjectType()
class FieldError {
	@Field()
	field: string;

	@Field()
	message: string;
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => User, { nullable: true })
	user?: User;
}

@Resolver()
export class UserResolver {
	@Query(() => User, { nullable: true })
	async me(@Ctx() { req, em }: MyContext) {
		const { userId } = req.session;
		console.log('$$ ', req.session);
		if (!userId) {
			return null;
		}

		const user = await em.findOne(User, { id: userId });
		return user;
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg('options') options: UsernamePasswordInput,
		@Ctx() { em }: MyContext
	): Promise<UserResponse> {
		if (options.username.length <= 2) {
			return {
				errors: [
					{
						field: 'username',
						message: 'length must be greater than 2',
					},
				],
			};
		}

		if (options.password.length <= 2) {
			return {
				errors: [
					{
						field: 'password',
						message: 'length must be greater than 2',
					},
				],
			};
		}

		const hashedPassword = await argon2.hash(options.password);
		const user = em.create(User, {
			username: options.username,
			password: hashedPassword,
		});
		try {
			await em.persistAndFlush(user);
		} catch (err) {
			//|| err.detail.includes("already exists")) {
			// duplicate username error
			if (err.code === '23505') {
				return {
					errors: [
						{
							field: 'username',
							message: 'username already taken',
						},
					],
				};
			}
		}
		return { user };
	}

	// @Query(() => [User])
	// async users(@Ctx() { em }: MyContext): Promise<User[]> {
	// 	return em.find(User, {});
	// }
	@Mutation(() => UserResponse)
	async login(
		@Arg('options') options: UsernamePasswordInput,
		@Ctx() { em, req }: MyContext
	): Promise<UserResponse> {
		const user = await em.findOne(User, { username: options.username });
		// if (!user) {
		// 	return {
		// 		errors: {
		// 			field: 'username',
		// 		},
		// 	};
		// }
		if (!user) {
			return {
				errors: [
					{
						field: 'username',
						message: "that username doesn't exist",
					},
				],
			};
		}
		const isValid = await argon2.verify(user.password, options.password);
		if (!isValid) {
			return {
				errors: [
					{
						field: 'password',
						message: 'incorrect password',
					},
				],
			};
		}

		req.session.userId = user.id;
		return {
			user,
		};
	}
}
