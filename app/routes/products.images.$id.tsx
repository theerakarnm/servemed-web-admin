import { eq } from "drizzle-orm"
import { Button } from "~/components/ui/button"
import { PlusCircle } from "lucide-react"
import { Link, useLoaderData } from "@remix-run/react"
import { db } from "../db/db.server"
import { productImages } from "../db/schema"
import { ProductImagesGrid } from "~/components/products/product-images-grid"
import MainLayout from "~/layouts/MainLayout"

export default function ProductImagesPage({ params }: { params: { id: string } }) {

  const {
    images,
    product
  } = useLoaderData<typeof loader>();

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Product Images</h1>
            <p className="text-muted-foreground">
              Manage images for <span className="font-medium">{product.name}</span>
            </p>
          </div>
          <div className="flex gap-4">
            <Link to={`/products/${product.productId}`}>
              <Button variant="outline">Back to Product</Button>
            </Link>
            <Link to={`/products/images/new/${product.productId}`}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Image
              </Button>
            </Link>
          </div>
        </div>

        <ProductImagesGrid images={images} productId={product.productId} />
      </div>
    </MainLayout>
  )
}

export async function loader({ params }: { params: { id: string } }) {
  const productId = Number.parseInt(params.id)

  if (Number.isNaN(productId)) {
    throw new Response("Product not found", { status: 404 })

  }

  // const product = await db.query.products.findFirst({
  //   where: eq(products.productId, productId),
  // })

  const product = {
    productId: 1,
    brandId: 101,
    name: "Organic Vitamin C Supplement",
    baseDescription: "A high-quality organic vitamin C supplement.",
    overallRating: 4.75,
    totalReviews: 120,
    totalQuestions: 15,
    dateFirstAvailable: new Date(),
    manufacturerWebsiteUrl: "https://example.com/vitamin-c",
    isuraVerified: true,
    nonGmoDocumentation: true,
    massSpecLabTested: true,
    detailedDescription:
      "This organic vitamin C supplement is derived from natural sources and is designed to support immune health and overall wellness.",
    suggestedUse: "Take one capsule daily with a meal or as directed by your healthcare provider.",
    otherIngredients: "Vegetable cellulose (capsule), organic rice flour.",
    warnings: "Keep out of reach of children. Consult your healthcare provider before use.",
    disclaimer: "These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.",
  }

  if (!product) {
    throw new Response("Product not found", { status: 404 })
  }

  // const images = await db
  //   .select()
  //   .from(productImages)
  //   .where(eq(productImages.productId, productId))
  //   .orderBy(productImages.displayOrder)


  return {
    images: [],
    product
  }
}
