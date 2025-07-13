/**
 * SUBSCRIPTION ROUTES - PRODUCTION READY
 * =====================================
 * 
 * Complete subscription management API with Stripe integration
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { auth } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

// ============================================================================
// SUBSCRIPTION CONFIGURATION
// ============================================================================

const SUBSCRIPTION_TIERS = {
  FREE: {
    tier: 'FREE',
    monthlyVoiceMinutes: 60,
    monthlyCampaigns: 5,
    monthlyAIInteractions: 100,
    monthlyExports: 3,
    maxConcurrentSessions: 1,
    maxStorageGB: 1,
    maxTeamMembers: 1,
    price: 0,
    stripePriceId: null
  },
  PRO: {
    tier: 'PRO',
    monthlyVoiceMinutes: 300,
    monthlyCampaigns: 50,
    monthlyAIInteractions: 1000,
    monthlyExports: 25,
    maxConcurrentSessions: 3,
    maxStorageGB: 10,
    maxTeamMembers: 5,
    price: 1999, // $19.99 in cents
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID
  }
};

// ============================================================================
// GET CURRENT SUBSCRIPTION
// ============================================================================

router.get('/current', auth, async (req, res) => {
  try {

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized or undefined userId' });
  }
    const userId = req.user.id;

    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      include: {
        limits: true,
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!subscription) {
      // Create free subscription if none exists
      const freeSubscription = await createFreeSubscription(userId);
      return res.json(freeSubscription);
    }

    // Check if subscription needs sync with Stripe
    if (subscription.stripeSubscriptionId) {
      await syncWithStripe(subscription.id);
    }

    res.json(subscription);

  } catch (error) {
    logger.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// ============================================================================
// GET SUBSCRIPTION PLANS
// ============================================================================

router.get('/plans', async (req, res) => {
  try {
    res.json({
      tiers: Object.values(SUBSCRIPTION_TIERS),
      features: {
        FREE: [
          '60 minutes of voice interaction per month',
          '5 campaign sessions per month',
          '100 AI interactions per month',
          '3 exports per month',
          '1 concurrent session',
          '1GB storage',
          'Community support'
        ],
        PRO: [
          '300 minutes of voice interaction per month',
          '50 campaign sessions per month',
          '1,000 AI interactions per month',
          '25 exports per month',
          '3 concurrent sessions',
          '10GB storage',
          'Priority support',
          'Advanced analytics',
          'Custom voice training'
        ]
      }
    });
  } catch (error) {
    logger.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// ============================================================================
// CREATE CHECKOUT SESSION
// ============================================================================

router.post('/checkout', auth, rateLimiter({ windowMs: 60000, max: 5 }), async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized or undefined userId' });
    }
    const userId = req.user.id;
    const { tier, annual = false } = req.body;

    if (!SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];

    if (!tierConfig.stripePriceId) {
      return res.status(400).json({ error: 'Invalid tier for checkout' });
    }

    // Get or create Stripe customer
    let customer = await getOrCreateStripeCustomer(userId);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: tierConfig.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/settings/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/settings/subscription?canceled=true`,
      metadata: {
        userId,
        tier
      },
      subscription_data: {
        metadata: {
          userId,
          tier
        },
        trial_period_days: tier === 'PRO' ? 14 : 7 // Different trial periods
      }
    });

    res.json({ sessionId: session.id, url: session.url });

  } catch (error) {
    logger.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// ============================================================================
// CANCEL SUBSCRIPTION
// ============================================================================

router.post('/cancel', auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized or undefined userId' });
    }
    const userId = req.user.id;
    const { immediate = false } = req.body;

    const subscription = await prisma.subscription.findFirst({
      where: { userId }
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    if (immediate) {
      // Cancel immediately
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELED',
          canceledAt: new Date(),
          cancelAtPeriodEnd: false
        }
      });
    } else {
      // Cancel at period end
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          cancelAtPeriodEnd: true
        }
      });
    }

    res.json({ success: true, immediate });

  } catch (error) {
    logger.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// ============================================================================
// REACTIVATE SUBSCRIPTION
// ============================================================================

router.post('/reactivate', auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized or undefined userId' });
    }
    const userId = req.user.id;

    const subscription = await prisma.subscription.findFirst({
      where: { userId }
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    if (!subscription.cancelAtPeriodEnd) {
      return res.status(400).json({ error: 'Subscription is not scheduled for cancellation' });
    }

    // Remove cancellation
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: false
      }
    });

    res.json({ success: true });

  } catch (error) {
    logger.error('Error reactivating subscription:', error);
    res.status(500).json({ error: 'Failed to reactivate subscription' });
  }
});

// ============================================================================
// UPDATE PAYMENT METHOD
// ============================================================================

router.post('/payment-method', auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized or undefined userId' });
    }
    const userId = req.user.id;
    const { paymentMethodId } = req.body;

    const subscription = await prisma.subscription.findFirst({
      where: { userId }
    });

    if (!subscription || !subscription.stripeCustomerId) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: subscription.stripeCustomerId,
    });

    // Set as default payment method
    await stripe.customers.update(subscription.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Update subscription payment method
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        default_payment_method: paymentMethodId,
      });
    }

    // Update database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        stripePaymentMethodId: paymentMethodId
      }
    });

    res.json({ success: true });

  } catch (error) {
    logger.error('Error updating payment method:', error);
    res.status(500).json({ error: 'Failed to update payment method' });
  }
});

// ============================================================================
// GET USAGE STATISTICS
// ============================================================================

router.get('/usage', auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized or undefined userId' });
    }
    const userId = req.user.id;

    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      include: { limits: true }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    // Get current billing period usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const usage = await prisma.usage.findMany({
      where: {
        userId,
        billingPeriodStart: { gte: startOfMonth },
        billingPeriodEnd: { lte: endOfMonth }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Aggregate usage by type
    const aggregatedUsage = usage.reduce((acc, record) => {
      if (!acc[record.type]) {
        acc[record.type] = 0;
      }
      acc[record.type] += record.amount;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      subscription,
      limits: subscription.limits,
      usage: aggregatedUsage,
      billingPeriod: {
        start: startOfMonth,
        end: endOfMonth
      }
    });

  } catch (error) {
    logger.error('Error fetching usage:', error);
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
});

// ============================================================================
// STRIPE WEBHOOK HANDLER
// ============================================================================

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err);
    return res.status(400).send('Webhook Error');
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        logger.info('Unhandled event type:', event.type);
    }

    res.json({ received: true });

  } catch (error) {
    logger.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function createFreeSubscription(userId: string) {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const usageResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const freeConfig = SUBSCRIPTION_TIERS.FREE;

  return await prisma.subscription.create({
    data: {
      userId,
      tier: 'FREE',
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
      limits: {
        create: {
          ...freeConfig,
          usageResetDate
        }
      }
    },
    include: {
      limits: true
    }
  });
}

async function getOrCreateStripeCustomer(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  let subscription = await prisma.subscription.findFirst({
    where: { userId }
  });

  if (subscription?.stripeCustomerId) {
    return await stripe.customers.retrieve(subscription.stripeCustomerId);
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId }
  });

  // Update or create subscription with customer ID
  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { stripeCustomerId: customer.id }
    });
  } else {
    await createFreeSubscription(userId);
    await prisma.subscription.update({
      where: { userId },
      data: { stripeCustomerId: customer.id }
    });
  }

  return customer;
}

async function syncWithStripe(subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId }
  });

  if (!subscription?.stripeSubscriptionId) return;

  try {
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
    
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: stripeSubscription.status.toUpperCase() as any,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
      }
    });
  } catch (error) {
    logger.error('Error syncing with Stripe:', error);
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;

  if (!userId || !tier) return;

  const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);
  const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      tier: tier as any,
      status: stripeSubscription.status.toUpperCase() as any,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: tierConfig.stripePriceId!,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
      trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
      limits: {
        upsert: {
          create: {
            ...tierConfig,
            usageResetDate: new Date(stripeSubscription.current_period_end * 1000)
          },
          update: {
            ...tierConfig,
            usageResetDate: new Date(stripeSubscription.current_period_end * 1000),
            // Reset usage counters
            usedVoiceMinutes: 0,
            usedCampaigns: 0,
            usedAIInteractions: 0,
            usedExports: 0
          }
        }
      }
    },
    create: {
      userId,
      tier: tier as any,
      status: stripeSubscription.status.toUpperCase() as any,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: tierConfig.stripePriceId!,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
      trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
      limits: {
        create: {
          ...tierConfig,
          usageResetDate: new Date(stripeSubscription.current_period_end * 1000)
        }
      }
    },
    include: { limits: true }
  });
}

async function handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: stripeSubscription.id },
    data: {
      status: stripeSubscription.status.toUpperCase() as any,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
    }
  });
}

async function handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: stripeSubscription.id },
    data: {
      status: 'CANCELED',
      canceledAt: new Date()
    }
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: invoice.subscription as string }
  });

  if (!subscription) return;

  await prisma.invoice.create({
    data: {
      subscriptionId: subscription.id,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'PAID',
      periodStart: new Date(invoice.period_start * 1000),
      periodEnd: new Date(invoice.period_end * 1000),
      paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
      invoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf
    }
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: invoice.subscription as string }
  });

  if (!subscription) return;

  await prisma.invoice.create({
    data: {
      subscriptionId: subscription.id,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'UNCOLLECTIBLE',
      periodStart: new Date(invoice.period_start * 1000),
      periodEnd: new Date(invoice.period_end * 1000),
      paymentFailedAt: new Date(),
      invoiceUrl: invoice.hosted_invoice_url
    }
  });
}

export default router;