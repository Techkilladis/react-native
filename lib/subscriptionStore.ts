import { useState, useEffect } from 'react';
import { HOME_SUBSCRIPTIONS } from '@/constants/data';

let subscriptions: Subscription[] = [...HOME_SUBSCRIPTIONS];
const listeners = new Set<() => void>();

export const subscriptionStore = {
    getSubscriptions() {
        return subscriptions;
    },
    addSubscription(newSub: Subscription) {
        subscriptions = [newSub, ...subscriptions];
        listeners.forEach(listener => listener());
    },
    subscribe(listener: () => void) {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }
};

export const useSubscriptions = () => {
    const [subs, setSubs] = useState<Subscription[]>(subscriptionStore.getSubscriptions());

    useEffect(() => {
        const unsubscribe = subscriptionStore.subscribe(() => {
            setSubs(subscriptionStore.getSubscriptions());
        });
        return unsubscribe;
    }, []);

    return [subs, subscriptionStore.addSubscription] as const;
};
