import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import HomeScreen from './screens/Home';
import AnotherScreen from './screens/AnotherScreen';
import ReadPDF from './screens/ReadPDF';

const Stack = createNativeStackNavigator();

type StackNavigation = {
  Home: undefined;
  AnotherScreen: undefined;
  ReadPDF: undefined;
};

export type StackTypes = NativeStackNavigationProp<StackNavigation>;

export default function Navigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen name="AnotherScreen" component={AnotherScreen} />
        <Stack.Screen name="ReadPDF" component={ReadPDF} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
