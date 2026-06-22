import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Metric = {
  label: string;
  value: string;
  detail: string;
};

type Action = {
  title: string;
  detail: string;
};

type BusinessScreenProps = {
  title: string;
  subtitle: string;
  metrics: Metric[];
  actions: Action[];
};

export function BusinessScreen({ title, subtitle, metrics, actions }: BusinessScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: safeAreaInsets.top + Spacing.four,
          paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.four,
          paddingLeft: safeAreaInsets.left + Spacing.four,
          paddingRight: safeAreaInsets.right + Spacing.four,
        },
      ]}>
      <ThemedView style={styles.page}>
        <View style={styles.header}>
          <ThemedText type="subtitle">{title}</ThemedText>
          <ThemedText themeColor="textSecondary">{subtitle}</ThemedText>
        </View>

        <View style={styles.metricsGrid}>
          {metrics.map((metric) => (
            <ThemedView key={metric.label} type="backgroundElement" style={styles.metricCard}>
              <ThemedText type="small" themeColor="textSecondary">
                {metric.label}
              </ThemedText>
              <ThemedText type="subtitle" style={styles.metricValue}>
                {metric.value}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {metric.detail}
              </ThemedText>
            </ThemedView>
          ))}
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold">Today</ThemedText>
          <View style={styles.actionList}>
            {actions.map((action) => (
              <ThemedView key={action.title} type="backgroundElement" style={styles.actionRow}>
                <View style={styles.actionText}>
                  <ThemedText type="smallBold">{action.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {action.detail}
                  </ThemedText>
                </View>
              </ThemedView>
            ))}
          </View>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
  },
  page: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.one,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  metricCard: {
    minWidth: 180,
    flex: 1,
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  metricValue: {
    lineHeight: 28,
  },
  section: {
    gap: Spacing.two,
  },
  actionList: {
    gap: Spacing.two,
  },
  actionRow: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  actionText: {
    gap: Spacing.half,
  },
});
