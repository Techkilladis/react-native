import {View,Text,StyleSheet,TextInput} from 'react-native';
import React from "react";
import {Link} from "expo-router";

const SignUp = () => {
    return (
        <View>
            <Text>Sign Up</Text>
            <Link href = "/(auth)/sign-in">Sign in to your Account</Link>

        </View>
    )
}
export default SignUp;