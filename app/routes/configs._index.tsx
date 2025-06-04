import { type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, useSubmit } from "@remix-run/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import MainLayout from "~/layouts/MainLayout";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/components/ui/form";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { toast } from "sonner";
import { getConfig, upsertConfig } from "~/action/config";
import { HTTP_STATUS } from "~/config/http";
import { fileUpload } from "~/libs/file-upload";

const formSchema = z.object({
  image: z.string().url("Must be a valid URL"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ConfigPage() {
  const { banner } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ status: number }>();
  const submit = useSubmit();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: banner.image || "",
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

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    const result = await fileUpload(file);
    form.setValue("image", result.file.url);
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
            <Tabs defaultValue="banner" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="banner">Hero Brand Image</TabsTrigger>
              </TabsList>
              <TabsContent value="banner" className="space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hero Brand Image</FormLabel>
                          {field.value && (
                            <img src={field.value} alt="Hero" className="h-32 mb-2 rounded" />
                          )}
                          <FormControl>
                            <Input type="hidden" {...field} />
                          </FormControl>
                          <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                          <Button type="button" onClick={() => fileInputRef.current?.click()}>Upload Image</Button>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Save</Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export async function loader({}: LoaderFunctionArgs) {
  const config = await getConfig("banner");
  const banner = (config?.value as { image: string } | undefined) || { image: "" };
  return { banner };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = formData.get("data");
  if (!data) {
    throw new Response("Invalid data", { status: HTTP_STATUS.BAD_REQUEST });
  }
  try {
    const parsed = JSON.parse(data.toString()) as FormValues;
    await upsertConfig("banner", { image: parsed.image }, "admin");
    return { status: HTTP_STATUS.OK };
  } catch (error) {
    throw new Response("Invalid JSON", { status: HTTP_STATUS.BAD_REQUEST });
  }
}
