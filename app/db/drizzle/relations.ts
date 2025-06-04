import { relations } from "drizzle-orm/relations";
import { products, productImages, productRankings, categories, productReviewHighlights, reviewHighlights, reviews, user, reviewImages, session, productVariants, supplementFacts, account, questions, answers, customersAlsoViewed, frequentlyBoughtTogetherGroups, frequentlyBoughtTogetherItems, productCategories, brands, checkouts, userProductInteractions, addresses, orders, orderItems, payments, shipments } from "./schema";

export const productImagesRelations = relations(productImages, ({one}) => ({
	product: one(products, {
		fields: [productImages.productId],
		references: [products.productId]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	productImages: many(productImages),
	productRankings: many(productRankings),
	productReviewHighlights: many(productReviewHighlights),
	reviews: many(reviews),
	questions: many(questions),
	productVariants: many(productVariants),
	productCategories: many(productCategories),
	brand: one(brands, {
		fields: [products.brandId],
		references: [brands.brandId]
	}),
	userProductInteractions: many(userProductInteractions),
	orderItems: many(orderItems),
}));

export const productRankingsRelations = relations(productRankings, ({one}) => ({
	product: one(products, {
		fields: [productRankings.productId],
		references: [products.productId]
	}),
	category: one(categories, {
		fields: [productRankings.categoryId],
		references: [categories.categoryId]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	productRankings: many(productRankings),
	productCategories: many(productCategories),
}));

export const productReviewHighlightsRelations = relations(productReviewHighlights, ({one}) => ({
	product: one(products, {
		fields: [productReviewHighlights.productId],
		references: [products.productId]
	}),
	reviewHighlight: one(reviewHighlights, {
		fields: [productReviewHighlights.highlightId],
		references: [reviewHighlights.highlightId]
	}),
}));

export const reviewHighlightsRelations = relations(reviewHighlights, ({many}) => ({
	productReviewHighlights: many(productReviewHighlights),
}));

export const reviewsRelations = relations(reviews, ({one, many}) => ({
	product: one(products, {
		fields: [reviews.productId],
		references: [products.productId]
	}),
	user: one(user, {
		fields: [reviews.userId],
		references: [user.id]
	}),
	reviewImages: many(reviewImages),
}));

export const userRelations = relations(user, ({many}) => ({
	reviews: many(reviews),
	sessions: many(session),
	accounts: many(account),
	questions: many(questions),
	answers: many(answers),
	checkouts: many(checkouts),
	userProductInteractions: many(userProductInteractions),
	addresses: many(addresses),
	orders: many(orders),
}));

export const reviewImagesRelations = relations(reviewImages, ({one}) => ({
	review: one(reviews, {
		fields: [reviewImages.reviewId],
		references: [reviews.reviewId]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const supplementFactsRelations = relations(supplementFacts, ({one}) => ({
	productVariant: one(productVariants, {
		fields: [supplementFacts.variantId],
		references: [productVariants.variantId]
	}),
}));

export const productVariantsRelations = relations(productVariants, ({one, many}) => ({
	supplementFacts: many(supplementFacts),
	product: one(products, {
		fields: [productVariants.productId],
		references: [products.productId]
	}),
	customersAlsoVieweds_sourceVariantId: many(customersAlsoViewed, {
		relationName: "customersAlsoViewed_sourceVariantId_productVariants_variantId"
	}),
	customersAlsoVieweds_viewedVariantId: many(customersAlsoViewed, {
		relationName: "customersAlsoViewed_viewedVariantId_productVariants_variantId"
	}),
	frequentlyBoughtTogetherItems: many(frequentlyBoughtTogetherItems),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const questionsRelations = relations(questions, ({one, many}) => ({
	product: one(products, {
		fields: [questions.productId],
		references: [products.productId]
	}),
	user: one(user, {
		fields: [questions.userId],
		references: [user.id]
	}),
	answers: many(answers),
}));

export const answersRelations = relations(answers, ({one}) => ({
	question: one(questions, {
		fields: [answers.questionId],
		references: [questions.questionId]
	}),
	user: one(user, {
		fields: [answers.userId],
		references: [user.id]
	}),
}));

export const customersAlsoViewedRelations = relations(customersAlsoViewed, ({one}) => ({
	productVariant_sourceVariantId: one(productVariants, {
		fields: [customersAlsoViewed.sourceVariantId],
		references: [productVariants.variantId],
		relationName: "customersAlsoViewed_sourceVariantId_productVariants_variantId"
	}),
	productVariant_viewedVariantId: one(productVariants, {
		fields: [customersAlsoViewed.viewedVariantId],
		references: [productVariants.variantId],
		relationName: "customersAlsoViewed_viewedVariantId_productVariants_variantId"
	}),
}));

export const frequentlyBoughtTogetherItemsRelations = relations(frequentlyBoughtTogetherItems, ({one}) => ({
	frequentlyBoughtTogetherGroup: one(frequentlyBoughtTogetherGroups, {
		fields: [frequentlyBoughtTogetherItems.groupId],
		references: [frequentlyBoughtTogetherGroups.groupId]
	}),
	productVariant: one(productVariants, {
		fields: [frequentlyBoughtTogetherItems.variantId],
		references: [productVariants.variantId]
	}),
}));

export const frequentlyBoughtTogetherGroupsRelations = relations(frequentlyBoughtTogetherGroups, ({many}) => ({
	frequentlyBoughtTogetherItems: many(frequentlyBoughtTogetherItems),
}));

export const productCategoriesRelations = relations(productCategories, ({one}) => ({
	product: one(products, {
		fields: [productCategories.productId],
		references: [products.productId]
	}),
	category: one(categories, {
		fields: [productCategories.categoryId],
		references: [categories.categoryId]
	}),
}));

export const brandsRelations = relations(brands, ({many}) => ({
	products: many(products),
}));

export const checkoutsRelations = relations(checkouts, ({one}) => ({
	user: one(user, {
		fields: [checkouts.userId],
		references: [user.id]
	}),
}));

export const userProductInteractionsRelations = relations(userProductInteractions, ({one}) => ({
	user: one(user, {
		fields: [userProductInteractions.userId],
		references: [user.id]
	}),
	product: one(products, {
		fields: [userProductInteractions.productId],
		references: [products.productId]
	}),
}));

export const addressesRelations = relations(addresses, ({one, many}) => ({
	user: one(user, {
		fields: [addresses.userId],
		references: [user.id]
	}),
	orders_shippingAddressId: many(orders, {
		relationName: "orders_shippingAddressId_addresses_id"
	}),
	orders_billingAddressId: many(orders, {
		relationName: "orders_billingAddressId_addresses_id"
	}),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.productId]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	orderItems: many(orderItems),
	user: one(user, {
		fields: [orders.userId],
		references: [user.id]
	}),
	address_shippingAddressId: one(addresses, {
		fields: [orders.shippingAddressId],
		references: [addresses.id],
		relationName: "orders_shippingAddressId_addresses_id"
	}),
	address_billingAddressId: one(addresses, {
		fields: [orders.billingAddressId],
		references: [addresses.id],
		relationName: "orders_billingAddressId_addresses_id"
	}),
	payments: many(payments),
	shipments: many(shipments),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	order: one(orders, {
		fields: [payments.orderId],
		references: [orders.id]
	}),
}));

export const shipmentsRelations = relations(shipments, ({one}) => ({
	order: one(orders, {
		fields: [shipments.orderId],
		references: [orders.id]
	}),
}));