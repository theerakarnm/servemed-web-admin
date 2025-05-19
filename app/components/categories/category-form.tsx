import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { Check, ChevronsUpDown, PlusCircle, Trash2 } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Separator } from "~/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command"
import { cn, jnavigate } from "~/libs/utils"
import { toast } from "sonner"
import { useActionData, useSubmit } from "@remix-run/react"
import { HTTP_STATUS } from "~/config/http"

const categoryItemSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  parentCategoryId: z.number().optional().nullable(),
  description: z.string().optional(),
})

const categorySchema = z.object({
  categories: z.array(categoryItemSchema).min(1, "At least one category is required"),
})

type CategoryFormValues = z.infer<typeof categorySchema>

export interface Category {
  categoryId: number
  name: string
  parentCategoryId: number | null
  description: string | null
}

interface CategoryFormProps {
  category?: Category
  categories: Category[]
}

export function CategoryForm({ category, categories }: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const submit = useSubmit()
  const actionData = useActionData<{
    status: number
  }>()

  // Filter out the current category from parent options to prevent circular references
  const parentOptions = category ? categories.filter((cat) => cat.categoryId !== category.categoryId) : categories

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categories: category
        ? [
          {
            name: category.name,
            parentCategoryId: category.parentCategoryId,
            description: category.description || "",
          },
        ]
        : [
          {
            name: "",
            parentCategoryId: null,
            description: "",
          },
        ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "categories",
  })

  useEffect(() => {
    if (!actionData) return
    if ([
      HTTP_STATUS.OK.toString(),
      HTTP_STATUS.CREATED.toString(),
    ].includes(actionData.status.toString())) {
      toast("Category saved successfully.")
      jnavigate({ path: "/categories" })
    }
    setIsLoading(false)
  }, [actionData])

  async function onSubmit(data: CategoryFormValues) {
    setIsLoading(true)

    try {

      const formData = new FormData()
      formData.append('data', JSON.stringify({
        categories: data.categories,
        categoryId: category?.categoryId,
      }))

      submit(formData, {
        action: '/categories/new',
        method: category?.categoryId ? "PUT" : "POST",
      })

      // if (category) {
      //   // If editing a single category
      //   const response = await fetch("/api/categories", {
      //     method: "PUT",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       ...data.categories[0],
      //       categoryId: ,
      //     }),
      //   })

      //   if (!response.ok) {
      //     throw new Error("Failed to update category")
      //   }

      //   toast('Your category has been updated successfully.')
      // } else {
      //   // If creating multiple categories
      //   const response = await fetch("/api/categories/bulk", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(data.categories),
      //   })

      //   if (!response.ok) {
      //     throw new Error("Failed to create categories")
      //   }

      //   toast(`${data.categories.length} categories have been created successfully.`)
      // }

    } catch (error) {
      toast("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4">
                {index > 0 && (
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Category {index + 1}</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name={`categories.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter category name" {...field} />
                      </FormControl>
                      <FormDescription>
                        The name of the category as it will appear throughout the system.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`categories.${index}.parentCategoryId`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Parent Category (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                            >
                              {field.value
                                ? parentOptions.find((cat) => cat.categoryId === field.value)?.name
                                : "Select parent category"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search categories..." />
                            <CommandList>
                              <CommandEmpty>No category found.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value="none"
                                  onSelect={() => {
                                    form.setValue(`categories.${index}.parentCategoryId`, null)
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", !field.value ? "opacity-100" : "opacity-0")} />
                                  None (Top Level)
                                </CommandItem>
                                {parentOptions.map((cat) => (
                                  <CommandItem
                                    value={cat.name}
                                    key={cat.categoryId}
                                    onSelect={() => {
                                      form.setValue(`categories.${index}.parentCategoryId`, cat.categoryId)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        cat.categoryId === field.value ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                    {cat.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Select a parent category if this is a subcategory. Leave empty for top-level categories.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`categories.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter category description" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>A brief description of the category.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {index < fields.length - 1 && <Separator className="my-6" />}
              </div>
            ))}

            {!category && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    name: "",
                    parentCategoryId: null,
                    description: "",
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Another Category
              </Button>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : category ? "Update Category" : "Create Categories"}
              </Button>
              <Button type="button" variant="outline" onClick={() => jnavigate({ path: "/categories" })}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
