import { useState, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, Minus, ChevronRight, ArrowLeft, AlertTriangle, CheckCircle, AlertCircle, Info, Lock } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useStatements } from '@/hooks/useStatements';
import { useNetWorthHistory } from '@/hooks/useNetWorthHistory';
import { PieChart } from '@/components/charts/PieChart';
import { InsightDomain, InsightItem } from '@/types';
import {
  computeAllInsights,
  computeDomainHealth,
  computeOverallHealth,
  DOMAIN_ORDER,
  DOMAIN_LABELS,
  DomainHealth,
  HealthStatus,
} from '@/lib/insightsEngine';

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

const STATUS_COLORS: Record<HealthStatus, { bg: string; text: string; darkBg: string; darkText: string }> = {
  green: { bg: 'rgba(22,163,74,0.10)', text: '#16a34a', darkBg: 'rgba(106,171,138,0.15)', darkText: '#6aab8a' },
  amber: { bg: 'rgba(245,158,11,0.10)', text: '#d97706', darkBg: 'rgba(245,158,11,0.15)', darkText: '#f59e0b' },
  red: { bg: 'rgba(220,38,38,0.10)', text: '#dc2626', darkBg: 'rgba(220,38,38,0.15)', darkText: '#f87171' },
  grey: { bg: 'rgba(100,116,139,0.10)', text: '#64748b', darkBg: 'rgba(139,144,153,0.15)', darkText: '#8b9099' },
};

function StatusDot({ status, isDark, size = 12 }: { status: HealthStatus; isDark: boolean; size?: number }) {
  const c = STATUS_COLORS[status];
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: isDark ? c.darkText : c.text }} />;
}

function SeverityIcon({ severity, isDark }: { severity: string; isDark: boolean }) {
  const size = 16;
  if (severity === 'critical') return <AlertCircle size={size} color="#dc2626" />;
  if (severity === 'warning') return <AlertTriangle size={size} color={isDark ? '#f59e0b' : '#d97706'} />;
  return <Info size={size} color={isDark ? '#6ba3b8' : '#1a6b8a'} />;
}

function MetricGauge({ value, isDark }: { value: number; isDark: boolean }) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const pct = clamped * 100;
  const barBg = isDark ? '#252a32' : '#e8ecf1';
  const barColor = pct > 60 ? '#dc2626' : pct > 40 ? (isDark ? '#f59e0b' : '#d97706') : (isDark ? '#6aab8a' : '#16a34a');
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: barBg, marginTop: 8 }}>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: barColor, width: `${pct}%` } as any} />
    </View>
  );
}

// ---- Domain Detail View ----
function DomainDetailView({
  domain, items, onBack, isDark,
}: { domain: InsightDomain; items: InsightItem[]; onBack: () => void; isDark: boolean }) {
  const textColor = isDark ? '#e8eaf0' : '#1a1e24';
  const mutedColor = isDark ? '#8b9099' : '#64748b';
  const cardBg = isDark ? '#1a1e24' : '#ffffff';
  const borderColor = isDark ? '#252a32' : '#d8dde5';
  const primaryColor = isDark ? '#6ba3b8' : '#1a6b8a';

  const available = items.filter((i) => !i.unavailable);
  const unavailable = items.filter((i) => i.unavailable);

  const health = computeDomainHealth(items);
  const sc = STATUS_COLORS[health.status];

  return (
    <>
      <TouchableOpacity onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <ArrowLeft size={20} color={primaryColor} />
        <Text style={{ color: primaryColor, fontWeight: '600', marginLeft: 6, fontSize: 14 }}>Back to Overview</Text>
      </TouchableOpacity>

      <View style={{ backgroundColor: isDark ? sc.darkBg : sc.bg, borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <Text style={{ color: textColor, fontSize: 20, fontWeight: '700', marginBottom: 6 }}>{DOMAIN_LABELS[domain]}</Text>
        <Text style={{ color: mutedColor, fontSize: 14, lineHeight: 20 }}>
          {available.length > 0
            ? available[0].description
            : 'Not enough data to generate insights for this domain yet.'}
        </Text>
      </View>

      {available.map((item) => {
        const accentColor = item.severity === 'critical' ? '#dc2626' : item.severity === 'warning' ? (isDark ? '#f59e0b' : '#d97706') : primaryColor;
        return (
          <View key={item.id} style={{ backgroundColor: cardBg, borderRadius: 14, borderWidth: 1, borderColor, borderLeftWidth: 3, borderLeftColor: accentColor, padding: 16, marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <SeverityIcon severity={item.severity} isDark={isDark} />
              <Text style={{ color: textColor, fontWeight: '600', fontSize: 14, marginLeft: 8, flex: 1 }}>{item.title}</Text>
            </View>
            <Text style={{ color: mutedColor, fontSize: 13, lineHeight: 19 }}>{item.description}</Text>
            {item.metricValue !== undefined && item.metricValue >= 0 && item.metricValue <= 1 ? (
              <MetricGauge value={item.metricValue} isDark={isDark} />
            ) : item.metricValue !== undefined ? (
              <Text style={{ color: accentColor, fontWeight: '700', fontSize: 13, marginTop: 6 }}>
                {item.metricLabel}: {typeof item.metricValue === 'number'
                  ? (Math.abs(item.metricValue) >= 1000 ? formatCurrency(item.metricValue) : item.metricValue.toFixed(2))
                  : item.metricValue}
              </Text>
            ) : null}
          </View>
        );
      })}

      {unavailable.length > 0 ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4 }}>
          <Lock size={14} color={mutedColor} />
          <Text style={{ color: mutedColor, fontSize: 12, marginLeft: 6 }}>
            {unavailable.length} metric{unavailable.length !== 1 ? 's' : ''} need more data
          </Text>
        </View>
      ) : null}
    </>
  );
}

export default function AnalyticsScreen() {
  const { isDark } = useTheme();
  const { assets, liabilities, loading: stmtLoading, refresh: refreshStmt } = useStatements();
  const { snapshots, latest, previous, netWorthChange, loading: snapLoading, refresh: refreshSnap } = useNetWorthHistory();
  const [selectedDomain, setSelectedDomain] = useState<InsightDomain | null>(null);

  const bgColor = isDark ? '#0f1115' : '#f7f8fa';
  const textColor = isDark ? '#e8eaf0' : '#1a1e24';
  const mutedColor = isDark ? '#8b9099' : '#64748b';
  const cardBg = isDark ? '#1a1e24' : '#ffffff';
  const borderColor = isDark ? '#252a32' : '#d8dde5';
  const primaryColor = isDark ? '#6ba3b8' : '#1a6b8a';

  const loading = stmtLoading || snapLoading;
  const refresh = () => { refreshStmt(); refreshSnap(); };

  const insightResult = useMemo(() => computeAllInsights(snapshots), [snapshots]);

  const domainHealthMap = useMemo<DomainHealth[]>(() => {
    return DOMAIN_ORDER.map((domain) => ({
      domain,
      ...computeDomainHealth(insightResult.domains[domain]),
    }));
  }, [insightResult]);

  const overallHealth = useMemo(() => computeOverallHealth(domainHealthMap), [domainHealthMap]);

  const assetPieData = Object.entries(
    assets.reduce<Record<string, number>>((acc, s) => {
      acc[s.statementType] = (acc[s.statementType] ?? 0) + s.closingBalance * (s.ownershipPercentage / 100);
      return acc;
    }, {})
  ).map(([label, value]) => ({ label, value })).filter((d) => d.value > 0);

  const liabilityPieData = Object.entries(
    liabilities.reduce<Record<string, number>>((acc, s) => {
      acc[s.statementType] = (acc[s.statementType] ?? 0) + s.closingBalance * (s.ownershipPercentage / 100);
      return acc;
    }, {})
  ).map(([label, value]) => ({ label, value })).filter((d) => d.value > 0);

  const topMovers = latest && previous ? (() => {
    const prevMap = Object.fromEntries(previous.entries.map((e) => [e.statementType, e.closingBalance * (e.ownershipPercentage / 100)]));
    return latest.entries
      .map((e) => ({ label: e.statementType, change: e.closingBalance * (e.ownershipPercentage / 100) - (prevMap[e.statementType] ?? 0) }))
      .filter((m) => m.change !== 0)
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 5);
  })() : [];

  // ---- Domain Detail View ----
  if (selectedDomain) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
        <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
          <View style={{ paddingTop: 16 }}>
            <DomainDetailView
              domain={selectedDomain}
              items={insightResult.domains[selectedDomain]}
              onBack={() => setSelectedDomain(null)}
              isDark={isDark}
            />
          </View>
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---- No snapshots empty state ----
  if (snapshots.length === 0 && !loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
        <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
          <View style={{ paddingTop: 16, paddingBottom: 8 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: textColor }}>Financial Health</Text>
            <Text style={{ color: mutedColor, marginTop: 2 }}>Insights & trends</Text>
          </View>
          <View style={{ backgroundColor: cardBg, borderRadius: 16, borderWidth: 1, borderColor, padding: 32, alignItems: 'center', marginTop: 16 }}>
            <AlertCircle size={40} color={mutedColor} style={{ marginBottom: 12 }} />
            <Text style={{ color: textColor, fontWeight: '600', fontSize: 16, marginBottom: 8, textAlign: 'center' }}>No data yet</Text>
            <Text style={{ color: mutedColor, textAlign: 'center', fontSize: 13 }}>
              Start by recording your first net worth snapshot in the Snapshot tab. Your financial health check will appear here.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const overallSC = STATUS_COLORS[overallHealth.color];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={primaryColor} />}
      >
        <View style={{ paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: textColor }}>Financial Health</Text>
          <Text style={{ color: mutedColor, marginTop: 2 }}>Insights & trends</Text>
        </View>

        {/* Insight summary strip */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor, padding: 10, alignItems: 'center' }}>
            <Text style={{ color: primaryColor, fontSize: 18, fontWeight: '800' }}>{insightResult.summary.total}</Text>
            <Text style={{ color: mutedColor, fontSize: 10 }}>Insights</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor, padding: 10, alignItems: 'center' }}>
            <Text style={{ color: '#dc2626', fontSize: 18, fontWeight: '800' }}>{insightResult.summary.critical}</Text>
            <Text style={{ color: mutedColor, fontSize: 10 }}>Critical</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor, padding: 10, alignItems: 'center' }}>
            <Text style={{ color: isDark ? '#f59e0b' : '#d97706', fontSize: 18, fontWeight: '800' }}>{insightResult.summary.warnings}</Text>
            <Text style={{ color: mutedColor, fontSize: 10 }}>Warnings</Text>
          </View>
        </View>

        {/* Overall health status */}
        <View style={{
          backgroundColor: isDark ? overallSC.darkBg : overallSC.bg,
          borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center',
        }}>
          <StatusDot status={overallHealth.color} isDark={isDark} size={16} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ color: textColor, fontWeight: '700', fontSize: 16 }}>{overallHealth.status}</Text>
            {overallHealth.domainsNeedingAttention > 0 ? (
              <Text style={{ color: mutedColor, fontSize: 12, marginTop: 2 }}>
                {overallHealth.domainsNeedingAttention} area{overallHealth.domainsNeedingAttention !== 1 ? 's' : ''} need attention
              </Text>
            ) : (
              <Text style={{ color: mutedColor, fontSize: 12, marginTop: 2 }}>All domains are healthy</Text>
            )}
          </View>
        </View>

        {/* Per-domain health rows */}
        <Text style={{ color: textColor, fontWeight: '600', fontSize: 15, marginBottom: 10 }}>Health by Domain</Text>
        <View style={{ backgroundColor: cardBg, borderRadius: 16, borderWidth: 1, borderColor, overflow: 'hidden', marginBottom: 16 }}>
          {domainHealthMap.map((dh, i) => (
            <TouchableOpacity
              key={dh.domain}
              onPress={() => setSelectedDomain(dh.domain)}
              style={{
                flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
                borderBottomWidth: i < domainHealthMap.length - 1 ? 1 : 0, borderBottomColor: borderColor,
              }}
            >
              <StatusDot status={dh.status} isDark={isDark} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: textColor, fontWeight: '600', fontSize: 14 }}>{DOMAIN_LABELS[dh.domain]}</Text>
                <Text style={{ color: isDark ? STATUS_COLORS[dh.status].darkText : STATUS_COLORS[dh.status].text, fontSize: 12, marginTop: 1 }}>
                  {dh.verdict}
                </Text>
              </View>
              <ChevronRight size={16} color={mutedColor} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Top Movements */}
        {topMovers.length > 0 ? (
          <>
            <Text style={{ color: textColor, fontWeight: '600', fontSize: 15, marginBottom: 10 }}>Top Movements</Text>
            <View style={{ backgroundColor: cardBg, borderRadius: 14, borderWidth: 1, borderColor, padding: 14, marginBottom: 16 }}>
              {topMovers.map((m, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: i < topMovers.length - 1 ? 1 : 0, borderBottomColor: borderColor }}>
                  <Text style={{ color: textColor, fontSize: 13, flex: 1 }} numberOfLines={1}>{m.label}</Text>
                  <Text style={{ color: m.change >= 0 ? (isDark ? '#6aab8a' : '#16a34a') : '#dc2626', fontWeight: '700', fontSize: 13 }}>
                    {m.change >= 0 ? '+' : ''}{formatCurrency(m.change)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {/* Portfolio Breakdown */}
        <Text style={{ color: textColor, fontWeight: '600', fontSize: 15, marginBottom: 10 }}>Composition</Text>
        <View style={{ marginBottom: 12 }}>
          <PieChart data={assetPieData} title="Asset Breakdown" />
        </View>
        <View style={{ marginBottom: 16 }}>
          <PieChart data={liabilityPieData} title="Liability Breakdown" />
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
