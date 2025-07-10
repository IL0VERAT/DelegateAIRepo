/**
 * SUBSCRIPTION MANAGER COMPONENT
 * ==============================
 * 
 * Complete subscription management interface for users
 */

import React, { useState, useEffect } from 'react';
import {
  CreditCard, Calendar, TrendingUp, AlertTriangle, CheckCircle, 
  Crown, Star, Zap, Settings, Download, ExternalLink, RefreshCw,
  BarChart3, Clock, Users, Database, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import { subscriptionService, type Subscription, type SubscriptionPlans, type UsageData } from '../services/subscriptionService';
import { logger } from '../utils/logger';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SubscriptionManager() {
  // State management
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlans | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      
      const [subscriptionData, plansData, usage] = await Promise.all([
        subscriptionService.getCurrentSubscription(),
        subscriptionService.getSubscriptionPlans(),
        subscriptionService.getUsageData()
      ]);

      setSubscription(subscriptionData);
      setPlans(plansData);
      setUsageData(usage);

    } catch (error) {
      logger.error('Error loading subscription data:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  // ============================================================================
  // SUBSCRIPTION ACTIONS
  // ============================================================================

  const handleUpgrade = async (tier: string) => {
    try {
      setIsUpgrading(true);
      
      const checkoutSession = await subscriptionService.createCheckoutSession(tier);
      
      if (checkoutSession?.url) {
        // Redirect to Stripe Checkout
        window.location.href = checkoutSession.url;
      } else {
        toast.error('Failed to create checkout session');
      }

    } catch (error) {
      logger.error('Error upgrading subscription:', error);
      toast.error('Failed to upgrade subscription');
    } finally {
      setIsUpgrading(false);
      setShowUpgradeDialog(false);
    }
  };

  const handleCancel = async (immediate: boolean = false) => {
    try {
      setIsCanceling(true);
      
      const success = await subscriptionService.cancelSubscription(immediate);
      
      if (success) {
        toast.success(immediate ? 'Subscription canceled immediately' : 'Subscription will cancel at period end');
        await loadSubscriptionData();
      } else {
        toast.error('Failed to cancel subscription');
      }

    } catch (error) {
      logger.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setIsCanceling(false);
      setShowCancelDialog(false);
    }
  };

  const handleReactivate = async () => {
    try {
      const success = await subscriptionService.reactivateSubscription();
      
      if (success) {
        toast.success('Subscription reactivated successfully');
        await loadSubscriptionData();
      } else {
        toast.error('Failed to reactivate subscription');
      }

    } catch (error) {
      logger.error('Error reactivating subscription:', error);
      toast.error('Failed to reactivate subscription');
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSubscriptionOverview = () => {
    if (!subscription || !usageData) return null;

    const statusDisplay = subscriptionService.getSubscriptionStatusDisplay(subscription);
    const tierDisplay = subscriptionService.getTierDisplay(subscription.tier);
    const isTrialing = subscriptionService.isInTrial(subscription);
    const trialDaysRemaining = subscriptionService.getTrialDaysRemaining(subscription);

    return (
      <div className="space-y-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{tierDisplay.icon}</div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {tierDisplay.name} Plan
                    <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {statusDisplay.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600">{statusDisplay.description}</p>
                </div>
              </div>
              <div className="text-right">
                {subscription.tier !== 'FREE' && (
                  <p className="text-2xl font-bold">
                    ${plans?.tiers.find(t => t.tier === subscription.tier)?.price ? 
                      (plans.tiers.find(t => t.tier === subscription.tier)!.price / 100).toFixed(2) : 
                      '0.00'
                    }
                    <span className="text-sm font-normal text-gray-600">/month</span>
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isTrialing && (
              <Alert className="mb-4">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  You have {trialDaysRemaining} days remaining in your free trial.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Billing Period</h4>
                <p className="text-sm text-gray-600">
                  {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {' '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
              
              {subscription.cancelAtPeriodEnd && (
                <div>
                  <h4 className="font-medium mb-2">Cancellation</h4>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-600">Cancels on period end</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReactivate}
                    >
                      Reactivate
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              {subscription.tier === 'FREE' ? (
                <Button onClick={() => setShowUpgradeDialog(true)}>
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUpgradeDialog(true)}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Change Plan
                  </Button>
                  {!subscription.cancelAtPeriodEnd && (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCancelDialog(true)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </>
              )}
              <Button variant="outline" onClick={loadSubscriptionData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderUsageMetric(
                'Voice Minutes',
                usageData.limits.usedVoiceMinutes,
                usageData.limits.monthlyVoiceMinutes,
                'minutes',
                Clock
              )}
              {renderUsageMetric(
                'Campaigns',
                usageData.limits.usedCampaigns,
                usageData.limits.monthlyCampaigns,
                'sessions',
                Users
              )}
              {renderUsageMetric(
                'AI Interactions',
                usageData.limits.usedAIInteractions,
                usageData.limits.monthlyAIInteractions,
                'interactions',
                Zap
              )}
              {renderUsageMetric(
                'Exports',
                usageData.limits.usedExports,
                usageData.limits.monthlyExports,
                'exports',
                Download
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderUsageMetric = (
    title: string,
    used: number,
    limit: number,
    unit: string,
    Icon: React.ComponentType<any>
  ) => {
    const percentage = subscriptionService.calculateUsagePercentage(used, limit);
    const isNearLimit = percentage >= 80;
    const isOverLimit = percentage >= 100;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">{title}</span>
          </div>
          <span className="text-xs text-gray-600">
            {used} / {limit} {unit}
          </span>
        </div>
        <Progress 
          value={percentage} 
          className={`h-2 ${isOverLimit ? 'bg-red-100' : isNearLimit ? 'bg-orange-100' : 'bg-green-100'}`}
        />
        <div className="flex justify-between text-xs">
          <span className={isOverLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-gray-600'}>
            {percentage}% used
          </span>
          {isNearLimit && (
            <span className="text-orange-600">Near limit</span>
          )}
        </div>
      </div>
    );
  };

  const renderPlansComparison = () => {
    if (!plans) return null;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Choose Your Plan</h3>
          <p className="text-gray-600">Upgrade or downgrade your subscription at any time.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.tiers.map((tier) => {
            const isCurrentPlan = subscription?.tier === tier.tier;
            const tierDisplay = subscriptionService.getTierDisplay(tier.tier);
            const features = plans.features[tier.tier] || [];

            return (
              <Card 
                key={tier.tier} 
                className={`relative ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''} ${
                  tier.tier === 'PRO' ? 'border-blue-300 shadow-lg' : ''
                }`}
              >
                {tier.tier === 'PRO' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="text-3xl mb-2">{tierDisplay.icon}</div>
                  <CardTitle className={tierDisplay.color}>{tierDisplay.name}</CardTitle>
                  <div className="mt-4">
                    {tier.price === 0 ? (
                      <div className="text-3xl font-bold">Free</div>
                    ) : (
                      <div>
                        <div className="text-3xl font-bold">
                          ${(tier.price / 100).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">per month</div>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setSelectedTier(tier.tier);
                        setShowUpgradeDialog(true);
                      }}
                      className="w-full"
                      variant={tier.tier === 'PRO' ? 'default' : 'outline'}
                    >
                      {tier.tier === 'FREE' ? 'Downgrade' : 'Upgrade'} to {tierDisplay.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBillingHistory = () => {
    if (!subscription?.invoices) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Billing History</h3>
        
        {subscription.invoices.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="font-medium text-gray-600 mb-2">No billing history</h4>
              <p className="text-gray-500">Your invoices will appear here once you have a paid subscription.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {subscription.invoices.map((invoice) => (
                  <div key={invoice.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {subscriptionService.formatPrice(invoice.amount, invoice.currency)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(invoice.periodStart).toLocaleDateString()} - {' '}
                        {new Date(invoice.periodEnd).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={invoice.status === 'PAID' ? 'default' : 'destructive'}
                      >
                        {invoice.status}
                      </Badge>
                      {invoice.invoiceUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // ============================================================================
  // DIALOG COMPONENTS
  // ============================================================================

  const renderUpgradeDialog = () => (
    <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedTier === 'FREE' ? 'Downgrade' : 'Upgrade'} Subscription
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {selectedTier === 'FREE' 
                ? 'Are you sure you want to downgrade to the Free plan?' 
                : `Upgrade to ${subscriptionService.getTierDisplay(selectedTier).name} plan?`
              }
            </p>
            
            {selectedTier !== 'FREE' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  You'll be redirected to secure checkout to complete your upgrade.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleUpgrade(selectedTier)}
              disabled={isUpgrading}
              className="flex-1"
            >
              {isUpgrading ? 'Processing...' : 'Continue'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderCancelDialog = () => (
    <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Subscription</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-gray-600 mb-4">
              We're sorry to see you go. Your subscription will remain active until the end of your current billing period.
            </p>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                After cancellation, you'll lose access to premium features and your usage will be limited to the free tier.
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              className="flex-1"
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleCancel(false)}
              disabled={isCanceling}
              className="flex-1"
            >
              {isCanceling ? 'Canceling...' : 'Cancel Subscription'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription</h2>
        <p className="text-gray-600">Manage your subscription and billing preferences</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderSubscriptionOverview()}
        </TabsContent>

        <TabsContent value="plans" className="mt-6">
          {renderPlansComparison()}
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          {renderBillingHistory()}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {renderUpgradeDialog()}
      {renderCancelDialog()}
    </div>
  );
}

export default SubscriptionManager;