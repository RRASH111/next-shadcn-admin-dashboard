"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Download, 
  Settings, 
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  priceId: string;
  cancelAt?: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: string;
  invoicePdf?: string;
}

export default function BillingPage() {
  const { user } = useUser();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      // Fetch subscription, payment methods, and invoices
      const [subscriptionRes, paymentMethodsRes, invoicesRes] = await Promise.all([
        fetch('/api/billing/subscription'),
        fetch('/api/billing/payment-methods'),
        fetch('/api/billing/invoices')
      ]);

      if (subscriptionRes.ok) {
        const subData = await subscriptionRes.json();
        setSubscription(subData);
      }

      if (paymentMethodsRes.ok) {
        const pmData = await paymentMethodsRes.json();
        setPaymentMethods(pmData);
      }

      if (invoicesRes.ok) {
        const invData = await invoicesRes.json();
        setInvoices(invData);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error('Failed to create portal session');
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
    } finally {
      setPortalLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'canceled':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Canceled</Badge>;
      case 'past_due':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Past Due</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Trial</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Billing</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Billing</h1>
      </div>

      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  {getStatusBadge(subscription.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Period</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>
                {subscription.cancelAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cancels At</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(subscription.cancelAt)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleManageBilling} 
                  disabled={portalLoading}
                  className="w-full"
                >
                  {portalLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Manage Billing
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No active subscription found. You're currently on the free plan.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((pm) => (
                <div key={pm.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {pm.card?.brand.toUpperCase()} •••• {pm.card?.last4}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expires {pm.card?.expMonth}/{pm.card?.expYear}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">Default</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No payment methods on file</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(invoice.created)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                      {invoice.status}
                    </Badge>
                    {invoice.invoicePdf && (
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No billing history available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Information */}
      <Card>
        <CardHeader>
          <CardTitle>Current Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold">4,999</div>
              <div className="text-sm text-muted-foreground">Credits Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1</div>
              <div className="text-sm text-muted-foreground">Credits Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">5,000</div>
              <div className="text-sm text-muted-foreground">Total Credits</div>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="text-center">
            <Button variant="outline" onClick={() => window.location.href = '/dashboard/topup'}>
              <CreditCard className="h-4 w-4 mr-2" />
              Add More Credits
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
