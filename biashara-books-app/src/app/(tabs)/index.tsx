import { useCallback, useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BalanceSummary } from '@/components/home/balance-summary';
import { HOME_ACTIONS } from '@/components/home/home-data';
import { HomeHeader } from '@/components/home/home-header';
import { QuickActions } from '@/components/home/quick-actions';
import { TransactionSection } from '@/components/home/transaction-section';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { useTransactionStore } from '@/store/transaction-store';
import { useUserStore } from '@/store/user-store';

export default function HomeScreen() {
    const safeAreaInsets = useSafeAreaInsets();
    const theme = useTheme();
    const { accessToken } = useAuth();
    const isLoadingUser = useUserStore((s) => s.isLoading);
    const fetchUser = useUserStore((s) => s.fetchUser);
    const groups = useTransactionStore((s) => s.groups);
    const isLoadingTransactions = useTransactionStore((s) => s.isLoading);
    const fetchTransactions = useTransactionStore((s) => s.fetchTransactions);

    useEffect(() => {
        if (accessToken) {
            void fetchTransactions(accessToken);
        }
    }, [accessToken, fetchTransactions]);

    const handleRefresh = useCallback(() => {
        if (accessToken) {
            void fetchUser(accessToken);
            void fetchTransactions(accessToken);
        }
    }, [accessToken, fetchUser, fetchTransactions]);

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
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={isLoadingUser || isLoadingTransactions}
                    onRefresh={handleRefresh}
                    tintColor={theme.text}
                    colors={[theme.text]}
                />
            }>
            <View style={styles.page}>
                <HomeHeader />
                <BalanceSummary />
                <QuickActions actions={HOME_ACTIONS} />
                <TransactionSection groups={groups} />
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
