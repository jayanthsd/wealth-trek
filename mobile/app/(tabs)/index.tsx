import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, TrendingUp, TrendingDown, Activity, AlertCircle, AlertTriangle, Info, Target, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useTheme } from '@/components/ThemeProvider';
import { WealthTrekLogo } from '@/components/WealthTrekLogo';
import { useStatements } from '@/hooks/useStatements';
import { useNetWorthHistory } from '@/hooks/useNetWorthHistory';
import { useFinancialGoals } from '@/hooks/useFinancialGoals';
import { NetWorthCard } from '@/components/NetWorthCard';
import { InsightCard } from '@/components/ui/InsightCard';
import { StatementForm } from '@/components/StatementForm';
import { StatementEntry, InsightItem } from '@/types';
import { computeAllInsights } from '@/lib/insightsEngine';

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function DashboardScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { user } = useUser();
  const {
    totalAssets, totalLiabilities, netWorth, loading: stmtLoading,
    refresh: refreshStatements, addStatement,
  } = useStatements();
  const {
    snapshots, latest, netWorthChange, netWorthChangePct,
    loading: snapLoading, refresh: refreshSnapshots,
  } = useNetWorthHistory();
  const { activeGoals } = useFinancialGoals();

  const [formVisible, setFormVisible] = useState(false);
  const [defaultCategory, setDefaultCategory] = useState<'asset' | 'liability'>('asset');

  const bgColor = isDark ? '#0f1115' : '#f7f8fa';
  const textColor = isDark ? '#e8eaf0' : '#1a1e24';
  const mutedColor = isDark ? '#8b9099' : '#64748b';
  const cardBg = isDark ? '#1a1e24' : '#ffffff';
  const borderColor = isDark ? '#252a32' : '#d8dde5';
  const primaryColor = isDark ? '#6ba3b8' : '#1a6b8a';
  const positiveColor = isDark ? '#6aab8a' : '#16a34a';

  const loading = stmtLoading || snapLoading;
  const refresh = () => { refreshStatements(); refreshSnapshots(); };

  const insightResult = useMemo(() => computeAllInsights(snapshots), [snapshots]);

  const topInsights = useMemo(() => {
    const all: InsightItem[] = [];
    for (const items of Object.values(insightResult.domains)) {
      for (const item of items) {
        if (!item.unavailable) all.push(item);
      }
    }
    const severityOrder = { critical: 0, warning: 1, info: 2, unavailable: 3 };
    all.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    return all.slice(0, 4);
  }, [insightResult]);

  const handleAddStatement = async (entry: Omit<StatementEntry, 'id'>) => {
    await addStatement(entry);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={primaryColor} />}
      >
        <View style={{ paddingTop: 16, paddingBottom: 8 }}>
          <WealthTrekLogo size={24} color={primaryColor} style={{ marginBottom: 4 }} />
          <Text style={{ fontSize: 24, fontWeight: '700', color: textColor }}>
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''} 👋
          </Text>
          <Text style={{ color: mutedColor, marginTop: 2 }}>
            {netWorthChangePct !== null
              ? `Your wealth ${netWorthChangePct >= 0 ? 'grew' : 'declined'} ${Math.abs(netWorthChangePct).toFixed(1)}% since last snapshot`
              : 'Your wealth overview'}
          </Text>
        </View>

        <NetWorthCard netWorth={netWorth} change={netWorthChange} changePct={netWorthChangePct} />

        {/* Summary row */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: cardBg, borderRadius: 14, borderWidth: 1, borderColor, padding: 14 }}>
            <Text style={{ color: mutedColor, fontSize: 11, marginBottom: 4 }}>Total Assets</Text>
            <Text style={{ color: positiveColor, fontSize: 17, fontWeight: '700' }}>{formatCurrency(totalAssets)}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: cardBg, borderRadius: 14, borderWidth: 1, borderColor, padding: 14 }}>
            <Text style={{ color: mutedColor, fontSize: 11, marginBottom: 4 }}>Liabilities</Text>
            <Text style={{ color: '#dc2626', fontSize: 17, fontWeight: '700' }}>{formatCurrency(totalLiabilities)}</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => { setDefaultCategory('asset'); setFormVisible(true); }}
            style={{ flex: 1, backgroundColor: positiveColor, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Plus size={18} color="#ffffff" />
            <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 14 }}>Add Asset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setDefaultCategory('liability'); setFormVisible(true); }}
            style={{ flex: 1, backgroundColor: '#dc2626', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Plus size={18} color="#ffffff" />
            <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 14 }}>Add Liability</Text>
          </TouchableOpacity>
        </View>

        {/* Intelligence Feed */}
        <Text style={{ color: textColor, fontWeight: '600', fontSize: 16, marginBottom: 12 }}>Intelligence Feed</Text>

        {topInsights.length === 0 ? (
          <InsightCard
            icon={<Activity size={18} color={primaryColor} />}
            title="Get Started"
            description="Add your assets and liabilities in the Snapshot tab to see your net worth insights here."
            accent="neutral"
          />
        ) : (
          <>
            {topInsights.map((insight) => {
              const accent = insight.severity === 'critical' ? 'negative' : insight.severity === 'warning' ? 'negative' : 'positive';
              const icon = insight.severity === 'critical'
                ? <AlertCircle size={18} color="#dc2626" />
                : insight.severity === 'warning'
                  ? <AlertTriangle size={18} color={isDark ? '#f59e0b' : '#d97706'} />
                  : insight.trend === 'up'
                    ? <TrendingUp size={18} color={positiveColor} />
                    : insight.trend === 'down'
                      ? <TrendingDown size={18} color="#dc2626" />
                      : <Info size={18} color={primaryColor} />;
              return (
                <InsightCard
                  key={insight.id}
                  icon={icon}
                  title={insight.title}
                  description={insight.description}
                  accent={accent}
                />
              );
            })}
          </>
        )}

        {/* View all insights link */}
        {topInsights.length > 0 ? (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/analytics')}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, marginBottom: 8 }}
          >
            <Text style={{ color: primaryColor, fontWeight: '600', fontSize: 13 }}>View all insights</Text>
            <ChevronRight size={14} color={primaryColor} />
          </TouchableOpacity>
        ) : null}

        {/* Goals Progress */}
        {activeGoals.length > 0 ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ color: textColor, fontWeight: '600', fontSize: 16 }}>Goals</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/more/goals')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: primaryColor, fontSize: 12, fontWeight: '600' }}>View all</Text>
                <ChevronRight size={12} color={primaryColor} />
              </TouchableOpacity>
            </View>
            {activeGoals.slice(0, 3).map((goal) => {
              const progress = goal.targetAmount && netWorth > 0 ? Math.min((netWorth / goal.targetAmount) * 100, 100) : 0;
              return (
                <View key={goal.id} style={{ backgroundColor: cardBg, borderRadius: 14, borderWidth: 1, borderColor, padding: 14, marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Target size={16} color={primaryColor} />
                    <Text style={{ color: textColor, fontWeight: '600', fontSize: 14, marginLeft: 8, flex: 1 }} numberOfLines={1}>{goal.title}</Text>
                    {goal.targetAmount ? (
                      <Text style={{ color: mutedColor, fontSize: 12 }}>{formatCurrency(goal.targetAmount)}</Text>
                    ) : null}
                  </View>
                  {goal.targetAmount ? (
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: isDark ? '#252a32' : '#e8ecf1' }}>
                      <View style={{ height: 6, borderRadius: 3, backgroundColor: primaryColor, width: `${progress}%` } as any} />
                    </View>
                  ) : null}
                  {goal.targetAmount ? (
                    <Text style={{ color: mutedColor, fontSize: 11, marginTop: 4 }}>{progress.toFixed(0)}% of target</Text>
                  ) : null}
                </View>
              );
            })}
          </>
        ) : null}

        <View style={{ height: 80 }} />
      </ScrollView>

      <StatementForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSave={handleAddStatement}
        editEntry={null}
      />
    </SafeAreaView>
  );
}
