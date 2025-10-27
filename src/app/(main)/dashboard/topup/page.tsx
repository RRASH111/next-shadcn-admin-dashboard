"use client";

import { CreditCard, Check, Zap, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const creditPackages = [
  {
    id: "10k",
    credits: 10000,
    price: 37,
    currency: "USD",
    popular: false,
    savings: null,
    billing: "monthly",
  },
  {
    id: "25k",
    credits: 25000,
    price: 49,
    currency: "USD",
    popular: true,
    savings: "33%",
    billing: "monthly",
  },
  {
    id: "50k",
    credits: 50000,
    price: 77,
    currency: "USD",
    popular: false,
    savings: "37%",
    billing: "monthly",
  },
  {
    id: "100k",
    credits: 100000,
    price: 129,
    currency: "USD",
    popular: false,
    savings: "42%",
    billing: "monthly",
  },
];

export default function TopupPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    }
    if (searchParams.get('canceled') === 'true') {
      setShowCanceled(true);
      // Hide canceled message after 5 seconds
      setTimeout(() => setShowCanceled(false), 5000);
    }
  }, [searchParams]);

  const handlePurchase = async (packageId: string) => {
    setIsProcessing(true);
    setSelectedPackage(packageId);
    
    try {
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error('Failed to create checkout session');
        setIsProcessing(false);
        setSelectedPackage(null);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setIsProcessing(false);
      setSelectedPackage(null);
    }
  };

  const formatCredits = (credits: number) => {
    return credits.toLocaleString();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Add Credits</h1>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        {showSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Payment successful! Your credits have been added to your account.
            </AlertDescription>
          </Alert>
        )}
        
        {showCanceled && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Payment was canceled. You can try again anytime.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Email Verification Credits</h2>
          <p className="text-muted-foreground">
            Choose a monthly credit package that fits your verification needs. Credits renew every month automatically.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {creditPackages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                pkg.popular ? 'ring-2 ring-primary shadow-lg' : ''
              } ${selectedPackage === pkg.id ? 'ring-2 ring-primary' : ''}`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Zap className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg">{formatCredits(pkg.credits)}</CardTitle>
                <p className="text-sm text-muted-foreground">Email Verification Credits</p>
                {pkg.savings && (
                  <Badge variant="secondary" className="w-fit mx-auto mt-2">
                    Save {pkg.savings}
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">${pkg.price}</div>
                  <div className="text-sm text-muted-foreground">{pkg.currency} / month</div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Monthly renewal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Instant activation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Real-time verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Detailed results</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={isProcessing}
                  variant={pkg.popular ? "default" : "outline"}
                >
                  {isProcessing && selectedPackage === pkg.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Subscribe Monthly
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            All payments are processed securely. Credits are added to your account immediately and renew monthly.
          </p>
        </div>
      </div>
    </div>
  );
}
