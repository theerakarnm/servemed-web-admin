import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { getConfig, upsertConfig } from "~/action/config";
import { HTTP_STATUS } from "~/config/http";

export async function loader({ params }: LoaderFunctionArgs) {
  const key = params.key;
  if (!key) throw new Response("Config key required", { status: HTTP_STATUS.BAD_REQUEST });
  const config = await getConfig(key);
  if (!config) {
    throw new Response("Not found", { status: HTTP_STATUS.NOT_FOUND });
  }
  return json(config);
}

export async function action({ request, params }: ActionFunctionArgs) {
  const key = params.key;
  if (!key) throw new Response("Config key required", { status: HTTP_STATUS.BAD_REQUEST });
  const body = await request.json();
  await upsertConfig(key, body.value, "admin");
  return json({ status: HTTP_STATUS.OK });
}
