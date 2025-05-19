import { db } from "../db/db.server"
import { useLoaderData } from "@remix-run/react"
import { ProductForm, type ProductFormValues } from "~/components/products/product-form"
import MainLayout from "~/layouts/MainLayout"
import { createBrand, getBrands } from "~/action/brand"
import { getCategories } from "~/action/category"
import type { ActionFunctionArgs } from "@remix-run/node"
import { HTTP_STATUS } from "~/config/http"
import { createProduct, createProductCategory, createProductImage, createProductImages, createProductNutritionFacts, createProductVariants } from "~/action/product"
import { text } from "drizzle-orm/gel-core"
import dayjs from "dayjs"

export default function NewProductPage() {
  const { brandsData, categoriesData } = useLoaderData<typeof loader>()

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Product</h1>
          <p className="text-muted-foreground">Create a new product in the system</p>
        </div>

        <ProductForm brands={brandsData} categories={categoriesData} nutritionFacts={[]}
          productImages={[]}
          productVariants={[]} />
      </div>
    </MainLayout>
  )
}


export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const data = formData.get("data")

  if (!data) {
    throw new Response("Invalid data", { status: HTTP_STATUS.BAD_REQUEST })
  }

  try {
    const parsedData = JSON.parse(data.toString()) as ProductFormValues

    db.transaction(async (tx) => {
      try {
        const [returnData] = await createProduct({
          brandId: parsedData.brandId,
          name: parsedData.name,
          baseDescription: parsedData.baseDescription,
          dateFirstAvailable: dayjs(parsedData.dateFirstAvailable).toISOString(),
          manufacturerWebsiteUrl: parsedData.manufacturerWebsiteUrl,
          isuraVerified: parsedData.isuraVerified,
          nonGmoDocumentation: parsedData.nonGmoDocumentation,
          massSpecLabTested: parsedData.massSpecLabTested,
          detailedDescription: parsedData.detailedDescription,
          suggestedUse: parsedData.suggestedUse,
          otherIngredients: parsedData.otherIngredients,
          warnings: parsedData.warnings,
          disclaimer: parsedData.disclaimer,
          allergenInformation: parsedData.allergenInformation,
        }, tx)

        const services: Promise<any>[] = []

        services.push(createProductCategory(parsedData.categoryIds.map(categoryId => ({
          categoryId: categoryId,
          productId: returnData.productId
        })), tx))

        if (parsedData.nutritionFacts && parsedData.nutritionFacts.length > 0) {
          services.push(
            createProductNutritionFacts(parsedData.nutritionFacts?.map(nf => ({
              productId: returnData.productId,
              ingredient: nf.ingredient,
              amountPerServing: nf.amountPerServing,
              percentDailyValue: nf.percentDailyValue,
              displayOrder: nf.displayOrder,
            })), tx)
          )
        }

        if (parsedData.images && parsedData.images.length > 0) {
          services.push(
            createProductImages(parsedData.images.map(img => ({
              productId: returnData.productId,
              imageUrl: img.imageUrl,
              altText: img.altText,
              displayOrder: img.displayOrder,
              isThumbnail: img.isThumbnail,
            })), tx)
          )
        }

        if (parsedData.variants && parsedData.variants.length > 0) {
          services.push(
            createProductVariants(parsedData.variants.map(v => ({
              productId: returnData.productId,
              packageDescription: v.packageDescription,
              stockNumber: `${dayjs().format("YYYYMMDD")}-${Math.floor(Math.random() * 999999)}`,
              price: v.price.toString(),
              isInStock: v.isInStock,
              currency: v.currency,
            })), tx)
          )
        }

        await Promise.all(services)
      } catch (error) {
        console.error("Error creating product:", error)
        throw new Response("Error creating product", { status: HTTP_STATUS.INTERNAL_SERVER_ERROR })
      }
    })

    return {
      status: HTTP_STATUS.CREATED
    }
  } catch (error) {
    return {
      status: HTTP_STATUS.BAD_REQUEST,
      message: "Invalid data"
    }
  }
}


export async function loader() {
  const [brands, categories] = await Promise.all([
    getBrands(),
    getCategories()
  ])

  return {
    brandsData: brands,
    categoriesData: categories,
  }
}
