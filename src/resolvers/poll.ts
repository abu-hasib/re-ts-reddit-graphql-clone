import { Poll } from '../entities/Poll';

import { MyContext } from 'src/types';
import { Ctx, Query, Resolver } from 'type-graphql';

@Resolver()
export class PollResolver {
	@Query(() => [Poll])
	posts(@Ctx() { em }: MyContext): Promise<Poll[]> {
		return em.find(Poll, {});
	}
}
