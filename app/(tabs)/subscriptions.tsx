import { styled } from "nativewind";
import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, FlatList, ScrollView } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useSubscriptions } from "@/lib/subscriptionStore";
import SubscriptionCard from "@/components/SubscriptionCard";
import { formatCurrency } from "@/lib/utils";
import { colors } from "@/constants/theme";
import { clsx } from "clsx";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
    const [subscriptions] = useSubscriptions();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

    // Extract categories dynamically
    const categories = useMemo(() => {
        const cats = subscriptions.map(sub => sub.category).filter((cat): cat is string => !!cat);
        return ["All", ...Array.from(new Set(cats))];
    }, [subscriptions]);

    // Filtered subscriptions
    const filteredSubscriptions = useMemo(() => {
        return subscriptions.filter(sub => {
            // Category match
            const matchesCategory = selectedCategory === "All" || sub.category === selectedCategory;
            
            // Search query match (name, category, plan, billing)
            const query = searchQuery.trim().toLowerCase();
            const matchesSearch = !query || 
                sub.name.toLowerCase().includes(query) ||
                (sub.category && sub.category.toLowerCase().includes(query)) ||
                (sub.plan && sub.plan.toLowerCase().includes(query)) ||
                sub.billing.toLowerCase().includes(query);

            return matchesCategory && matchesSearch;
        });
    }, [subscriptions, searchQuery, selectedCategory]);

    // Calculate spend (excluding cancelled ones)
    const monthlySpend = useMemo(() => {
        return filteredSubscriptions.reduce((acc, sub) => {
            if (sub.status === 'cancelled') return acc;
            let amount = sub.price;
            if (sub.billing.toLowerCase().includes('year')) {
                amount = sub.price / 12;
            }
            return acc + amount;
        }, 0);
    }, [filteredSubscriptions]);

    return (
        <SafeAreaView className="flex-1 bg-background p-5 pb-0">
            {/* Header Section */}
            <View className="mb-4">
                <Text className="text-3xl font-sans-bold text-primary">Subscriptions</Text>
                <Text className="text-sm font-sans-medium text-muted-foreground mt-1">
                    Manage and track your active plans
                </Text>
            </View>

            {/* Spend Statistics Card */}
            <View className="mb-5 rounded-2xl bg-card border border-border p-4 flex-row justify-between items-center">
                <View>
                    <Text className="text-xs font-sans-semibold text-muted-foreground uppercase tracking-[1px]">Monthly Spend</Text>
                    <Text className="text-2xl font-sans-extrabold text-primary mt-1">{formatCurrency(monthlySpend)}</Text>
                </View>
                <View className="items-end">
                    <Text className="text-xs font-sans-semibold text-muted-foreground uppercase tracking-[1px]">Total Plans</Text>
                    <Text className="text-2xl font-sans-extrabold text-primary mt-1">
                        {filteredSubscriptions.length}
                    </Text>
                </View>
            </View>

            {/* Search Input */}
            <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 py-3.5 mb-4">
                <Feather name="search" size={20} color={colors.mutedForeground} />
                <TextInput
                    placeholder="Search subscriptions..."
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="flex-1 ml-3 text-base font-sans-medium text-primary p-0"
                    autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery("")} hitSlop={10}>
                        <Feather name="x" size={18} color={colors.mutedForeground} />
                    </Pressable>
                )}
            </View>

            {/* Category Chips */}
            <View className="mb-4 h-12 shrink-0">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 20 }}
                >
                    {categories.map((category) => (
                        <Pressable
                            key={category}
                            onPress={() => {
                                setSelectedCategory(category);
                                setExpandedSubscriptionId(null); // Close expanded card when switching category
                            }}
                            className={clsx(
                                "category-chip mr-2 h-10 items-center justify-center",
                                selectedCategory === category && "category-chip-active"
                            )}
                        >
                            <Text
                                className={clsx(
                                    "category-chip-text",
                                    selectedCategory === category && "category-chip-text-active"
                                )}
                            >
                                {category}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Subscriptions List */}
            <FlatList
                data={filteredSubscriptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SubscriptionCard
                        {...item}
                        expanded={expandedSubscriptionId === item.id}
                        onPress={() => setExpandedSubscriptionId(currentId => 
                            currentId === item.id ? null : item.id
                        )}
                    />
                )}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View className="h-4" />}
                ListEmptyComponent={
                    <View className="items-center justify-center py-12 px-4">
                        <Feather name="folder-minus" size={48} color="rgba(0, 0, 0, 0.2)" />
                        <Text className="text-base font-sans-semibold text-muted-foreground mt-4 text-center">
                            No subscriptions found
                        </Text>
                        <Text className="text-sm font-sans-medium text-muted-foreground/60 mt-1 text-center">
                            Try adjusting your search query or filters
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

export default Subscriptions;