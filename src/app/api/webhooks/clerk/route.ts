import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add WEBHOOK_SECRET from Clerk Dashboard to .env");
  }

  // Get the Svix headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, username, first_name, last_name, image_url } = evt.data;

    try {
      // Create user and organization in database
      const user = await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0].email_address,
          username: username || null,
          name: `${first_name || ""} ${last_name || ""}`.trim() || null,
          imageUrl: image_url,
          organization: {
            create: {
              name: `${first_name || username || "User"}'s Organization`,
              slug: `${username || id}-org`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
            },
          },
        },
        include: {
          organization: true,
        },
      });

      console.log(`User and organization created: ${id}, org: ${user.organization?.id}`);
    } catch (error) {
      console.error("Error creating user:", error);
      return new Response("Error occured", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, username, first_name, last_name, image_url } = evt.data;

    try {
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: email_addresses[0].email_address,
          username: username || null,
          name: `${first_name || ""} ${last_name || ""}`.trim() || null,
          imageUrl: image_url,
        },
      });

      console.log(`User updated: ${id}`);
    } catch (error) {
      console.error("Error updating user:", error);
      return new Response("Error occured", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    try {
      await prisma.user.delete({
        where: { clerkId: id },
      });

      console.log(`User deleted: ${id}`);
    } catch (error) {
      console.error("Error deleting user:", error);
      return new Response("Error occured", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
