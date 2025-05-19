import { useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  deleteProduct,
  getProduct,
  getProductCategories,
  getProductImages,
  getProductVariants,
  getProductNutritionFacts,
} from "~/action/product";
import { getBrands } from "~/action/brand";
import { getCategories } from "~/action/category";
import { ProductForm } from "~/components/products/product-form";
import MainLayout from "~/layouts/MainLayout";
import { HTTP_STATUS } from "~/config/http";

export const meta: MetaFunction = () => {
  return [
    { title: "Product Edit - SERVEMED" },
  ];
};

export default function EditProductPage({ params }: { params: { id: string } }) {

  const {
    product,
    selectedCategoryIds,
    brandsData,
    categoriesData,
    nutritionFacts,
    productImages,
    productVariants,
  } = useLoaderData<typeof loader>()

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">Update product information</p>
        </div>

        <ProductForm
          product={product}
          brands={brandsData}
          categories={categoriesData}
          selectedCategoryIds={selectedCategoryIds}
          nutritionFacts={nutritionFacts}
          productImages={productImages}
          productVariants={productVariants}

        />
      </div>
    </MainLayout>
  )
}

export async function loader({ params }: { params: { id: string } }) {
  const productId = Number.parseInt(params.id)

  if (Number.isNaN(productId)) {
    throw new Response("Product not found", { status: 404 })
  }

  const [product, productCategoriesData, images, variants, nutritionFactsData, brandsData, categoriesData] = await Promise.all([
    getProduct(productId),
    getProductCategories(productId),
    getProductImages(productId),
    getProductVariants(productId),
    getProductNutritionFacts(productId),
    getBrands(),
    getCategories(),
  ])

  if (!product) {
    throw new Response("Product not found", { status: 404 })
  }

  const selectedCategoryIds = productCategoriesData.map((pc) => pc.categoryId)

  return {
    product,
    selectedCategoryIds,
    brandsData,
    categoriesData,
    nutritionFacts: nutritionFactsData,
    productImages: images,
    productVariants: variants,
  }

}

export async function action({ request, params }: ActionFunctionArgs) {
  const productId = Number.parseInt(params.id || "");

  if (Number.isNaN(productId)) {
    throw new Response("Invalid product ID", { status: 400 });
  }

  if (request.method === "DELETE") {
    await deleteProduct(productId);
    return new Response(null, { status: HTTP_STATUS.OK });
  }

  return new Response("Method Not Allowed", { status: 405 });
}
