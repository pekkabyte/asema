import { View, TextInput } from "react-native";
import { WebView } from 'react-native-webview';
import { StyleSheet } from 'react-native';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const [text, onChangeText] = useState("https://react.dev");
  const [url, setUrl] = useState("https://react.dev");

  function handleSubmit() {
    setUrl(text)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" backgroundColor="#000000" />
      <WebView
        source={{ uri: url }}
      />
      <WebView
        source={{ uri: url }}
      />
      <TextInput
        onChangeText={onChangeText}
        onSubmitEditing={handleSubmit}
        value={text}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});