import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useUser, useClerk } from '@clerk/expo';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from "@/constants/images";

const SafeAreaView = styled(RNSafeAreaView);

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const userEmail = user?.emailAddresses?.[0]?.emailAddress || 'No email associated';
  const userName = user?.fullName || user?.username || 'Recurly User';
  const userAvatar = user?.imageUrl ? { uri: user.imageUrl } : images.avatar;

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      {/* Title */}
      <View className="mb-6">
        <Text className="text-3xl font-sans-bold text-primary">Settings</Text>
      </View>

      {/* Profile Card */}
      <View className="sub-card bg-card mb-6">
        <View className="flex-row items-center gap-4 py-2">
          <Image source={userAvatar} className="size-16 rounded-full border border-border" />
          <View className="flex-1">
            <Text className="text-xl font-sans-bold text-primary mb-0.5">{userName}</Text>
            <Text className="text-sm font-sans-medium text-muted-foreground">{userEmail}</Text>
          </View>
        </View>
      </View>

      {/* Account Management Card */}
      <View className="sub-card bg-card gap-4 mb-6">
        <Text className="text-lg font-sans-bold text-primary border-b border-border pb-2">Account</Text>
        
        <View className="flex-row justify-between items-center py-1">
          <Text className="font-sans-semibold text-primary">User ID</Text>
          <Text className="font-sans-medium text-muted-foreground text-sm">{user?.id}</Text>
        </View>

        <View className="flex-row justify-between items-center py-1">
          <Text className="font-sans-semibold text-primary">Joined</Text>
          <Text className="font-sans-medium text-muted-foreground text-sm">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Sign Out Button */}
      <Pressable 
        className="mt-auto items-center rounded-2xl bg-destructive/10 border border-destructive/20 py-4"
        onPress={handleSignOut}
      >
        <Text className="font-sans-bold text-destructive text-base">Sign Out</Text>
      </Pressable>
    </SafeAreaView>
  );
}