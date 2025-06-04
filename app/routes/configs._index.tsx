import { type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, useSubmit } from "@remix-run/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import MainLayout from "~/layouts/MainLayout";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/components/ui/form";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { ImageUpIcon } from "lucide-react";
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
  const [section, setSection] = useState("banner");

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
            <ToggleGroup
              type="single"
              value={section}
              onValueChange={(v) => setSection(v || "banner")}
              variant="outline"
              className="mb-4"
            >
              <ToggleGroupItem value="banner">Hero Brand Image</ToggleGroupItem>
            </ToggleGroup>
            {section === "banner" && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hero Brand Image</FormLabel>
                        <FormControl>
                          <Input type="hidden" {...field} />
                        </FormControl>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleUpload}
                        />
                        <div
                          className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-8 text-sm text-muted-foreground hover:bg-muted/50"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {field.value ? (
                            <img src={field.value} alt="Hero" className="max-h-40 object-contain" />
                          ) : (
                            <span className="flex flex-col items-center gap-2">
                              <ImageUpIcon className="h-6 w-6" />
                              Upload Image
                            </span>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Save</Button>
                </form>
              </Form>
            )}
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
