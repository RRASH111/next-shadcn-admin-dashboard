import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organization: true }
    });

    if (!user?.organization?.stripeCustomerId) {
      return NextResponse.json([]);
    }

    // Get invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: user.organization.stripeCustomerId,
      limit: 10,
    });

    return NextResponse.json(
      invoices.data.map(invoice => ({
        id: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        created: new Date(invoice.created * 1000).toISOString(),
        invoicePdf: invoice.invoice_pdf,
      }))
    );
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
