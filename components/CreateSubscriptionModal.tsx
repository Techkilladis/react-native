import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback
} from 'react-native';
import dayjs from 'dayjs';
import { clsx } from 'clsx';
import { icons } from '@/constants/icons';

interface CreateSubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (subscription: Subscription) => void;
}

const CATEGORIES = [
    "Entertainment",
    "AI Tools",
    "Developer Tools",
    "Design",
    "Productivity",
    "Cloud",
    "Music",
    "Other"
];

const CATEGORY_COLORS: Record<string, string> = {
    "Entertainment": "#ffd6e8",
    "AI Tools": "#b8d4e3",
    "Developer Tools": "#e8def8",
    "Design": "#f5c542",
    "Productivity": "#ffdcd2",
    "Cloud": "#dbeafe",
    "Music": "#b8e8d0",
    "Other": "#e2e8f0"
};

const CreateSubscriptionModal = ({ visible, onClose, onSubmit }: CreateSubscriptionModalProps) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
    const [category, setCategory] = useState("Entertainment");
    const [currency, setCurrency] = useState("USD");

    const numericPrice = parseFloat(price);
    const isValid = name.trim().length > 0 && !isNaN(numericPrice) && numericPrice > 0;

    const getSubscriptionIcon = (nameVal: string, catVal: string) => {
        const nameLower = nameVal.toLowerCase().trim();
        if (nameLower.includes("spotify")) return icons.spotify;
        if (nameLower.includes("notion")) return icons.notion;
        if (nameLower.includes("figma")) return icons.figma;
        if (nameLower.includes("github")) return icons.github;
        if (nameLower.includes("claude")) return icons.claude;
        if (nameLower.includes("canva")) return icons.canva;
        if (nameLower.includes("adobe")) return icons.adobe;
        if (nameLower.includes("dropbox")) return icons.dropbox;
        if (nameLower.includes("medium")) return icons.medium;
        if (nameLower.includes("openai")) return icons.openai;

        switch (catVal) {
            case "Entertainment":
                return icons.medium;
            case "AI Tools":
                return icons.openai;
            case "Developer Tools":
                return icons.github;
            case "Design":
                return icons.figma;
            case "Productivity":
                return icons.notion;
            case "Cloud":
                return icons.dropbox;
            case "Music":
                return icons.spotify;
            default:
                return icons.activity;
        }
    };

    const handleSubmit = () => {
        if (!isValid) return;

        const now = dayjs();
        const renewalDate = frequency === "Monthly"
            ? now.add(1, 'month').toISOString()
            : now.add(1, 'year').toISOString();

        const newSubscription: Subscription = {
            id: Date.now().toString(),
            name: name.trim(),
            price: numericPrice,
            frequency,
            category,
            status: "active",
            startDate: now.toISOString(),
            renewalDate,
            icon: getSubscriptionIcon(name, category),
            billing: frequency,
            currency,
            color: CATEGORY_COLORS[category] || "#e2e8f0"
        };

        onSubmit(newSubscription);
        
        // Reset form
        setName("");
        setPrice("");
        setFrequency("Monthly");
        setCategory("Entertainment");
        setCurrency("USD");
        onClose();
    };

    const handleClose = () => {
        // Reset form on close
        setName("");
        setPrice("");
        setFrequency("Monthly");
        setCategory("Entertainment");
        setCurrency("USD");
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={handleClose}>
                <View className="modal-overlay">
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <View className="modal-container h-[85%]">
                            <View className="modal-header">
                                <Text className="modal-title">New Subscription</Text>
                                <Pressable onPress={handleClose} className="modal-close" hitSlop={8}>
                                    <Text className="modal-close-text">✕</Text>
                                </Pressable>
                            </View>

                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                className="flex-1"
                            >
                                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                                    <View className="modal-body pb-10">
                                        {/* Name Field */}
                                        <View className="auth-field">
                                            <Text className="auth-label">Name</Text>
                                            <TextInput
                                                value={name}
                                                onChangeText={setName}
                                                placeholder="e.g. Spotify, Netflix"
                                                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                                className="auth-input"
                                                autoCapitalize="words"
                                            />
                                        </View>

                                        {/* Price Field */}
                                        <View className="auth-field">
                                            <Text className="auth-label">Price</Text>
                                            <TextInput
                                                value={price}
                                                onChangeText={setPrice}
                                                placeholder="0.00"
                                                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                                keyboardType="decimal-pad"
                                                className="auth-input"
                                            />
                                        </View>

                                        {/* Currency Picker */}
                                        <View className="auth-field">
                                            <Text className="auth-label">Currency</Text>
                                            <View className="picker-row">
                                                {["USD", "EUR", "GBP"].map((curr) => (
                                                    <Pressable
                                                        key={curr}
                                                        onPress={() => setCurrency(curr)}
                                                        className={clsx(
                                                            "picker-option",
                                                            currency === curr && "picker-option-active"
                                                        )}
                                                    >
                                                        <Text
                                                            className={clsx(
                                                                "picker-option-text",
                                                                currency === curr && "picker-option-text-active"
                                                            )}
                                                        >
                                                            {curr}
                                                        </Text>
                                                    </Pressable>
                                                ))}
                                            </View>
                                        </View>

                                        {/* Frequency Field */}
                                        <View className="auth-field">
                                            <Text className="auth-label">Billing Frequency</Text>
                                            <View className="picker-row">
                                                <Pressable
                                                    onPress={() => setFrequency("Monthly")}
                                                    className={clsx(
                                                        "picker-option",
                                                        frequency === "Monthly" && "picker-option-active"
                                                    )}
                                                >
                                                    <Text
                                                        className={clsx(
                                                            "picker-option-text",
                                                            frequency === "Monthly" && "picker-option-text-active"
                                                        )}
                                                    >
                                                        Monthly
                                                    </Text>
                                                </Pressable>
                                                <Pressable
                                                    onPress={() => setFrequency("Yearly")}
                                                    className={clsx(
                                                        "picker-option",
                                                        frequency === "Yearly" && "picker-option-active"
                                                    )}
                                                >
                                                    <Text
                                                        className={clsx(
                                                            "picker-option-text",
                                                            frequency === "Yearly" && "picker-option-text-active"
                                                        )}
                                                    >
                                                        Yearly
                                                    </Text>
                                                </Pressable>
                                            </View>
                                        </View>

                                        {/* Category Chips */}
                                        <View className="auth-field">
                                            <Text className="auth-label">Category</Text>
                                            <View className="category-scroll">
                                                {CATEGORIES.map((cat) => (
                                                    <Pressable
                                                        key={cat}
                                                        onPress={() => setCategory(cat)}
                                                        className={clsx(
                                                            "category-chip",
                                                            category === cat && "category-chip-active"
                                                        )}
                                                    >
                                                        <Text
                                                            className={clsx(
                                                                "category-chip-text",
                                                                category === cat && "category-chip-text-active"
                                                            )}
                                                        >
                                                            {cat}
                                                        </Text>
                                                    </Pressable>
                                                ))}
                                            </View>
                                        </View>

                                        {/* Submit Button */}
                                        <Pressable
                                            onPress={handleSubmit}
                                            disabled={!isValid}
                                            className={clsx(
                                                "auth-button mt-4",
                                                !isValid && "auth-button-disabled"
                                            )}
                                        >
                                            <Text className="auth-button-text">Create Subscription</Text>
                                        </Pressable>
                                    </View>
                                </ScrollView>
                            </KeyboardAvoidingView>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default CreateSubscriptionModal;
