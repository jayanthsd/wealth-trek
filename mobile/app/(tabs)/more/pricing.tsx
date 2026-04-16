import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useSubscription } from '@/hooks/useSubscription';
import { createApiClient } from '@/lib/api';
import { useAuth } from '@clerk/clerk-expo';
import { PLANS } from '@/lib/constants';

export default function PricingScreen() {
  const { isDark } = useTheme();
  const { getToken } = useAuth();
  const { subscription, isPro, loading } = useSubscription();
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const bgColor = isDark ? '#0f1115' : '#f7f8fa';
  const textColor = isDark ? '#e8eaf0' : '#1a1e24';
  const mutedColor = isDark ? '#8b9099' : '#64748b';
  const cardBg = isDark ? '#1a1e24' : '#ffffff';
  const borderColor = isDark ? '#252a32' : '#d8dde5';
  const primaryColor = isDark ? '#6ba3b8' : '#1a6b8a';
  const tabBg = isDark ? '#1e2228' : '#e8ecf1';

  const api = createApiClient(getToken);

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;
    setPurchasing(planId);
    try {
      const order = await api.createPaymentOrder(planId, cycle);
      Alert.alert('Payment', `Order created: ₹${order.amount / 100}. Razorpay checkout would open here.`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create order');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }} edges={['bottom']}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        <View style={{ paddingTop: 20, paddingBottom: 8, alignItems: 'center' }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: textColor, marginBottom: 4 }}>Choose Your Plan</Text>
          <Text style={{ color: mutedColor, fontSize: 14 }}>Upgrade to unlock premium features</Text>
        </View>

        {subscription ? (
          <View style={{ backgroundColor: isDark ? 'rgba(107,163,184,0.15)' : 'rgba(26,107,138,0.08)', borderRadius: 12, padding: 14, marginBottom: 16, alignItems: 'center' }}>
            <Text style={{ color: primaryColor, fontWeight: '600', fontSize: 14 }}>
              Current Plan: {subscription.planId} · {subscription.status}
            </Text>
          </View>
        ) : null}

        {/* Billing toggle */}
        <View style={{ flexDirection: 'row', backgroundColor: tabBg, borderRadius: 10, padding: 4, marginBottom: 20, alignSelf: 'center' }}>
          {(['monthly', 'yearly'] as const).map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setCycle(c)}
              style={{
                paddingHorizontal: 24, paddingVertical: 8, borderRadius: 8,
                backgroundColor: cycle === c ? (isDark ? '#252a32' : '#ffffff') : 'transparent',
              }}
            >
              <Text style={{ color: cycle === c ? primaryColor : mutedColor, fontWeight: '600', fontSize: 14 }}>
                {c === 'monthly' ? 'Monthly' : 'Yearly (save 17%)'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trust signals */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ShieldCheck size={14} color={mutedColor} />
            <Text style={{ color: mutedColor, fontSize: 12 }}>No credit card required</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Check size={14} color={mutedColor} />
            <Text style={{ color: mutedColor, fontSize: 12 }}>Cancel anytime</Text>
          </View>
        </View>

        {Object.values(PLANS).map((plan) => {
          const price = cycle === 'monthly' ? plan.priceMonthly : Math.round(plan.priceYearly / 12);
          const isCurrentPlan = subscription?.planId === plan.id && subscription?.status === 'active';
          const isPopular = 'isPopular' in plan && plan.isPopular;
          return (
            <View
              key={plan.id}
              style={{
                backgroundColor: cardBg,
                borderRadius: 20,
                borderWidth: isPopular ? 2 : 1,
                borderColor: isPopular ? primaryColor : borderColor,
                padding: 20,
                marginBottom: 14,
              }}
            >
              {isPopular ? (
                <View style={{ backgroundColor: primaryColor, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 10 }}>
                  <Text style={{ color: isDark ? '#0f1115' : '#ffffff', fontSize: 11, fontWeight: '700' }}>MOST POPULAR</Text>
                </View>
              ) : null}

              <Text style={{ color: textColor, fontSize: 20, fontWeight: '700' }}>{plan.name}</Text>
              <Text style={{ color: mutedColor, fontSize: 13, marginTop: 2, marginBottom: 12 }}>{plan.description}</Text>

              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 16 }}>
                <Text style={{ color: textColor, fontSize: 32, fontWeight: '800' }}>
                  {price === 0 ? 'Free' : `₹${price}`}
                </Text>
                {price > 0 ? <Text style={{ color: mutedColor, fontSize: 13, marginLeft: 4 }}>/month</Text> : null}
              </View>

              <View style={{ marginBottom: 18 }}>
                {plan.features.map((feature, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Check size={15} color={primaryColor} />
                    <Text style={{ color: mutedColor, fontSize: 13, marginLeft: 8 }}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => handleUpgrade(plan.id)}
                disabled={plan.id === 'free' || isCurrentPlan || purchasing === plan.id}
                style={{
                  backgroundColor: isCurrentPlan ? (isDark ? '#252a32' : '#eef0f4') : isPopular ? primaryColor : (isDark ? '#1e2228' : '#e8ecf1'),
                  borderRadius: 12,
                  paddingVertical: 13,
                  alignItems: 'center',
                }}
              >
                {purchasing === plan.id
                  ? <ActivityIndicator color={isPopular ? (isDark ? '#0f1115' : '#ffffff') : primaryColor} />
                  : <Text style={{
                      fontWeight: '600', fontSize: 15,
                      color: isCurrentPlan ? mutedColor : isPopular ? (isDark ? '#0f1115' : '#ffffff') : primaryColor,
                    }}>
                      {plan.id === 'free' ? 'Free Plan' : isCurrentPlan ? 'Current Plan' : 'Upgrade'}
                    </Text>
                }
              </TouchableOpacity>
            </View>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
