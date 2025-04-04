import { TextInput, Button } from "react-native";
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { StyleSheet } from 'react-native';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';

export default function Index() {
  const [text, onChangeText] = useState("https://react.dev");
  const [url, setUrl] = useState("https://react.dev");

  function handleSubmit() {
    setUrl(text)
  }

  return (
    <>
      <StatusBar style="auto" backgroundColor="#000000" />
      <WebView
        style={styles.container}
        source={{ uri: url }}
      />
      <TextInput
        onChangeText={onChangeText}
        onSubmitEditing={handleSubmit}
        value={text}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});