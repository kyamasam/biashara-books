import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BalanceSummary } from '@/components/home/balance-summary';
import { HOME_ACTIONS, TRANSACTION_GROUPS } from '@/components/home/home-data';
import { HomeHeader } from '@/components/home/home-header';
import { QuickActions } from '@/components/home/quick-actions';
import { TransactionSection } from '@/components/home/transaction-section';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
    const safeAreaInsets = useSafeAreaInsets();
    const theme = useTheme();

    return (
        <ScrollView
            style={[styles.scrollView, { backgroundColor: theme.background }]}
            contentContainerStyle={[
                styles.contentContainer,
                {
                    paddingTop: safeAreaInsets.top + Spacing.three,
                    paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.four,
                    paddingLeft: safeAreaInsets.left + Spacing.two,
                    paddingRight: safeAreaInsets.right + Spacing.two,
                },
            ]}
            showsVerticalScrollIndicator={false}>
            <View style={styles.page}>
                <HomeHeader />
                <BalanceSummary />
                <QuickActions actions={HOME_ACTIONS} />
                <TransactionSection groups={TRANSACTION_GROUPS} />
            </View>
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
        gap: Spacing.three,
    },
});
