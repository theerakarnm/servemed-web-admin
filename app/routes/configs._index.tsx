import { type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, useSubmit } from "@remix-run/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import MainLayout from "~/layouts/MainLayout";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/components/ui/form";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { getConfig, upsertConfig } from "~/action/config";
import { HTTP_STATUS } from "~/config/http";

const formSchema = z.object({
  heroBrandImage: z.string().url("Must be a valid URL"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ConfigPage() {
  const { heroBrandImage } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ status: number }>();
  const submit = useSubmit();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heroBrandImage: heroBrandImage || "",
    },
  });

  useEffect(() => {
    if (!actionData) return;
    if ([HTTP_STATUS.OK, HTTP_STATUS.CREATED].includes(actionData.status)) {
      toast("Configuration saved.");
    }
  }, [actionData]);

  function onSubmit(data: FormValues) {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    submit(formData, { method: "POST" });
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CMS Configuration</h1>
          <p className="text-muted-foreground">Update landing page assets</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="heroBrandImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hero Brand Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Save</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export async function loader({}: LoaderFunctionArgs) {
  const config = await getConfig("heroBrandImage");
  return {
    heroBrandImage: (config?.value as string) || "",
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = formData.get("data");
  if (!data) {
    throw new Response("Invalid data", { status: HTTP_STATUS.BAD_REQUEST });
  }
  try {
    const parsed = JSON.parse(data.toString()) as FormValues;
    await upsertConfig("heroBrandImage", parsed.heroBrandImage, "admin");
    return { status: HTTP_STATUS.OK };
  } catch (error) {
    throw new Response("Invalid JSON", { status: HTTP_STATUS.BAD_REQUEST });
  }
}
