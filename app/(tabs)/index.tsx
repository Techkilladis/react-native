import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import { useClerk, useUser } from '@clerk/expo';
import dayjs from "dayjs";
import { styled } from "nativewind";
import { PostHogProvider } from 'posthog-react-native';
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import { useSubscriptions } from "@/lib/subscriptionStore";

const SafeAreaView = styled(RNSafeAreaView);
export default function App() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const [subscriptions, addSubscription] = useSubscriptions();
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const handleCreateSubscription = (newSub: Subscription) => {
        addSubscription(newSub);
    };

    const renderHeader = () => (
        <View>
            <View className="home-header" >
                <View className="home-user flex-1 mr-3">
                    <Image source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar} className="home-avatar" />
                    <Text className="home-user-name flex-1" numberOfLines={1}>
                        {user?.fullName || user?.emailAddresses?.[0]?.emailAddress || HOME_USER.name}
                    </Text>
                </View>
                <View className="flex-row items-center gap-3">
                    <Pressable
                        onPress={() => signOut()}
                        className="bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-full"
                    >
                        <Text className="text-accent text-xs font-sans-bold">Sign Out</Text>
                    </Pressable>
                    <Pressable onPress={() => setModalVisible(true)}>
                        <Image source={icons.add} className="home-add-icon" />
                    </Pressable>
                </View>
            </View>
            <View className="home-balance-card">
                <Text className="home-balance-label">Balance</Text>
                <View className="home-balance-row">
                    <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
                    <Text className="home-balance-date">{dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}</Text>
                </View>
            </View>
            <View>
                <ListHeading title="Upcoming" />
                <FlatList data={UPCOMING_SUBSCRIPTIONS} renderItem={({ item }) => (
                    <UpcomingSubscriptionCard {...item} />
                )}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    ListEmptyComponent={<Text className="home-empty-state">No Upcoming renewals yet.</Text>}
                />
            </View>
            <ListHeading title="All Subscription" />
        </View>
    );

    return (
        <PostHogProvider apiKey="phc_sobKcs3juNZj7bUx8vgvmPDm97iDagwL8bponoTThPVA" options={{
            // usually 'https://us.i.posthog.com' or 'https://eu.i.posthog.com'

            host: 'https://us.i.posthog.com',
        }}>
            <SafeAreaView className="flex-1 bg-background p-5">
                <FlatList
                    data={subscriptions}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={renderHeader}
                    renderItem={({ item }) => (
                        <SubscriptionCard
                            {...item}
                            expanded={expandedSubscriptionId === item.id}
                            onPress={() => setExpandedSubscriptionId((currentId) =>
                                (currentId === item.id ? null : item.id))
                            }
                        />
                    )}
                    contentContainerStyle={{ paddingBottom: 50 }}
                    showsVerticalScrollIndicator={false}
                    extraData={{ expandedSubscriptionId, subscriptions }}
                    ItemSeparatorComponent={() => <View className={"h-4"}></View>}
                    ListEmptyComponent={<Text className={"home-empty-state"}>No Subscriptions Yet.</Text>}
                    contentContainerClassName="pb-30"
                />
                <CreateSubscriptionModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSubmit={handleCreateSubscription}
                />
            </SafeAreaView >
        </PostHogProvider>

    );
}