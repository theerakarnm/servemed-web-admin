"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronsUpDown, PlusCircle, Trash2, X } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Checkbox } from "~/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Calendar } from "~/components/ui/calendar"
import { cn, jnavigate } from "~/libs/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { toast } from 'sonner'

const nutritionFactSchema = z.object({
  ingredient: z.string().min(1, "Ingredient name is required"),
  amountPerServing: z.string().min(1, "Amount is required"),
  percentDailyValue: z.string().optional(),
})

const productImageSchema = z.object({
  imageId: z.number().optional(),
  imageUrl: z.string().url("Must be a valid URL"),
  altText: z.string().optional(),
  displayOrder: z.number().int().min(0).default(0),
  isThumbnail: z.boolean().default(false),
  isNew: z.boolean().default(true),
  isDeleted: z.boolean().default(false),
})

const productVariantSchema = z.object({
  variantId: z.number().optional(),
  packageDescription: z.string().min(1, "Package description is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  isInStock: z.boolean().default(true),
  isNew: z.boolean().default(true),
  isDeleted: z.boolean().default(false),
})

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  brandId: z.number({
    required_error: "Please select a brand",
  }),
  baseDescription: z.string().optional(),
  detailedDescription: z.string().optional(),
  suggestedUse: z.string().optional(),
  otherIngredients: z.string().optional(),
  warnings: z.string().optional(),
  disclaimer: z.string().optional(),
  manufacturerWebsiteUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  dateFirstAvailable: z.date().optional(),
  isuraVerified: z.boolean().default(false),
  nonGmoDocumentation: z.boolean().default(false),
  massSpecLabTested: z.boolean().default(false),
  categoryIds: z.array(z.number()).min(1, "At least one category is required"),
  nutritionFacts: z.array(nutritionFactSchema).optional(),
  allergenInformation: z.string().optional(),
  images: z.array(productImageSchema).optional(),
  variants: z.array(productVariantSchema).optional(),
})

export type ProductFormValues = z.infer<typeof productSchema>

interface Product {
  productId: number
  brandId: number
  name: string
  baseDescription: string | null
  detailedDescription: string | null
  suggestedUse: string | null
  otherIngredients: string | null
  warnings: string | null
  disclaimer: string | null
  manufacturerWebsiteUrl: string | null
  dateFirstAvailable: Date | null
  isuraVerified: boolean
  nonGmoDocumentation: boolean
  massSpecLabTested: boolean
  overallRating: number | null
  totalReviews: number
  totalQuestions: number
  allergenInformation: string | null
}

interface Brand {
  brandId: number
  name: string
}

interface Category {
  categoryId: number
  name: string
  parentCategoryId: number | null
  description: string | null
}

interface NutritionFact {
  factId?: number
  ingredient: string
  amountPerServing: string
  percentDailyValue: string | null
}

interface ProductImage {
  imageId: number
  productId: number
  imageUrl: string
  altText: string | null
  displayOrder: number
  isThumbnail: boolean
}

interface ProductVariant {
  variantId: number
  productId: number
  packageDescription: string
  iHerbStockNumber: string | null
  upc: string | null
  price: number
  currency: string
  listPrice: number | null
  servingSize: string | null
  servingsPerContainer: number | null
  bestByDate: Date | null
  isInStock: boolean
  shippingWeightKg: number | null
  dimensionsCm: string | null
}

interface ProductFormProps {
  product?: Product
  brands: Brand[]
  categories: Category[]
  selectedCategoryIds?: number[]
  nutritionFacts?: NutritionFact[]
  productImages?: ProductImage[]
  productVariants?: ProductVariant[]
}

export function ProductForm({
  product,
  brands,
  categories,
  selectedCategoryIds = [],
  nutritionFacts = [],
  productImages = [],
  productVariants = [],
}: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      brandId: product?.brandId || undefined,
      baseDescription: product?.baseDescription || "",
      detailedDescription: product?.detailedDescription || "",
      suggestedUse: product?.suggestedUse || "",
      otherIngredients: product?.otherIngredients || "",
      warnings: product?.warnings || "",
      disclaimer: product?.disclaimer || "",
      manufacturerWebsiteUrl: product?.manufacturerWebsiteUrl || "",
      dateFirstAvailable: product?.dateFirstAvailable || undefined,
      isuraVerified: product?.isuraVerified || false,
      nonGmoDocumentation: product?.nonGmoDocumentation || false,
      massSpecLabTested: product?.massSpecLabTested || false,
      categoryIds: selectedCategoryIds || [],
      nutritionFacts:
        nutritionFacts.map((fact) => ({
          ingredient: fact.ingredient,
          amountPerServing: fact.amountPerServing,
          percentDailyValue: fact.percentDailyValue || "",
        })) || [],
      allergenInformation: product?.allergenInformation || "",
      images:
        productImages.map((image) => ({
          imageId: image.imageId,
          imageUrl: image.imageUrl,
          altText: image.altText || "",
          displayOrder: image.displayOrder,
          isThumbnail: image.isThumbnail,
          isNew: false,
          isDeleted: false,
        })) || [],
      variants:
        productVariants.map((variant) => ({
          variantId: variant.variantId,
          packageDescription: variant.packageDescription,
          price: variant.price,
          currency: variant.currency,
          isInStock: variant.isInStock,
          isNew: false,
          isDeleted: false,
        })) || [],
    },
  })

  // Set up field arrays for nutrition facts, images, and variants
  const {
    fields: nutritionFactsFields,
    append: appendNutritionFact,
    remove: removeNutritionFact,
  } = useFieldArray({
    control: form.control,
    name: "nutritionFacts",
  })

  const {
    fields: imagesFields,
    append: appendImage,
    remove: removeImage,
    update: updateImage,
  } = useFieldArray({
    control: form.control,
    name: "images",
  })

  const {
    fields: variantsFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  })

  // Ensure at least one image is marked as thumbnail
  useEffect(() => {
    const images = form.getValues("images") || []
    const hasActiveThumbnail = images.some((img) => img.isThumbnail && !img.isDeleted)

    if (images.length > 0 && !hasActiveThumbnail) {
      // Find the first non-deleted image and make it a thumbnail
      const firstActiveImageIndex = images.findIndex((img) => !img.isDeleted)
      if (firstActiveImageIndex >= 0) {
        const updatedImage = { ...images[firstActiveImageIndex], isThumbnail: true }
        updateImage(firstActiveImageIndex, updatedImage)
      }
    }
  }, [form.getValues("images")])

  async function onSubmit(data: ProductFormValues) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/products", {
        method: product ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          productId: product?.productId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save product")
      }

      toast(product
        ? "Your product has been updated successfully."
        : "Your product has been created successfully.",)

      jnavigate({
        path: "/products",
      })
    } catch (error) {
      toast("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle thumbnail selection
  const handleThumbnailChange = (index: number, checked: boolean) => {
    if (checked) {
      // Uncheck all other thumbnails
      const images = form.getValues("images") || []
      images.forEach((_, i) => {
        if (i !== index) {
          form.setValue(`images.${i}.isThumbnail`, false)
        }
      })
    }
    form.setValue(`images.${index}.isThumbnail`, checked)
  }

  // Mark an image as deleted (will be removed on save)
  const markImageDeleted = (index: number) => {
    const currentImage = form.getValues(`images.${index}`)
    updateImage(index, { ...currentImage, isDeleted: true })

    // If this was a thumbnail, select a new one
    if (currentImage.isThumbnail) {
      const images = form.getValues("images")
      const nextActiveIndex = images?.findIndex((img, i) => i !== index && !img.isDeleted)
      if (!nextActiveIndex) return
      if (nextActiveIndex >= 0) {
        handleThumbnailChange(nextActiveIndex, true)
      }
    }
  }

  // Mark a variant as deleted (will be removed on save)
  const markVariantDeleted = (index: number) => {
    const currentVariant = form.getValues(`variants.${index}`)
    form.setValue(`variants.${index}.isDeleted`, true)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="variants">Variants</TabsTrigger>
                <TabsTrigger value="certifications">Certifications</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormDescription>
                        The name of the product as it will appear throughout the system.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Brand</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                            >
                              {field.value
                                ? brands.find((brand) => brand.brandId === field.value)?.name
                                : "Select brand"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search brand..." />
                            <CommandList>
                              <CommandEmpty>No brand found.</CommandEmpty>
                              <CommandGroup>
                                {brands.map((brand) => (
                                  <CommandItem
                                    value={brand.name}
                                    key={brand.brandId}
                                    onSelect={() => {
                                      form.setValue("brandId", brand.brandId)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        brand.brandId === field.value ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                    {brand.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>The brand that manufactures this product.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="baseDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter a short description"
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>A brief description of the product.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="manufacturerWebsiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturer Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>URL to the manufacturer's website.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateFirstAvailable"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date First Available</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>The date when the product first became available.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="details" className="space-y-6 pt-4">
                <FormField
                  control={form.control}
                  name="detailedDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter detailed product description"
                          className="min-h-[150px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>A comprehensive description of the product.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="suggestedUse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suggested Use</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter suggested use instructions"
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>Instructions on how to use the product.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="otherIngredients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Ingredients</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter other ingredients"
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        List of additional ingredients not included in supplement facts.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warnings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warnings</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter warnings"
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>Important warnings about the product.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="disclaimer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disclaimer</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter disclaimer"
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>Legal disclaimer for the product.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="categories" className="space-y-6 pt-4">
                <FormField
                  control={form.control}
                  name="categoryIds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Categories</FormLabel>
                        <FormDescription>Select the categories this product belongs to.</FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {categories.map((category) => (
                          <FormField
                            key={category.categoryId}
                            control={form.control}
                            name="categoryIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={category.categoryId}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(category.categoryId)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, category.categoryId])
                                          : field.onChange(
                                            field.value?.filter((value) => value !== category.categoryId),
                                          )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{category.name}</FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="ingredients" className="space-y-6 pt-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Nutrition Facts</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendNutritionFact({ ingredient: "", amountPerServing: "", percentDailyValue: "" })
                      }
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Ingredient
                    </Button>
                  </div>

                  {nutritionFactsFields.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ingredient</TableHead>
                            <TableHead>Amount Per Serving</TableHead>
                            <TableHead>% Daily Value</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {nutritionFactsFields.map((field, index) => (
                            <TableRow key={field.id}>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`nutritionFacts.${index}.ingredient`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input placeholder="Vitamin C" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`nutritionFacts.${index}.amountPerServing`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input placeholder="500 mg" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`nutritionFacts.${index}.percentDailyValue`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input placeholder="50%" {...field} value={field.value || ""} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeNutritionFact(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-md border border-dashed p-8">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">No nutrition facts added yet.</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() =>
                            appendNutritionFact({ ingredient: "", amountPerServing: "", percentDailyValue: "" })
                          }
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Ingredient
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="allergenInformation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergen Information</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter allergen information (e.g., Contains: milk, soy, tree nuts)"
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        List any allergens present in the product or potential cross-contamination risks.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="images" className="space-y-6 pt-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Product Images</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendImage({
                          imageUrl: "",
                          altText: "",
                          displayOrder: imagesFields.length,
                          isThumbnail: imagesFields.length === 0,
                          isNew: true,
                          isDeleted: false,
                        })
                      }
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Image
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {imagesFields.map((field, index) => {
                      // Skip rendering deleted images
                      if (form.getValues(`images.${index}.isDeleted`)) {
                        return null
                      }

                      return (
                        <Card
                          key={field.id}
                          className={form.getValues(`images.${index}.isThumbnail`) ? "border-primary" : ""}
                        >
                          <CardContent className="p-4 space-y-4">
                            <div className="relative">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-0 right-0 z-10 rounded-full bg-background/80 p-1"
                                onClick={() => markImageDeleted(index)}
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </Button>

                              <div className="aspect-square relative mb-2 rounded-md overflow-hidden border">
                                {form.getValues(`images.${index}.imageUrl`) ? (
                                  <img
                                    src={form.getValues(`images.${index}.imageUrl`) as string}
                                    alt={form.getValues(`images.${index}.altText`) || "Product image"}
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-muted">
                                    <span className="text-muted-foreground">No image</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <FormField
                              control={form.control}
                              name={`images.${index}.imageUrl`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Image URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://example.com/image.jpg" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`images.${index}.altText`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Alt Text</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Product image description"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`images.${index}.displayOrder`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Display Order</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                      value={field.value}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`images.${index}.isThumbnail`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={(checked) => handleThumbnailChange(index, checked as boolean)}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Use as Thumbnail</FormLabel>
                                    <FormDescription>
                                      This image will be used as the main product thumbnail.
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      )
                    })}

                    {imagesFields.filter((field) => !form.getValues(`images.${imagesFields.indexOf(field)}.isDeleted`))
                      .length === 0 && (
                        <div className="col-span-full flex items-center justify-center rounded-md border border-dashed p-8">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">No images added yet.</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() =>
                                appendImage({
                                  imageUrl: "",
                                  altText: "",
                                  displayOrder: 0,
                                  isThumbnail: true,
                                  isNew: true,
                                  isDeleted: false,
                                })
                              }
                            >
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Add Image
                            </Button>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="variants" className="space-y-6 pt-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Product Variants</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendVariant({
                          packageDescription: "",
                          price: 0,
                          currency: "USD",
                          isInStock: true,
                          isNew: true,
                          isDeleted: false,
                        })
                      }
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Variant
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {variantsFields.map((field, index) => {
                      // Skip rendering deleted variants
                      if (form.getValues(`variants.${index}.isDeleted`)) {
                        return null
                      }

                      return (
                        <Card key={field.id}>
                          <CardContent className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-base font-medium">Variant {index + 1}</h4>
                              <Button type="button" variant="ghost" size="sm" onClick={() => markVariantDeleted(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>

                            <FormField
                              control={form.control}
                              name={`variants.${index}.packageDescription`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Package Description</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., 60 Capsules, 120 Tablets, 16 oz" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`variants.${index}.price`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        value={field.value}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`variants.${index}.currency`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Currency</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="GBP">GBP (£)</SelectItem>
                                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name={`variants.${index}.isInStock`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>In Stock</FormLabel>
                                    <FormDescription>Is this variant currently in stock?</FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      )
                    })}

                    {variantsFields.filter(
                      (field) => !form.getValues(`variants.${variantsFields.indexOf(field)}.isDeleted`),
                    ).length === 0 && (
                        <div className="flex items-center justify-center rounded-md border border-dashed p-8">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">No variants added yet.</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() =>
                                appendVariant({
                                  packageDescription: "",
                                  price: 0,
                                  currency: "USD",
                                  isInStock: true,
                                  isNew: true,
                                  isDeleted: false,
                                })
                              }
                            >
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Add Variant
                            </Button>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="certifications" className="space-y-6 pt-4">
                <FormField
                  control={form.control}
                  name="isuraVerified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>ISURA Verified</FormLabel>
                        <FormDescription>Product has been verified by ISURA.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nonGmoDocumentation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Non-GMO Documentation</FormLabel>
                        <FormDescription>Product has non-GMO documentation.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="massSpecLabTested"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Mass Spec Lab Tested</FormLabel>
                        <FormDescription>Product has been tested in a mass spectrometry lab.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : product ? "Update Product" : "Create Product"}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                jnavigate({
                  path: '/products'
                })
              }}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
