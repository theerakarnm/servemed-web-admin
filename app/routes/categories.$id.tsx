import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { CategoryForm } from "~/components/categories/category-form";
import MainLayout from "~/layouts/MainLayout";
import { deleteCategory, getCategories, getCategory } from "~/action/category";
import { HTTP_STATUS } from "~/config/http";

export const meta: MetaFunction = () => {
  return [
    { title: "Category Edit - SERVEMED" },
  ];
};

export default function EditCategoryPage() {
  const { category, categories } = useLoaderData<typeof loader>();

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
          <p className="text-muted-foreground">Update category information</p>
        </div>

        <CategoryForm category={category} categories={categories} />
      </div>
    </MainLayout>
  );
}

export async function loader({ params }: { params: { id: string } }) {
  const categoryId = Number.parseInt(params.id);

  if (Number.isNaN(categoryId)) {
    throw new Response("Invalid category ID", { status: 400 });
  }

  const [category, categories] = await Promise.all([
    getCategory(categoryId),
    getCategories(),
  ]);

  if (!category) {
    throw new Response("Category not found", { status: 404 });
  }

  return { category, categories };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const categoryId = Number.parseInt(params.id || "");

  if (Number.isNaN(categoryId)) {
    throw new Response("Invalid category ID", { status: 400 });
  }

  if (request.method === "DELETE") {
    await deleteCategory(categoryId);
    return new Response(null, { status: HTTP_STATUS.OK });
  }

  return new Response("Method Not Allowed", { status: 405 });
}
