import {View,Text,StyleSheet,TextInput} from 'react-native';
import React from "react";
import {Link} from "expo-router";

const SignIn = () => {
    return (
        <View>
            <Text>Sign IN</Text>
            <Link href = "/(auth)/sign-up">Create Account</Link>

        </View>
    )
}
export default SignIn;