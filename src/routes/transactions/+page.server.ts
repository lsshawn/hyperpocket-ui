import { faker } from '@faker-js/faker';
import {
	transactionStatusEnum,
	transactionTypeEnum,
	transactionDirectionEnum
} from '$lib/server/db/schema';

/** @type {import('./$types').PageServerLoad} */
export function load() {
	const createRandomTransaction = () => {
		const type = faker.helpers.arrayElement(transactionTypeEnum.enumValues);
		const grossAmount = faker.number.float({ min: 1, max: 5000, multipleOf: 0.01 });
		const fee = faker.number.float({ min: 0, max: grossAmount * 0.05, multipleOf: 0.01 });
		const netAmount = grossAmount - fee;

		let direction;
		if (type === 'deposit') {
			direction = 'credit';
		} else if (type === 'withdrawal' || type === 'fee') {
			direction = 'debit';
		} else {
			// 'transfer' or 'payment'
			direction = faker.helpers.arrayElement(transactionDirectionEnum.enumValues);
		}

		return {
			id: faker.string.uuid(),
			walletAccountId: faker.string.uuid(),
			type,
			direction,
			status: faker.helpers.arrayElement(transactionStatusEnum.enumValues),
			grossAmount,
			fee,
			netAmount,
			currency: faker.finance.currencyCode(),
			description: faker.lorem.sentence(),
			createdAt: faker.date.past()
		};
	};

	const transactions = faker.helpers.multiple(createRandomTransaction, {
		count: 20
	});

	return {
		transactions
	};
}
